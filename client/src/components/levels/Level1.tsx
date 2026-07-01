import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { RotatingSweeper, SpeedPad, Checkpoint } from '../LevelObstacles';
import { useGameStore } from '../../store/useGameStore';
import { getThemeConfig } from '../../utils/themeManager';

export const Level1: React.FC = () => {
  const triggerWinAction = useGameStore((state) => state.triggerWin);
  const theme = useGameStore((state) => state.visualTheme);
  const config = getThemeConfig(theme);

  const handleFinish = (event: any) => {
    if (event.rigidBodyObject && event.rigidBodyObject.name === 'player') {
      triggerWinAction();
    }
  };

  return (
    <group name="level1">
      {/* 1. SPAWN / START PLATFORM */}
      <RigidBody type="fixed" colliders="cuboid" friction={0.6}>
        <mesh receiveShadow position={[0, -0.4, 0]}>
          <boxGeometry args={[6, 0.8, 6]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
        
        {/* Back and side walls */}
        <mesh castShadow position={[-3.0, 0.4, 0]}>
          <boxGeometry args={[0.15, 0.8, 6]} />
          <meshStandardMaterial color={config.obstacleColor1} roughness={0.5} />
        </mesh>
        <mesh castShadow position={[3.0, 0.4, 0]}>
          <boxGeometry args={[0.15, 0.8, 6]} />
          <meshStandardMaterial color={config.obstacleColor1} roughness={0.5} />
        </mesh>
        <mesh castShadow position={[0, 0.4, -3.0]}>
          <boxGeometry args={[6, 0.8, 0.15]} />
          <meshStandardMaterial color={config.obstacleColor1} roughness={0.5} />
        </mesh>
      </RigidBody>

      {/* 2. SECTION 1: JUMP HURDLES */}
      <RigidBody type="fixed" colliders="cuboid" friction={0.7}>
        <mesh receiveShadow position={[0, -0.4, 15]}>
          <boxGeometry args={[4, 0.8, 14]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.6} />
        </mesh>
        
        {/* Hurdle 1 (Static log) */}
        <mesh castShadow position={[0, 0.25, 11]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 4, 12]} />
          <meshStandardMaterial color={config.obstacleColor2} roughness={0.4} />
        </mesh>
        {/* Hurdle 2 (Static log) */}
        <mesh castShadow position={[0, 0.25, 18]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 4, 12]} />
          <meshStandardMaterial color={config.obstacleColor2} roughness={0.4} />
        </mesh>
      </RigidBody>

      {/* 3. SECTION 2: SPEED BOOST SPRINT */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.4, 33]}>
          <boxGeometry args={[4.5, 0.8, 12]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.6} />
        </mesh>
      </RigidBody>
      
      {/* Speed pads placed symmetrically */}
      <SpeedPad position={[-1.0, 0.0, 29]} />
      <SpeedPad position={[1.0, 0.0, 34]} />

      {/* 4. SECTION 3: CHECKPOINT AND GENTLE SWEEPER */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.4, 46]}>
          <boxGeometry args={[5, 0.8, 6]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.6} />
        </mesh>
      </RigidBody>
      <Checkpoint position={[0, 0, 45]} id={1} />
      <RotatingSweeper position={[0, 0, 48]} radius={2.2} height={0.7} speed={1.8} color={config.obstacleColor1} />

      {/* 5. SECTION 4: FINAL DASH */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.4, 60]}>
          <boxGeometry args={[5, 0.8, 12]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.6} />
        </mesh>
      </RigidBody>

      {/* 6. FINISH PLATFORM & ARCH */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.4, 72]}>
          <boxGeometry args={[6, 0.8, 6]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.5} />
        </mesh>

        {/* Pillars */}
        <mesh castShadow position={[-2.0, 1.3, 72]}>
          <cylinderGeometry args={[0.15, 0.15, 2.6, 12]} />
          <meshStandardMaterial color={config.obstacleColor2} />
        </mesh>
        <mesh castShadow position={[2.0, 1.3, 72]}>
          <cylinderGeometry args={[0.15, 0.15, 2.6, 12]} />
          <meshStandardMaterial color={config.obstacleColor2} />
        </mesh>
        <mesh castShadow position={[0, 2.6, 72]}>
          <boxGeometry args={[4.2, 0.25, 0.4]} />
          <meshStandardMaterial color={config.obstacleColor1} />
        </mesh>
      </RigidBody>

      {/* Finish trigger */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider 
          args={[2.2, 1.5, 0.15]} 
          sensor 
          onIntersectionEnter={handleFinish} 
          position={[0, 1.0, 72]} 
        />
      </RigidBody>
    </group>
  );
};
