"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

/* ------------------------------------------------------------------ *
 * Code-only 3D. No model files, no external textures (canvas textures
 * are same-origin so there's no CORS/CSP issue). Cream + amber to match
 * the site. Everything animates with transform/opacity on the GPU.
 * ------------------------------------------------------------------ */

/** Draw the printed "Pro Pass" ticket face onto a 2D canvas → texture. */
function usePassTexture() {
  return useMemo(() => {
    const w = 512;
    const h = 720;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;

    // cream ticket background
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#fff7e0");
    g.addColorStop(1, "#fde9c0");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // punched hole
    ctx.fillStyle = "#2a1508";
    ctx.beginPath();
    ctx.arc(w / 2, 54, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = "center";
    ctx.fillStyle = "#7c5a2e";
    ctx.font = "700 26px system-ui, sans-serif";
    ctx.fillText("S O F T W A R E   H U B", w / 2, 150);

    ctx.fillStyle = "#1c1917";
    ctx.font = "800 128px system-ui, sans-serif";
    ctx.fillText("PRO", w / 2, 300);
    ctx.fillText("PASS", w / 2, 420);

    // dashed tear line
    ctx.strokeStyle = "#1c1917";
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 12]);
    ctx.beginPath();
    ctx.moveTo(40, 490);
    ctx.lineTo(w - 40, 490);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#b45309";
    ctx.font = "italic 700 46px Georgia, serif";
    ctx.fillText("35 tools · 1 year", w / 2, 560);

    ctx.fillStyle = "#9a8358";
    ctx.font = "600 26px ui-monospace, monospace";
    ctx.fillText("SHP-P-••••-••••", w / 2, 640);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, []);
}

/** Small orbiting tile with a single letter (brand-ish), canvas texture. */
function tileTexture(letter: string, bg: string, fg: string) {
  const s = 128;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, s, s);
  ctx.fillStyle = fg;
  ctx.font = "800 78px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, s / 2, s / 2 + 4);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const TILES = [
  { letter: "C", bg: "#111827", fg: "#ffffff", angle: 0, r: 2.6, y: 1.1 },
  { letter: "N", bg: "#ffffff", fg: "#111827", angle: 1.15, r: 2.7, y: -0.4 },
  { letter: "L", bg: "#5b57d1", fg: "#ffffff", angle: 2.3, r: 2.5, y: 1.4 },
  { letter: "F", bg: "#0a0a0a", fg: "#ffffff", angle: 3.5, r: 2.75, y: -1.2 },
  { letter: "S", bg: "#3ecf8e", fg: "#04231a", angle: 4.7, r: 2.6, y: 0.6 },
];

function OrbitTiles() {
  const group = useRef<THREE.Group>(null);
  const texes = useMemo(() => TILES.map((t) => tileTexture(t.letter, t.bg, t.fg)), []);
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.25;
  });
  return (
    <group ref={group}>
      {TILES.map((t, i) => (
        <Float key={i} speed={2} rotationIntensity={0.6} floatIntensity={0.6}>
          <mesh position={[Math.cos(t.angle) * t.r, t.y, Math.sin(t.angle) * t.r]} rotation={[0, -t.angle, 0]}>
            <boxGeometry args={[0.62, 0.62, 0.12]} />
            <meshStandardMaterial map={texes[i]} metalness={0.25} roughness={0.45} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function Card() {
  const g = useRef<THREE.Group>(null);
  const tex = usePassTexture();
  const { pointer } = useThree();

  useFrame((_, dt) => {
    if (!g.current) return;
    // slow auto-spin + ease toward the pointer
    const targetY = pointer.x * 0.5 + 0.15;
    const targetX = -pointer.y * 0.35;
    g.current.rotation.y += (targetY - g.current.rotation.y) * Math.min(1, dt * 3);
    g.current.rotation.x += (targetX - g.current.rotation.x) * Math.min(1, dt * 3);
  });

  return (
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.7}>
      <group ref={g} rotation={[0, 0.15, 0]}>
        {/* glossy amber body */}
        <RoundedBox args={[2.5, 3.5, 0.18]} radius={0.16} smoothness={6} castShadow>
          <meshStandardMaterial color="#f59e0b" metalness={0.45} roughness={0.22} envMapIntensity={1.4} />
        </RoundedBox>
        {/* printed cream face */}
        <mesh position={[0, 0, 0.1]}>
          <planeGeometry args={[2.24, 3.18]} />
          <meshStandardMaterial map={tex} roughness={0.55} metalness={0.05} />
        </mesh>
      </group>
    </Float>
  );
}

export default function ProPass3D() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[440px]">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 7], fov: 40 }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 6, 5]} intensity={1.3} />
        <directionalLight position={[-5, -2, 2]} intensity={0.4} color="#ffe6b0" />
        <OrbitTiles />
        <Card />
        {/* inline env (no network fetch) for glossy reflections */}
        <Environment resolution={128}>
          <Lightformer form="rect" intensity={3} position={[0, 3, 4]} scale={[8, 5, 1]} />
          <Lightformer form="rect" intensity={1.4} color="#fff2d8" position={[-4, 1, 2]} scale={[4, 4, 1]} />
          <Lightformer form="circle" intensity={1.2} position={[3, -2, 3]} scale={3} />
        </Environment>
      </Canvas>
    </div>
  );
}
