'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: { sitekey: string; callback: (t: string) => void; 'expired-callback'?: () => void; theme?: string },
      ) => string;
      reset: (id?: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

export default function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!SITE_KEY) return;
    const tryRender = () => {
      if (window.turnstile && widgetRef.current && widgetIdRef.current === null) {
        widgetIdRef.current = window.turnstile.render(widgetRef.current, {
          sitekey: SITE_KEY,
          callback: onToken,
          'expired-callback': () => onToken(''),
          theme: 'light',
        });
      }
    };
    window.onTurnstileLoad = tryRender;
    tryRender();
  }, [onToken]);

  if (!SITE_KEY) return null;
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad"
        strategy="afterInteractive"
        async
        defer
      />
      <div ref={widgetRef} className="flex justify-center" />
    </>
  );
}
