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

      {/* 2. SECTION 1: ROLLING LOGS */}
      {/* Slow roll pushing racers left/right */}
      <RollingLog position={[-1.6, 0.25, 14]} length={2.5} radius={0.3} rotSpeed={3.5} color={config.obstacleColor1} />
      <RollingLog position={[1.6, 0.25, 24]} length={2.5} radius={0.3} rotSpeed={-3.0} color={config.obstacleColor2} />

      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.4, 19]}>
          <boxGeometry args={[4.5, 0.8, 22]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.6} />
        </mesh>
      </RigidBody>

      {/* 3. SECTION 2: THE MUD PIT (heavy slow down) */}
      <MudPlatform position={[0, -0.4, 43]} size={[4, 0.8, 16]} color="#382110" />

      {/* 4. SECTION 3: CHECKPOINT 1 */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.4, 58]}>
          <boxGeometry args={[5, 0.8, 5]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.6} />
        </mesh>
      </RigidBody>
      <Checkpoint position={[0, 0, 58]} id={1} />

      {/* 5. SECTION 4: TILTING PLATFORMS BALANCE */}
      <TiltingDeck position={[-1.2, 0, 70]} size={[2.2, 0.3, 8]} color={config.accentColor} />
      <TiltingDeck position={[1.2, 0, 82]} size={[2.2, 0.3, 8]} color={config.obstacleColor2} />

      {/* Connection island */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.4, 91]}>
          <boxGeometry args={[4.5, 0.8, 4]} />
          <meshStandardMaterial color={config.groundColor} />
        </mesh>
      </RigidBody>

      {/* 6. SECTION 5: WIND FAN BLOWER ZONES */}
      {/* Blows from left to right */}
      <WindFanZone position={[0, 0, 100]} size={[4.2, 2.0, 10]} force={[2.8, 0, 0]} />

      {/* 7. SECTION 6: NARROW BALANCE BEAMS */}
      <RigidBody type="fixed" colliders="cuboid" friction={0.8}>
        {/* Left beam */}
        <mesh receiveShadow position={[-1.5, -0.4, 119]}>
          <boxGeometry args={[0.5, 0.8, 18]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
        {/* Right beam */}
        <mesh receiveShadow position={[1.5, -0.4, 119]}>
          <boxGeometry args={[0.5, 0.8, 18]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
      </RigidBody>

      {/* 8. FINISH LINE PLATFORM */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.4, 140]}>
          <boxGeometry args={[6, 0.8, 6]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.5} />
        </mesh>

        {/* Pillars */}
        <mesh castShadow position={[-2.2, 1.5, 140]}>
          <cylinderGeometry args={[0.15, 0.15, 3.0, 12]} />
          <meshStandardMaterial color={config.obstacleColor2} />
        </mesh>
        <mesh castShadow position={[2.2, 1.5, 140]}>
          <cylinderGeometry args={[0.15, 0.15, 3.0, 12]} />
          <meshStandardMaterial color={config.obstacleColor2} />
        </mesh>
        <mesh castShadow position={[0, 3.0, 140]}>
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
          position={[0, 1.0, 140]} 
        />
      </RigidBody>
    </group>
  );
};
