import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { MovingPlatform, RotatingSweeper, ConveyorBelt, JumpPad, PendulumHammer, Checkpoint } from '../LevelObstacles';
import { useGameStore } from '../../store/useGameStore';
import { getThemeConfig } from '../../utils/themeManager';

export const Level2: React.FC = () => {
  const triggerWinAction = useGameStore((state) => state.triggerWin);
  const theme = useGameStore((state) => state.visualTheme);
  const config = getThemeConfig(theme);

  const handleFinish = (event: any) => {
    if (event.rigidBodyObject && event.rigidBodyObject.name === 'player') {
      triggerWinAction();
    }
  };

  return (
    <group name="level2">
      {/* 1. START PLATFORM */}
      <RigidBody type="fixed" colliders="cuboid" friction={0.6}>
        <mesh receiveShadow position={[0, -0.4, 0]}>
          <boxGeometry args={[6, 0.8, 6]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
      </RigidBody>

      {/* 2. SECTION 1: MOVING PLATFORMS OVER GAPS */}
      <RigidBody type="fixed" colliders="cuboid">
        {/* Safety middle island */}
        <mesh receiveShadow position={[0, -0.4, 16]}>
          <boxGeometry args={[4.5, 0.8, 3.5]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.6} />
        </mesh>
      </RigidBody>

      <MovingPlatform position={[-2.0, -0.4, 9]} size={[2.2, 0.4, 3.5]} direction="x" range={2.2} speed={2.0} color={config.accentColor} />
      <MovingPlatform position={[2.0, -0.4, 23]} size={[2.2, 0.4, 3.5]} direction="x" range={-2.2} speed={1.8} color={config.obstacleColor2} />

      {/* 3. SECTION 2: WINDMILL ROTORS */}
      <RigidBody type="fixed" colliders="cuboid" friction={0.7}>
        <mesh receiveShadow position={[0, -0.4, 40]}>
          <boxGeometry args={[4, 0.8, 20]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.6} />
        </mesh>
      </RigidBody>
      <RotatingSweeper position={[-1.2, 0, 36]} radius={2.0} height={0.7} speed={2.2} color={config.obstacleColor1} />
      <RotatingSweeper position={[1.2, 0, 46]} radius={2.0} height={0.7} speed={-2.4} color={config.obstacleColor2} />

      {/* 4. SECTION 3: CHECKPOINT 1 */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.4, 56]}>
          <boxGeometry args={[5.5, 0.8, 5]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.6} />
        </mesh>
      </RigidBody>
      <Checkpoint position={[0, 0, 56]} id={1} />

      {/* 5. SECTION 4: CONVEYORS BRIDGE */}
      {/* Pushes forward on center, backward on sides */}
      <ConveyorBelt position={[-1.5, -0.4, 72.5]} size={[1.5, 0.8, 18]} pushSpeed={-3.0} color="#ff0055" />
      <ConveyorBelt position={[0, -0.4, 72.5]} size={[1.5, 0.8, 18]} pushSpeed={4.0} color="#39ff14" />
      <ConveyorBelt position={[1.5, -0.4, 72.5]} size={[1.5, 0.8, 18]} pushSpeed={-3.0} color="#ff0055" />

      {/* 6. SECTION 5: LAUNCH DECK */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.4, 85]} >
          <boxGeometry args={[5, 0.8, 4]} />
          <meshStandardMaterial color={config.groundColor} />
        </mesh>
      </RigidBody>
      <JumpPad position={[0, 0, 85]} boostForce={12.5} color={config.obstacleColor2} />

      {/* High deck landing */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, 4.1, 95]}>
          <boxGeometry args={[5, 0.8, 10]} />
          <meshStandardMaterial color={config.groundColor} />
        </mesh>
      </RigidBody>

      {/* Pendulum hammer swinging over the high deck */}
      <PendulumHammer position={[0, 7.2, 95]} length={2.8} speed={3.0} color={config.obstacleColor1} />

      {/* 7. FINISH LINE PLATFORM */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, 4.1, 106]}>
          <boxGeometry args={[6, 0.8, 6]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.5} />
        </mesh>

        {/* Pillars */}
        <mesh castShadow position={[-2.2, 6.0, 106]}>
          <cylinderGeometry args={[0.15, 0.15, 3.0, 12]} />
          <meshStandardMaterial color={config.obstacleColor2} />
        </mesh>
        <mesh castShadow position={[2.2, 6.0, 106]}>
          <cylinderGeometry args={[0.15, 0.15, 3.0, 12]} />
          <meshStandardMaterial color={config.obstacleColor2} />
        </mesh>
        <mesh castShadow position={[0, 7.5, 106]}>
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
          position={[0, 5.5, 106]} 
        />
      </RigidBody>
    </group>
  );
};
