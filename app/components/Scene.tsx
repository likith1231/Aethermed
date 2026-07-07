"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { Float } from "@react-three/drei";

/* ─────────────────────────────────────────────
   Translucent Floating Node/Sphere
   High reflectivity, glowing teal/blue/cyan colors for light mode
   ───────────────────────────────────────────── */
interface BubbleProps {
  position: [number, number, number];
  scale: number;
  color: string;
  speed: number;
  floatIntensity: number;
}

function Bubble({ position, scale, color, speed, floatIntensity }: BubbleProps) {
  const meshRef = useRef<Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    meshRef.current.position.y =
      position[1] + Math.sin(t) * floatIntensity;
    meshRef.current.position.x =
      position[0] + Math.cos(t * 0.7) * floatIntensity * 0.4;
    meshRef.current.rotation.x = t * 0.15;
    meshRef.current.rotation.z = t * 0.1;
  });

  return (
    <Float speed={speed * 0.6} floatIntensity={floatIntensity * 0.3} rotationIntensity={0.2}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.06} /* Lower opacity for subtle contrast in light mode */
          roughness={0.1}
          metalness={0.6}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
          ior={1.5}
          transmission={0.9}
          thickness={1.0} />
      </mesh>
    </Float>
  );
}

/* ─────────────────────────────────────────────
   Scene Composition
   Teal and soft blue nodes suitable for light background
   ───────────────────────────────────────────── */
const bubbles: BubbleProps[] = [
  { position: [-6, 3, -4], scale: 1.2, color: "#0d9488", speed: 0.35, floatIntensity: 0.7 },
  { position: [5, -2, -6], scale: 1.8, color: "#3b82f6", speed: 0.28, floatIntensity: 0.9 },
  { position: [-3, -3, -3], scale: 0.9, color: "#06b6d4", speed: 0.45, floatIntensity: 0.55 },
  { position: [7, 4, -9], scale: 2.2, color: "#60a5fa", speed: 0.22, floatIntensity: 1.1 },
  { position: [-8, -1, -7], scale: 1.4, color: "#0d9488", speed: 0.32, floatIntensity: 0.75 },
  { position: [2, 5, -11], scale: 2.6, color: "#3b82f6", speed: 0.18, floatIntensity: 0.95 },
  { position: [0, -4, -5], scale: 1.1, color: "#06b6d4", speed: 0.4, floatIntensity: 0.5 },
  { position: [-5, 4, -8], scale: 1.5, color: "#60a5fa", speed: 0.27, floatIntensity: 1.0 },
  { position: [8, -3, -10], scale: 1.4, color: "#0d9488", speed: 0.36, floatIntensity: 0.6 },
  { position: [3, 1, -4], scale: 0.8, color: "#3b82f6", speed: 0.42, floatIntensity: 0.5 },
];

export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, 5]} intensity={0.3} color="#06b6d4" />
      {bubbles.map((b, i) => (
        <Bubble key={i} {...b} />
      ))}
    </Canvas>
  );
}
