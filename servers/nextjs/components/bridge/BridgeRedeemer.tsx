'use client';

/**
 * BridgeRedeemer — detects bridge_code + username query params (set by the
 * ClickDz Work panel when iframing /slidepro) and auto-provisions a presenton
 * session via /api/bridge-redeem. On success, reloads the page so the
 * presenton_session cookie takes effect. On failure, does nothing (the
 * presenton app will show its own login flow as a fallback).
 *
 * This is the microfrontend replacement for the shim's ticket-redemption.
 * It runs client-side, same-origin, and sets a first-party cookie.
 */

import { useEffect, useState } from 'react';

export function BridgeRedeemer() {
  const [status, setStatus] = useState<'idle' | 'provisioning' | 'done' | 'error'>('idle');

  useEffect(() => {
    // Only run in the browser
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const bridgeCode = params.get('bridge_code') || params.get('ticket');
    const username = params.get('username');

    if (!bridgeCode || !username) {
      // No bridge params — not an embedded session, do nothing
      return;
    }

    // Avoid re-running on the reload after cookie is set
    if (sessionStorage.getItem('bridge-redeemed') === '1') {
      // Clean the URL: remove bridge params after successful redemption
      const url = new URL(window.location.href);
      url.searchParams.delete('bridge_code');
      url.searchParams.delete('ticket');
      url.searchParams.delete('username');
      window.history.replaceState({}, '', url.toString());
      sessionStorage.removeItem('bridge-redeemed');
      setStatus('done');
      return;
    }

    setStatus('provisioning');

    // Call the same-origin /api/bridge-redeem route
    // The basePath is already applied by Next.js, so we use a relative path
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/bridge-redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ticket: bridgeCode, username }),
    })
      .then(async (resp) => {
        if (resp.ok) {
          const data = await resp.json();
          if (data.ok) {
            // Mark as redeemed so the reload doesn't re-trigger
            sessionStorage.setItem('bridge-redeemed', '1');
            // Reload the page so the presenton_session cookie takes effect
            window.location.reload();
            return;
          }
        }
        console.warn('[BridgeRedeemer] Provisioning failed:', resp.status);
        setStatus('error');
      })
      .catch((e) => {
        console.warn('[BridgeRedeemer] Error:', e);
        setStatus('error');
      });
  }, []);

  // This component renders nothing — it's a side-effect-only component
  return null;
}
