import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { CollapsingTile, Checkpoint, MudPlatform, SpeedPad, IcePlatform, WindFanZone, PendulumHammer } from '../LevelObstacles';
import { useGameStore } from '../../store/useGameStore';
import { getThemeConfig } from '../../utils/themeManager';

export const Level4: React.FC = () => {
  const triggerWinAction = useGameStore((state) => state.triggerWin);
  const theme = useGameStore((state) => state.visualTheme);
  const config = getThemeConfig(theme);

  const handleFinish = (event: any) => {
    if (event.rigidBodyObject && event.rigidBodyObject.name === 'player') {
      triggerWinAction();
    }
  };

  return (
    <group name="level4">
      {/* 1. START PLATFORM */}
      <RigidBody type="fixed" colliders="cuboid" friction={0.6}>
        <mesh receiveShadow position={[0, -0.4, 0]}>
          <boxGeometry args={[6, 0.8, 6]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
      </RigidBody>

      {/* 2. SECTION 1: COLLAPSING PLATFORMS DECK (Shifted to z = 10) */}
      <group position={[0, -0.4, 10]}>
        {/* Render a grid of collapsing tiles */}
        <CollapsingTile position={[-1.6, 0, -4]} size={[1.4, 0.8, 3.5]} color={config.obstacleColor1} />
        <CollapsingTile position={[0, 0, -4]} size={[1.4, 0.8, 3.5]} color={config.obstacleColor2} />
        <CollapsingTile position={[1.6, 0, -4]} size={[1.4, 0.8, 3.5]} color={config.obstacleColor1} />

        <CollapsingTile position={[-0.8, 0, 1.5]} size={[1.4, 0.8, 3.5]} color={config.accentColor} />
        <CollapsingTile position={[0.8, 0, 1.5]} size={[1.4, 0.8, 3.5]} color={config.accentColor} />

        <CollapsingTile position={[-1.6, 0, 7]} size={[1.4, 0.8, 3.5]} color={config.obstacleColor1} />
        <CollapsingTile position={[0, 0, 7]} size={[1.4, 0.8, 3.5]} color={config.obstacleColor2} />
        <CollapsingTile position={[1.6, 0, 7]} size={[1.4, 0.8, 3.5]} color={config.obstacleColor1} />
      </group>

      {/* 3. SECTION 2: CHECKPOINT 1 (Shifted to z = 22) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.4, 22]}>
          <boxGeometry args={[5, 0.8, 5]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.6} />
        </mesh>
      </RigidBody>
      <Checkpoint position={[0, 0, 22]} id={1} />

      {/* 4. SECTION 3: PRECISION FLOATING JUMPS (Tightened spacing) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[-1.6, -0.4, 28.0]}>
          <boxGeometry args={[1.2, 0.8, 1.2]} />
          <meshStandardMaterial color={config.groundColor} />
        </mesh>
        <mesh receiveShadow position={[1.6, -0.4, 32.0]}>
          <boxGeometry args={[1.2, 0.8, 1.2]} />
          <meshStandardMaterial color={config.groundColor} />
        </mesh>
        <mesh receiveShadow position={[0, -0.4, 36.0]}>
          <boxGeometry args={[1.5, 0.8, 1.5]} />
          <meshStandardMaterial color={config.groundColor} />
        </mesh>
      </RigidBody>

      {/* 5. SECTION 4: MUD SLIDE TO SPEED PAD GAP (Shifted to z = 45.0) */}
      <MudPlatform position={[0, -0.4, 45.0]} size={[4, 0.8, 14]} color="#301b0c" />
      <SpeedPad position={[0, 0.01, 45.0]} />
      
      {/* Target landing across void (Shifted to z = 60.0) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.4, 60.0]}>
          <boxGeometry args={[5, 0.8, 10]} />
          <meshStandardMaterial color={config.groundColor} />
        </mesh>
      </RigidBody>

      {/* 6. SECTION 5: CHECKPOINT 2 (Shifted to z = 62.0) */}
      <Checkpoint position={[0, 0, 62.0]} id={2} />

      {/* 7. SECTION 6: WIND-BLOWN ICE SLIDES (Shifted to z = 82.0) */}
      <IcePlatform position={[0, -0.4, 82.0]} size={[4, 0.8, 30]} color="#b5f2ff" />
      <WindFanZone position={[-0.8, 0, 74]} size={[3.6, 2.0, 8]} force={[2.6, 0, 0]} />
      <WindFanZone position={[0.8, 0, 90]} size={[3.6, 2.0, 8]} force={[-2.6, 0, 0]} />

      {/* Intermediate rest island (Shifted to z = 101.5) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.4, 101.5]}>
          <boxGeometry args={[4.5, 0.8, 6]} />
          <meshStandardMaterial color={config.groundColor} />
        </mesh>
      </RigidBody>

      {/* 8. SECTION 7: FINAL PENDULUM SPRINT (Shifted to z = 121.0) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.4, 121.0]}>
          <boxGeometry args={[2.5, 0.8, 30]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.6} />
        </mesh>
      </RigidBody>

      <PendulumHammer position={[0, 3.2, 111]} length={2.5} speed={3.8} color={config.obstacleColor1} />
      <PendulumHammer position={[0, 3.2, 123]} length={2.5} speed={-3.6} color={config.obstacleColor2} />

      {/* 9. FINISH LINE PLATFORM (Shifted to z = 140.5) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.4, 140.5]}>
          <boxGeometry args={[6, 0.8, 6]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.5} />
        </mesh>

        {/* Pillars */}
        <mesh castShadow position={[-2.2, 1.5, 140.5]}>
          <cylinderGeometry args={[0.15, 0.15, 3.0, 12]} />
          <meshStandardMaterial color={config.obstacleColor2} />
        </mesh>
        <mesh castShadow position={[2.2, 1.5, 140.5]}>
          <cylinderGeometry args={[0.15, 0.15, 3.0, 12]} />
          <meshStandardMaterial color={config.obstacleColor2} />
        </mesh>
        <mesh castShadow position={[0, 3.0, 140.5]}>
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
          position={[0, 1.0, 140.5]} 
        />
      </RigidBody>
    </group>
  );
};
