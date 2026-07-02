import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider, CylinderCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { getThemeConfig } from '../../utils/themeManager';
import { JumpPad } from '../LevelObstacles';
import { audioManager } from '../../utils/audioManager';

// Dynamic Star Prop that can be collected
interface StarProps {
  position: [number, number, number];
  onCollect: () => void;
  color: string;
}

const FloatingStar: React.FC<StarProps> = ({ position, onCollect, color }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 3.5;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 5.0) * 0.2;
    }
  });

  const handleEnter = (event: any) => {
    const target = event.rigidBodyObject;
    if (target && (target.name === 'player' || target.name === 'bot')) {
      const racerId = target.name === 'player' ? 'player' : target.userData?.id || 'bot';
      useGameStore.getState().updateScore(racerId, 1);
      audioManager.playClick();
      onCollect();
    }
  };

  return (
    <group position={position} name="star">
      {/* Visual Star */}
      <mesh ref={meshRef} castShadow>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color={color} roughness={0.1} metalness={0.9} emissive={color} emissiveIntensity={0.7} />
      </mesh>
      {/* Glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.04, 6, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} transparent opacity={0.5} />
      </mesh>

      {/* Sensor */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.6, 0.6, 0.6]} sensor onIntersectionEnter={handleEnter} />
      </RigidBody>
    </group>
  );
};

export const Hunt1: React.FC = () => {
  const theme = useGameStore((state) => state.visualTheme);
  const config = getThemeConfig(theme);

  // Large pool of star positions across the expanded arena
  const STAR_POSITIONS: [number, number, number][] = [
    // Ground level
    [-7, 0.8, -7], [7, 0.8, -7], [-7, 0.8, 7], [7, 0.8, 7],
    [0, 0.8, 0],
    [-4, 0.8, -4], [4, 0.8, -4], [-4, 0.8, 4], [4, 0.8, 4],
    [-7, 0.8, 0], [7, 0.8, 0], [0, 0.8, -7], [0, 0.8, 7],
    // Elevated platform level
    [-3, 2.0, 0], [3, 2.0, 0],
    [0, 2.0, -3], [0, 2.0, 3],
    [-3, 2.0, -3], [3, 2.0, 3],
    // High positions (above jump pads)
    [-4, 3.8, -4], [4, 3.8, 4],
    [0, 3.8, -5], [0, 3.8, 5],
    // Corner towers
    [-6, 2.8, -6], [6, 2.8, -6], [-6, 2.8, 6], [6, 2.8, 6],
  ];

  const INITIAL_COUNT = 8;

  const [activeStarPos, setActiveStarPos] = useState<[number, number, number][]>(
    STAR_POSITIONS.slice(0, INITIAL_COUNT)
  );

  const handleStarCollected = (indexToReplace: number) => {
    setActiveStarPos((prev) => {
      const next = [...prev];
      const unused = STAR_POSITIONS.filter(
        (pos) => !next.some((n) => n[0] === pos[0] && n[1] === pos[1] && n[2] === pos[2])
      );
      if (unused.length > 0) {
        next[indexToReplace] = unused[Math.floor(Math.random() * unused.length)];
      }
      return next;
    });
  };

  return (
    <group name="hunt_1">
      {/* 1. Main Arena Floor — large open area */}
      <RigidBody type="fixed" colliders="cuboid" friction={0.6}>
        <mesh receiveShadow position={[0, -0.4, 0]}>
          <boxGeometry args={[20, 0.8, 20]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
      </RigidBody>

      {/* 2. Raised center platform */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow castShadow position={[0, 0.8, 0]}>
          <boxGeometry args={[4, 1.6, 4]} />
          <meshStandardMaterial color={config.accentColor} roughness={0.5} />
        </mesh>
      </RigidBody>

      {/* 3. Four corner raised platforms */}
      {([[-7, 1.2, -7], [7, 1.2, -7], [-7, 1.2, 7], [7, 1.2, 7]] as [number, number, number][]).map((pos, i) => (
        <RigidBody key={`corner_${i}`} type="fixed" colliders="cuboid">
          <mesh receiveShadow castShadow position={pos}>
            <boxGeometry args={[3, 2.4, 3]} />
            <meshStandardMaterial color={i % 2 === 0 ? config.obstacleColor1 : config.obstacleColor2} roughness={0.5} />
          </mesh>
        </RigidBody>
      ))}

      {/* 4. Side mid-platforms */}
      {([[-7, 0.8, 0], [7, 0.8, 0], [0, 0.8, -7], [0, 0.8, 7]] as [number, number, number][]).map((pos, i) => (
        <RigidBody key={`side_${i}`} type="fixed" colliders="cuboid">
          <mesh receiveShadow castShadow position={pos}>
            <boxGeometry args={[2.5, 1.6, 2.5]} />
            <meshStandardMaterial color={config.groundColor} roughness={0.6} />
          </mesh>
        </RigidBody>
      ))}

      {/* 5. Jump pads to reach high stars */}
      <JumpPad position={[-4, 0.05, -4]} boostForce={14.0} color={config.obstacleColor2} />
      <JumpPad position={[4, 0.05, 4]} boostForce={14.0} color={config.obstacleColor2} />
      <JumpPad position={[-4, 0.05, 4]} boostForce={14.0} color={config.accentColor} />
      <JumpPad position={[4, 0.05, -4]} boostForce={14.0} color={config.accentColor} />

      {/* 6. Kill zone — fall off = eliminated */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[35, 0.5, 35]}
          position={[0, -3.5, 0]}
          sensor
          onIntersectionEnter={(event: any) => {
            if (useGameStore.getState().phase !== 'PLAYING') return;
            const rb = event.rigidBodyObject;
            if (!rb) return;
            if (rb.name === 'player') {
              useGameStore.getState().eliminateRacer('player');
            } else if (rb.name === 'bot') {
              const botId = rb.userData?.id;
              if (botId) useGameStore.getState().eliminateRacer(botId);
            }
          }}
        />
      </RigidBody>

      {/* 7. Render active stars */}
      {activeStarPos.map((pos, i) => (
        <FloatingStar
          key={i}
          position={pos}
          color="#ffd60a"
          onCollect={() => handleStarCollected(i)}
        />
      ))}
    </group>
  );
};
