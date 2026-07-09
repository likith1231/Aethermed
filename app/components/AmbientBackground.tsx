"use client";

import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────
   AmbientBackground
   60 small glass orbs drifting across the full
   viewport on randomized paths. Renders once in
   the root layout — every route inherits it.

   • position: fixed, z-index: -1, pointer-events: none
   • overflow: hidden on THIS container (not body)
   • prefers-reduced-motion pauses all animation
   • Pure CSS — no Three.js, no framer-motion
   ───────────────────────────────────────────── */

interface Bubble {
  id: number;
  size: number;           // px diameter
  x: number;              // start % from left
  y: number;              // start % from top
  color: string;          // base teal/cyan/blue
  highlightColor: string; // lighter specular
  shadowColor: string;    // drop shadow color
  blur: number;           // filter blur px
  opacity: number;
  duration: number;       // animation duration in seconds
  delay: number;          // animation delay in seconds
  driftX: number;         // how far to drift horizontally (vw)
  driftY: number;         // how far to drift vertically (vh)
  isHero: boolean;        // sharper, slightly larger
}

const PALETTE = [
  { color: "#0d9488", highlight: "#5eead4", shadow: "rgba(13,148,136,0.25)" },
  { color: "#06b6d4", highlight: "#a5f3fc", shadow: "rgba(6,182,212,0.20)" },
  { color: "#3b82f6", highlight: "#bfdbfe", shadow: "rgba(59,130,246,0.18)" },
  { color: "#14b8a6", highlight: "#99f6e4", shadow: "rgba(20,184,166,0.22)" },
  { color: "#0ea5e9", highlight: "#bae6fd", shadow: "rgba(14,165,233,0.18)" },
];

function generateBubbles(): Bubble[] {
  const bubbles: Bubble[] = [];
  const count = 60;

  for (let i = 0; i < count; i++) {
    const palette = PALETTE[i % PALETTE.length];
    const isHero = i < 4; // first 4 are hero bubbles

    // Size: hero 100-150px, medium 60-100px, small 20-55px
    let size: number;
    if (isHero) {
      size = 100 + Math.floor(Math.random() * 50); // 100-150
    } else if (i < 20) {
      size = 60 + Math.floor(Math.random() * 40);  // 60-100
    } else {
      size = 20 + Math.floor(Math.random() * 35);  // 20-55
    }

    // Bias positions toward edges/corners
    const edgeBias = Math.random() > 0.5;
    const x = edgeBias
      ? (Math.random() > 0.5 ? Math.random() * 25 : 75 + Math.random() * 25)
      : Math.random() * 100;
    const y = Math.random() * 100;

    // Drift range: larger drift for smaller bubbles (they roam more)
    const driftX = (30 + Math.random() * 40) * (Math.random() > 0.5 ? 1 : -1);
    const driftY = (20 + Math.random() * 30) * (Math.random() > 0.5 ? 1 : -1);

    bubbles.push({
      id: i,
      size,
      x,
      y,
      color: palette.color,
      highlightColor: palette.highlight,
      shadowColor: palette.shadow,
      blur: isHero ? 0 : (i < 20 ? 8 : 20 + Math.random() * 20),
      opacity: isHero ? 0.14 : (i < 20 ? 0.10 : 0.07),
      duration: 20 + Math.random() * 20, // 20-40s
      delay: -(Math.random() * 20),      // stagger start
      driftX,
      driftY,
      isHero,
    });
  }

  return bubbles;
}

export default function AmbientBackground() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setBubbles(generateBubbles());

    // Check reduced motion preference
    if (typeof window !== "undefined") {
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mql.matches);
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }
  }, []);

  if (bubbles.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -1 }}
    >
      {/* Inline keyframes — generated per-bubble for unique drift paths */}
      <style>{`
        ${bubbles.map((b) => `
          @keyframes drift-${b.id} {
            0% {
              transform: translate(0, 0) scale(1);
            }
            25% {
              transform: translate(${b.driftX * 0.6}vw, ${b.driftY * 0.3}vh) scale(${b.isHero ? 1.04 : 1.02});
            }
            50% {
              transform: translate(${b.driftX}vw, ${b.driftY}vh) scale(1);
            }
            75% {
              transform: translate(${b.driftX * 0.4}vw, ${b.driftY * 0.8}vh) scale(${b.isHero ? 0.97 : 0.98});
            }
            100% {
              transform: translate(0, 0) scale(1);
            }
          }
        `).join("\n")}
      `}</style>

      {bubbles.map((b) => (
        <div
          key={b.id}
          style={{
            position: "absolute",
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            borderRadius: "50%",
            opacity: b.opacity,
            filter: b.blur > 0 ? `blur(${b.blur}px)` : undefined,
            boxShadow: b.isHero
              ? `0 8px 32px ${b.shadowColor}, inset 0 -4px 12px rgba(0,0,0,0.06)`
              : `0 4px 16px ${b.shadowColor}`,
            /* 3D glass sphere: off-center radial gradient + specular highlight */
            background: `
              radial-gradient(circle at 30% 25%, ${b.highlightColor}88 0%, transparent 40%),
              radial-gradient(circle at 35% 30%, ${b.highlightColor} 0%, ${b.color} 55%, ${b.color}88 100%)
            `,
            animation: reducedMotion
              ? "none"
              : `drift-${b.id} ${b.duration}s ease-in-out ${b.delay}s infinite`,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
