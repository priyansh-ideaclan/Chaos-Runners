import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { RollingLog, MudPlatform, TiltingDeck, WindFanZone, Checkpoint } from '../LevelObstacles';
import { useGameStore } from '../../store/useGameStore';
import { getThemeConfig } from '../../utils/themeManager';

export const Level3: React.FC = () => {
  const triggerWinAction = useGameStore((state) => state.triggerWin);
  const theme = useGameStore((state) => state.visualTheme);
  const config = getThemeConfig(theme);

  const handleFinish = (event: any) => {
    if (event.rigidBodyObject && event.rigidBodyObject.name === 'player') {
      triggerWinAction();
    }
  };

  return (
    <group name="level3">
      {/* 1. START PLATFORM */}
      <RigidBody type="fixed" colliders="cuboid" friction={0.6}>
        <mesh receiveShadow position={[0, -0.4, 0]}>
          <boxGeometry args={[6, 0.8, 6]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
      </RigidBody>

      {/* 2. SECTION 1: ROLLING LOGS (Shifted to z = 15) */}
      {/* Slow roll pushing racers left/right */}
      <RollingLog position={[-1.6, 0.25, 10]} length={2.5} radius={0.3} rotSpeed={3.5} color={config.obstacleColor1} />
      <RollingLog position={[1.6, 0.25, 20]} length={2.5} radius={0.3} rotSpeed={-3.0} color={config.obstacleColor2} />

      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.4, 15]}>
          <boxGeometry args={[4.5, 0.8, 22]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.6} />
        </mesh>
      </RigidBody>

      {/* 3. SECTION 2: THE MUD PIT (Shifted to z = 35.5) */}
      <MudPlatform position={[0, -0.4, 35.5]} size={[4, 0.8, 16]} color="#382110" />

      {/* 4. SECTION 3: CHECKPOINT 1 (Shifted to z = 47.5) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.4, 47.5]}>
          <boxGeometry args={[5, 0.8, 5]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.6} />
        </mesh>
      </RigidBody>
      <Checkpoint position={[0, 0, 47.5]} id={1} />

      {/* 5. SECTION 4: TILTING PLATFORMS BALANCE (Shifted to z = 55.5 and 65.0) */}
      <TiltingDeck position={[-1.2, 0, 55.5]} size={[2.2, 0.3, 8]} color={config.accentColor} />
      <TiltingDeck position={[1.2, 0, 65.0]} size={[2.2, 0.3, 8]} color={config.obstacleColor2} />

      {/* Connection island (Shifted to z = 72.5) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.4, 72.5]}>
          <boxGeometry args={[4.5, 0.8, 4]} />
          <meshStandardMaterial color={config.groundColor} />
        </mesh>
      </RigidBody>

      {/* 6. SECTION 5: WIND FAN BLOWER ZONES (Shifted to z = 81.0) */}
      <RigidBody type="fixed" colliders="cuboid" friction={0.5}>
        <mesh receiveShadow position={[0, -0.4, 81.0]}>
          <boxGeometry args={[4.2, 0.8, 10]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.6} />
        </mesh>
      </RigidBody>
      {/* Blows from left to right */}
      <WindFanZone position={[0, 0, 81.0]} size={[4.2, 2.0, 10]} force={[2.8, 0, 0]} />

      {/* 7. SECTION 6: NARROW BALANCE BEAMS (Shifted to z = 96.5) */}
      <RigidBody type="fixed" colliders="cuboid" friction={0.8}>
        {/* Left beam */}
        <mesh receiveShadow position={[-1.5, -0.4, 96.5]}>
          <boxGeometry args={[0.5, 0.8, 18]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
        {/* Right beam */}
        <mesh receiveShadow position={[1.5, -0.4, 96.5]}>
          <boxGeometry args={[0.5, 0.8, 18]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
      </RigidBody>

      {/* 8. FINISH LINE PLATFORM (Shifted to z = 110.0) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.4, 110.0]}>
          <boxGeometry args={[6, 0.8, 6]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.5} />
        </mesh>

        {/* Pillars */}
        <mesh castShadow position={[-2.2, 1.5, 110.0]}>
          <cylinderGeometry args={[0.15, 0.15, 3.0, 12]} />
          <meshStandardMaterial color={config.obstacleColor2} />
        </mesh>
        <mesh castShadow position={[2.2, 1.5, 110.0]}>
          <cylinderGeometry args={[0.15, 0.15, 3.0, 12]} />
          <meshStandardMaterial color={config.obstacleColor2} />
        </mesh>
        <mesh castShadow position={[0, 3.0, 110.0]}>
          <boxGeometry args={[4.8, 0.3, 0.4]} />
          <meshStandardMaterial color={config.obstacleColor1} />
        </mesh>
      </RigidBody>

      {/* Finish trigger */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider 
          args={[2.5, 1.5, 0.15]} 
          sensor 
          onIntersectionEnter={handleFinish} 
          position={[0, 1.0, 110.0]} 
        />
      </RigidBody>
    </group>
  );
};
