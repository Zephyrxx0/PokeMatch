"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import type { Pokemon } from "@/app/types/pokemon";
import { getTypeColor } from "@/app/lib/typeEffectiveness";
import * as THREE from "three";

interface TeamSynergyWebProps {
  team: Pokemon[];
}

function SynergyNode({
  pokemon,
  position,
}: {
  pokemon: Pokemon;
  position: [number, number, number];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = getTypeColor(pokemon.types[0]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.15;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Html position={[0, -0.8, 0]} center>
        <div className="whitespace-nowrap text-[9px] font-bold uppercase tracking-wider text-white bg-black/70 px-1.5 py-0.5 border border-white/20 select-none pointer-events-none">
          {pokemon.name}
        </div>
      </Html>
    </group>
  );
}

function SynergyWeb({ team }: TeamSynergyWebProps) {
  const radius = 2.5;
  const positions = team.map((_, i) => {
    const angle = (i / Math.max(team.length, 1)) * Math.PI * 2;
    return [
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius,
    ] as [number, number, number];
  });

  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Nodes */}
      {team.map((pokemon, i) => (
        <SynergyNode key={pokemon.id} pokemon={pokemon} position={positions[i]} />
      ))}

      {/* Lines connecting all nodes */}
      {team.map((_, i) =>
        team.slice(i + 1).map((_, j) => {
          const targetIndex = i + j + 1;
          const color1 = getTypeColor(team[i].types[0]);
          return (
            <Line
              key={`${i}-${targetIndex}`}
              points={[positions[i], positions[targetIndex]]}
              color={color1}
              lineWidth={1}
              transparent
              opacity={0.25}
            />
          );
        })
      )}

      {/* Center marker */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.15, 0.15, 0.15]} />
        <meshStandardMaterial color="#ffffff" wireframe />
      </mesh>
    </group>
  );
}

export default function TeamSynergyWeb({ team }: TeamSynergyWebProps) {
  if (team.length === 0) {
    return (
      <div className="w-full h-80 border-3 border-dashed border-foreground/20 flex items-center justify-center">
        <p className="text-xs font-bold uppercase opacity-20">
          BUILD A TEAM TO SEE SYNERGY WEB
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-80 bg-[#0a0a0a] border-3 border-foreground relative">
      <div className="absolute top-3 left-3 z-10">
        <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">
          SYNERGY WEB // {team.length} NODES
        </p>
      </div>
      <Canvas camera={{ position: [0, 4, 6], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -5, -10]} intensity={0.3} color="#6890F0" />
        <SynergyWeb team={team} />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={12}
        />
        {/* Grid helper for brutalist aesthetic */}
        <gridHelper args={[10, 10, "#333333", "#222222"]} position={[0, -1.5, 0]} />
      </Canvas>
    </div>
  );
}
