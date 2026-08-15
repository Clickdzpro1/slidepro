"use client";

import { useLayoutEffect, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface PresentonSplashLoaderProps {
  message?: string;
  className?: string;
}

export const PRESENTON_SPLASH_MIN_DURATION_MS = 3000;

const SPLASH_ANIMATION_MS = 2600;

let splashSessionStartedAt: number | null = null;

function markSplashSessionStart(): number {
  if (splashSessionStartedAt === null) {
    splashSessionStartedAt = Date.now();
  }
  return splashSessionStartedAt;
}

function getSplashAnimationDelayMs(): number {
  const elapsed = Date.now() - markSplashSessionStart();
  return -Math.min(elapsed, SPLASH_ANIMATION_MS);
}

export function PresentonSplashLoader({
  message = "Preparing your workspace...",
  className,
}: PresentonSplashLoaderProps) {
  const [animationDelayMs, setAnimationDelayMs] = useState(0);

  useLayoutEffect(() => {
    setAnimationDelayMs(getSplashAnimationDelayMs());
  }, []);

  const containerStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 2147483000,
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "center",
    gap: "24px",
    overflow: "hidden",
    background: "#ffffff",
  };

  const surfaceStyle: CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "142vmax",
    height: "142vmax",
    borderRadius: "50%",
    background: "#7C51F8",
    transform: "translate3d(-50%, -50%, 0) scale(0.001)",
    animation: `presenton-splash-surface-grow ${SPLASH_ANIMATION_MS}ms linear ${animationDelayMs}ms both`,
    willChange: "transform",
    backfaceVisibility: "hidden",
  };

  return (
    <main
      aria-busy="true"
      aria-label={message}
      className={cn("presenton-splash-loader", className)}
      role="status"
      style={containerStyle}
    >
      <div
        className="presenton-splash-surface"
        aria-hidden="true"
        style={surfaceStyle}
      />
      <span
        style={{
          position: "relative",
          zIndex: 1,
          fontFamily: "'Unbounded', 'Syne', sans-serif",
          fontSize: "clamp(2rem, 8vw, 4.5rem)",
          fontWeight: 700,
          color: "#ffffff",
          opacity: 0,
          animation: `presenton-splash-text-reveal ${SPLASH_ANIMATION_MS}ms linear ${animationDelayMs}ms both`,
          letterSpacing: "-0.02em",
        }}
      >
        SlidePro
      </span>
      <span
        style={{
          position: "relative",
          zIndex: 1,
          fontFamily: "'Manrope', 'Inter', sans-serif",
          fontSize: "0.875rem",
          color: "rgba(255,255,255,0.70)",
          opacity: 0,
          animation: `presenton-splash-text-reveal ${SPLASH_ANIMATION_MS}ms linear ${(animationDelayMs || 0) + 200}ms both`,
        }}
      >
        by ClickDz
      </span>
    </main>
  );
}
