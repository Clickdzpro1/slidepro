import AuthGate from "@/components/Auth/AuthGate";
import Home from "@/components/Home";
import { ConfigurationInitializer } from "./ConfigurationInitializer";
import { isAuthDisabled } from "@/utils/auth";
import { getServerAuthStatus } from "@/utils/serverAuth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// ---------------------------------------------------------------------------
// Server-side Bridge Auto-Provision
// ---------------------------------------------------------------------------
// Handles ?bridge_code=X&username=Y (set by ClickDz Work panel when iframing
// /slidepro). Provisions a Presenton session BEFORE AuthGate renders.
// Works for NEW accounts (auto-creates) AND EXISTING accounts (looks up by
// case-insensitive username — idempotent). No sign-in flash.
// ---------------------------------------------------------------------------

async function tryProvision(code: string, username: string): Promise<string | null> {
  const base = (process.env.FAST_API_INTERNAL_URL || process.env.NEXT_PUBLIC_FAST_API || "")
    .replace(/\/+$/, "");
  const secret = (process.env.BRIDGE_PROVISION_SECRET || "").trim();
  if (!base || !secret) return null;
  try {
    const r = await fetch(`${base}/api/v1/admin/bridge-provision`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ username, password: code.padEnd(8, "x").slice(0, 128) }),
    });
    if (!r.ok) return null;
    const d = await r.json();
    if (!d.cookie_name || !d.cookie_value) return null;
    return d.cookie_value as string;
  } catch { return null; }
}

export default async function Page(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  // --------------------------------------------------------------------
  // 1. Bridge auto-provision (server-side, BEFORE any render)
  // --------------------------------------------------------------------
  let bridgeCode = "";
  let bridgeUser = "";
  try {
    if (props.searchParams) {
      const sp = await props.searchParams;
      bridgeCode = String(sp.bridge_code || sp.ticket || "");
      bridgeUser = String(sp.username || "");
    }
  } catch { /* props.searchParams might be undefined in older Next.js */ }

  if (bridgeCode && bridgeUser) {
    const sessionVal = await tryProvision(bridgeCode, bridgeUser);
    if (sessionVal) {
      const c = await cookies();
      c.set("presenton_session", sessionVal, {
        path: "/", httpOnly: true, sameSite: "lax", secure: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      redirect("/");
      return null; // unreachable
    }
  }

  // --------------------------------------------------------------------
  // 2. Normal auth flow
  // --------------------------------------------------------------------
  if (isAuthDisabled()) {
    return (<ConfigurationInitializer><Home /></ConfigurationInitializer>);
  }

  const status = await getServerAuthStatus();
  if (status.configured && status.authenticated) {
    return (<ConfigurationInitializer><Home /></ConfigurationInitializer>);
  }

  return <AuthGate />;
}
