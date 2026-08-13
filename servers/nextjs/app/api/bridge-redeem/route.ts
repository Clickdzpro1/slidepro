/**
 * App Router API route: /api/bridge-redeem
 *
 * Auto-provisions a presenton user and sets their session cookie as a
 * first-party cookie on work.clickdz.ai. This is the microfrontend replacement
 * for the slidepro-shim's ticket-redemption flow.
 *
 * Flow:
 *   1. The ClickDz Work panel iframes /slidepro?bridge_code=X&username=Y
 *   2. The presenton frontend detects the params and POSTs to /api/bridge-redeem
 *   3. This route calls the FastAPI backend's /api/v1/admin/bridge-provision
 *      server-to-server (using BRIDGE_PROVISION_SECRET)
 *   4. FastAPI creates the user if new (idempotent) + returns a session cookie
 *   5. This route sets the presenton_session cookie as first-party on
 *      work.clickdz.ai and returns success
 *   6. The frontend reloads → presenton sees the session cookie → logged in
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FAST_API_URL = (process.env.FAST_API_INTERNAL_URL || process.env.NEXT_PUBLIC_FAST_API || "").replace(/\/+$/, "");
const BRIDGE_PROVISION_SECRET = process.env.BRIDGE_PROVISION_SECRET || "";

interface BridgeProvisionResponse {
  cookie_name: string;
  cookie_value: string;
  user_id: string;
}

export async function POST(req: NextRequest) {
  let body: { ticket?: string; username?: string; secret?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { ticket, username, secret } = body;

  // Auth: either a valid bridge_code (ticket from the panel) OR the
  // BRIDGE_PROVISION_SECRET (for direct admin calls).
  if (!ticket && !secret) {
    return NextResponse.json({ error: "Missing ticket or secret" }, { status: 401 });
  }
  if (secret && secret !== BRIDGE_PROVISION_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  if (!username || typeof username !== "string" || username.length < 3) {
    return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 422 });
  }

  // The password for the presenton user — use the ticket as a temp password.
  // The user never sees this; it's auto-managed by the bridge.
  const password = (ticket || "").padEnd(8, "x").slice(0, 128);

  if (!FAST_API_URL) {
    return NextResponse.json({ error: "FastAPI URL not configured" }, { status: 500 });
  }

  if (!BRIDGE_PROVISION_SECRET) {
    return NextResponse.json({ error: "BRIDGE_PROVISION_SECRET not configured" }, { status: 500 });
  }

  try {
    const resp = await fetch(`${FAST_API_URL}/api/v1/admin/bridge-provision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BRIDGE_PROVISION_SECRET}`,
      },
      body: JSON.stringify({ username, password }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      console.error("[bridge-redeem] FastAPI returned", resp.status, text.slice(0, 200));
      return NextResponse.json({ error: "Provisioning failed", detail: text.slice(0, 200) }, { status: resp.status });
    }

    const data = (await resp.json()) as BridgeProvisionResponse;

    if (!data.cookie_name || !data.cookie_value) {
      return NextResponse.json({ error: "Invalid response from backend" }, { status: 500 });
    }

    // Set the presenton session cookie as a first-party cookie on
    // work.clickdz.ai. SameSite=Lax is fine (same-site navigation/iframe).
    const response = NextResponse.json({
      ok: true,
      cookie_name: data.cookie_name,
      user_id: data.user_id,
    });
    response.cookies.set(data.cookie_name, data.cookie_value, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days (matches SESSION_TTL_SECONDS)
    });
    return response;
  } catch (e) {
    console.error("[bridge-redeem] Error:", e);
    return NextResponse.json({ error: "Backend unreachable", detail: String(e).slice(0, 200) }, { status: 502 });
  }
}
