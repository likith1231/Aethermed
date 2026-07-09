"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Mesh, Group } from "three";
import * as THREE from "three";

/* ─────────────────────────────────────────────
   Glossy 3D Glass Orb
   Off-center radial highlight via meshPhysicalMaterial
   with clearcoat, transmission, and specular reflection
   ───────────────────────────────────────────── */
interface OrbProps {
  position: [number, number, number];
  scale: number;
  color: string;
  speed: number;           // animation speed multiplier
  floatIntensity: number;  // amplitude of drift
  opacity: number;         // base material opacity
  isForeground: boolean;   // sharp hero orb vs soft background
}

function GlassOrb({
  position,
  scale,
  color,
  speed,
  floatIntensity,
  opacity,
  isForeground,
}: OrbProps) {
  const meshRef = useRef<Mesh>(null!);
  const startPos = useRef(position);
  const reducedMotion = useReducedMotion();

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime * speed;
    // Slow sinusoidal drift — 15-25s effective period at speed 0.2–0.4
    meshRef.current.position.x =
      startPos.current[0] + Math.sin(t * 0.8) * floatIntensity * 0.6;
    meshRef.current.position.y =
      startPos.current[1] + Math.cos(t * 0.6) * floatIntensity;
    meshRef.current.position.z =
      startPos.current[2] + Math.sin(t * 0.4) * floatIntensity * 0.3;
    // Very slow rotation for shimmer
    meshRef.current.rotation.x = t * 0.08;
    meshRef.current.rotation.y = t * 0.05;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={opacity}
        roughness={isForeground ? 0.05 : 0.15}
        metalness={isForeground ? 0.1 : 0.05}
        clearcoat={isForeground ? 1.0 : 0.6}
        clearcoatRoughness={0.05}
        ior={1.45}
        transmission={isForeground ? 0.92 : 0.85}
        thickness={isForeground ? 1.5 : 0.8}
        envMapIntensity={1.2}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ─────────────────────────────────────────────
   Mouse Parallax Layer
   Wraps foreground orbs and shifts them a few px
   based on pointer position — desktop only
   ───────────────────────────────────────────── */
function ParallaxGroup({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<Group>(null!);
  const { pointer } = useThree();
  const reducedMotion = useReducedMotion();

  useFrame(() => {
    if (reducedMotion || !groupRef.current) return;
    // Subtle shift: ±0.3 units max (~few pixels on screen)
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      pointer.x * 0.3,
      0.02
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      pointer.y * 0.2,
      0.02
    );
  });

  return <group ref={groupRef}>{children}</group>;
}

/* ─────────────────────────────────────────────
   Reduced Motion Hook
   ───────────────────────────────────────────── */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return reduced;
}

/* ─────────────────────────────────────────────
   Orb Configuration
   Edge-biased positions so they don't overlap
   dense data tables on doctor/admin pages.
   Mix of foreground (sharp, close) and
   background (distant, smaller, more transparent)
   ───────────────────────────────────────────── */
const orbs: OrbProps[] = [
  // ── FOREGROUND HERO ORBS (sharp, close, larger) ──
  {
    position: [-5.5, 3.5, -2],
    scale: 2.2,
    color: "#0d9488",
    speed: 0.22,
    floatIntensity: 0.6,
    opacity: 0.12,
    isForeground: true,
  },
  {
    position: [6, -2.5, -1.5],
    scale: 1.8,
    color: "#06b6d4",
    speed: 0.18,
    floatIntensity: 0.7,
    opacity: 0.10,
    isForeground: true,
  },
  {
    position: [4.5, 4, -3],
    scale: 2.8,
    color: "#3b82f6",
    speed: 0.15,
    floatIntensity: 0.5,
    opacity: 0.08,
    isForeground: true,
  },

  // ── MIDGROUND ORBS ──
  {
    position: [-7, -3, -6],
    scale: 1.2,
    color: "#14b8a6",
    speed: 0.28,
    floatIntensity: 0.8,
    opacity: 0.07,
    isForeground: false,
  },
  {
    position: [7.5, 1.5, -7],
    scale: 1.0,
    color: "#60a5fa",
    speed: 0.32,
    floatIntensity: 0.9,
    opacity: 0.06,
    isForeground: false,
  },

  // ── BACKGROUND ORBS (distant, small, faint) ──
  {
    position: [-3, -5, -12],
    scale: 0.5,
    color: "#0d9488",
    speed: 0.35,
    floatIntensity: 0.4,
    opacity: 0.04,
    isForeground: false,
  },
  {
    position: [2, 6, -14],
    scale: 0.35,
    color: "#06b6d4",
    speed: 0.4,
    floatIntensity: 0.35,
    opacity: 0.04,
    isForeground: false,
  },
  {
    position: [-8, 5, -10],
    scale: 0.6,
    color: "#3b82f6",
    speed: 0.25,
    floatIntensity: 0.5,
    opacity: 0.05,
    isForeground: false,
  },
  {
    position: [8, -4, -11],
    scale: 0.4,
    color: "#14b8a6",
    speed: 0.38,
    floatIntensity: 0.3,
    opacity: 0.03,
    isForeground: false,
  },
];

/* ─────────────────────────────────────────────
   Scene Composition
   Foreground orbs get mouse parallax,
   background orbs float independently
   ───────────────────────────────────────────── */
export default function Scene() {
  const foreground = useMemo(() => orbs.filter((o) => o.isForeground), []);
  const background = useMemo(() => orbs.filter((o) => !o.isForeground), []);

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      dpr={[1, 1.5]} /* perf: cap pixel ratio */
    >
      {/* Lighting: key + fill + accent for glass refraction highlights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={0.9} />
      <directionalLight position={[-4, -3, 3]} intensity={0.3} color="#e0f2fe" />
      <pointLight position={[0, 5, 8]} intensity={0.4} color="#ccfbf1" />
      <pointLight position={[-6, -4, 6]} intensity={0.2} color="#bae6fd" />

      {/* Background orbs — no parallax, just floating */}
      {background.map((o, i) => (
        <GlassOrb key={`bg-${i}`} {...o} />
      ))}

      {/* Foreground orbs — with mouse parallax on desktop */}
      <ParallaxGroup>
        {foreground.map((o, i) => (
          <GlassOrb key={`fg-${i}`} {...o} />
        ))}
      </ParallaxGroup>
    </Canvas>
  );
}
