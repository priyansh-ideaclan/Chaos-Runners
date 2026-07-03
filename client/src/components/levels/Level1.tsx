import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { 
  RotatingSweeper, 
  JumpPad, 
  Checkpoint, 
  IcePlatform, 
  MudPlatform, 
  WindFanZone, 
  PendulumHammer,
  MovingPlatform
} from '../LevelObstacles';
import { useGameStore } from '../../store/useGameStore';
import { getThemeConfig } from '../../utils/themeManager';

export const Level1: React.FC = () => {
  const triggerWinAction = useGameStore((state) => state.triggerWin);
  const qualifyRacerAction = useGameStore((state) => state.qualifyRacer);
  const theme = useGameStore((state) => state.visualTheme);
  const config = getThemeConfig(theme);

  const handleFinish = (event: any) => {
    if (event.rigidBodyObject) {
      const name = event.rigidBodyObject.name;
      if (name === 'player') {
        triggerWinAction();
      } else if (name === 'bot') {
        const botId = event.rigidBodyObject.userData?.id;
        if (botId) {
          qualifyRacerAction(botId);
        }
      }
    }
  };

  return (
    <group name="level1">
      {/* 1. START / SPAWN AREA */}
      {/* Platform extended to Z = -6.0 to prevent bots spawning in empty air */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[3.0, 0.4, 4.5]} position={[0, -0.4, -1.5]} />
        <mesh receiveShadow position={[0, -0.4, -1.5]}>
          <boxGeometry args={[6, 0.8, 9]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
        
        {/* Back and side border walls */}
        <mesh castShadow position={[-3.0, 0.4, -1.5]}>
          <boxGeometry args={[0.15, 0.8, 9]} />
          <meshStandardMaterial color={config.obstacleColor1} roughness={0.5} />
        </mesh>
        <mesh castShadow position={[3.0, 0.4, -1.5]}>
          <boxGeometry args={[0.15, 0.8, 9]} />
          <meshStandardMaterial color={config.obstacleColor1} roughness={0.5} />
        </mesh>
        <mesh castShadow position={[0, 0.4, -6.0]}>
          <boxGeometry args={[6, 0.8, 0.15]} />
          <meshStandardMaterial color={config.obstacleColor1} roughness={0.5} />
        </mesh>
      </RigidBody>

      {/* 2. JUMP TRAINING ZONE (Z = 3 to 22) */}
      <RigidBody type="fixed" colliders={false}>
        {/* Segment 1 */}
        <CuboidCollider args={[2, 0.4, 3.5]} position={[0, -0.4, 6.5]} />
        <mesh receiveShadow position={[0, -0.4, 6.5]}>
          <boxGeometry args={[4, 0.8, 7]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
        {/* Hurdle 1 */}
        <mesh castShadow position={[0, 0.25, 10]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 4, 12]} />
          <meshStandardMaterial color={config.obstacleColor2} roughness={0.4} />
        </mesh>
        
        {/* Segment 2 */}
        <CuboidCollider args={[3, 0.4, 6]} position={[-3.0, -0.4, 16.0]} />
        <mesh receiveShadow position={[-3.0, -0.4, 16.0]}>
          <boxGeometry args={[6, 0.8, 12]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
        {/* Hurdle 2 */}
        <mesh castShadow position={[-6, 0.25, 20]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 4, 12]} />
          <meshStandardMaterial color={config.obstacleColor2} roughness={0.4} />
        </mesh>
      </RigidBody>

      {/* 3. ROTATING OBSTACLE ZONE (Z = 22 to 38, X = -6) */}
      <Checkpoint position={[-6, 0, 22]} id={1} />
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[2.5, 0.4, 8]} position={[-6, -0.4, 30]} />
        <mesh receiveShadow position={[-6, -0.4, 30]}>
          <boxGeometry args={[5, 0.8, 16]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
      </RigidBody>
      <RotatingSweeper position={[-6, 0, 26]} radius={2.4} height={0.6} speed={1.8} color={config.obstacleColor1} />
      <RotatingSweeper position={[-6, 0, 32]} radius={2.4} height={0.6} speed={-1.8} color={config.obstacleColor2} />

      {/* 4. SOLID PLATFORM BRIDGE ZONE (Z = 38 to 60, X = 4) */}
      {/* Replaced unstable/glitchy rope bridge with a solid concrete/metal bridge using explicit CuboidColliders */}
      <RigidBody type="fixed" colliders={false}>
        {/* Turning segment */}
        <CuboidCollider args={[4, 0.4, 2]} position={[-2.0, -0.4, 39]} />
        <mesh receiveShadow position={[-2.0, -0.4, 39]}>
          <boxGeometry args={[8, 0.8, 4]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
        {/* Takeoff deck */}
        <CuboidCollider args={[2, 0.4, 3]} position={[4.0, -0.4, 44]} />
        <mesh receiveShadow position={[4.0, -0.4, 44]}>
          <boxGeometry args={[4, 0.8, 6]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
      </RigidBody>

      {/* Landing deck */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[2, 0.4, 3]} position={[4.0, -0.4, 60]} />
        <mesh receiveShadow position={[4.0, -0.4, 60]}>
          <boxGeometry args={[4, 0.8, 6]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
      </RigidBody>
      <Checkpoint position={[4.0, 0, 60.5]} id={2} />

      {/* Solid Bridge structure (extends Z = 47 to 57, top is exactly Y = 0.0) */}
      <RigidBody type="fixed" colliders={false} friction={0.7}>
        <CuboidCollider args={[2.0, 0.4, 5.0]} position={[4.0, -0.4, 52]} />
        <mesh receiveShadow position={[4.0, -0.4, 52]}>
          <boxGeometry args={[4, 0.8, 10]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
        
        {/* Side safety handrails */}
        <mesh position={[2.05, 0.45, 52]}>
          <boxGeometry args={[0.1, 0.9, 10]} />
          <meshStandardMaterial color={config.obstacleColor1} roughness={0.4} />
        </mesh>
        <mesh position={[5.95, 0.45, 52]}>
          <boxGeometry args={[0.1, 0.9, 10]} />
          <meshStandardMaterial color={config.obstacleColor1} roughness={0.4} />
        </mesh>
      </RigidBody>

      {/* 5. MUD & ICE ZONE (Z = 60 to 76, X = -6 to X = 0) */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[4.5, 0.4, 3]} position={[-2.5, -0.4, 66]} />
        <mesh receiveShadow position={[-2.5, -0.4, 66]}>
          <boxGeometry args={[9, 0.8, 6]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
      </RigidBody>
      <IcePlatform position={[-6.0, -0.4, 72]} size={[3.0, 0.8, 6.0]} />
      <MudPlatform position={[-3.0, -0.4, 72]} size={[3.0, 0.8, 6.0]} />

      {/* 6. WIND/FAN ZONE (Z = 76 to 92, X = -6) */}
      <Checkpoint position={[-6, 0, 77]} id={3} />
      <RigidBody type="fixed" colliders={false} friction={0.6}>
        <CuboidCollider args={[2.5, 0.4, 8.5]} position={[-6, -0.4, 83.5]} />
        <mesh receiveShadow position={[-6, -0.4, 83.5]}>
          <boxGeometry args={[5, 0.8, 17]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
      </RigidBody>
      <WindFanZone position={[-6.0, 0.5, 82]} size={[5.0, 1.5, 2.0]} force={[14.0, 0, 0]} />
      <WindFanZone position={[-6.0, 0.5, 87]} size={[5.0, 1.5, 2.0]} force={[14.0, 0, 0]} />

      {/* 7. BALANCE BEAM ZONE / PATH SPLIT (Z = 92 to 110) */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[6, 0.4, 1.5]} position={[-2.0, -0.4, 93.5]} />
        <mesh receiveShadow position={[-2.0, -0.4, 93.5]}>
          <boxGeometry args={[12, 0.8, 3]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
      </RigidBody>

      {/* Route A (Risky/Fast): Narrow balance beam */}
      <RigidBody type="fixed" colliders={false} friction={0.8}>
        <CuboidCollider args={[0.25, 0.4, 6]} position={[-6.0, -0.4, 101]} />
        <mesh receiveShadow position={[-6.0, -0.4, 101]}>
          <boxGeometry args={[0.5, 0.8, 12]} />
          <meshStandardMaterial color={config.obstacleColor1} roughness={0.6} />
        </mesh>
      </RigidBody>

      {/* Route B (Easy/Safe): Winding path */}
      <RigidBody type="fixed" colliders={false} friction={0.6}>
        <CuboidCollider args={[1.75, 0.4, 6]} position={[4.0, -0.4, 101]} />
        <mesh receiveShadow position={[4.0, -0.4, 101]}>
          <boxGeometry args={[3.5, 0.8, 12]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
      </RigidBody>

      {/* Transition merge deck */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[6, 0.4, 1.5]} position={[-2.0, -0.4, 108.5]} />
        <mesh receiveShadow position={[-2.0, -0.4, 108.5]}>
          <boxGeometry args={[12, 0.8, 3]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
      </RigidBody>

      {/* 8. HAMMER ARENA & BOUNCE PAD SHORTCUT (Z = 110 to 124) */}
      <Checkpoint position={[-3, 0, 110.5]} id={4} />
      <RigidBody type="fixed" colliders={false} friction={0.6}>
        <CuboidCollider args={[5, 0.4, 7]} position={[-2.0, -0.4, 117]} />
        <mesh receiveShadow position={[-2.0, -0.4, 117]}>
          <boxGeometry args={[10, 0.8, 14]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
      </RigidBody>
      <PendulumHammer position={[-5.0, 2.5, 113]} length={2.2} speed={2.2} color={config.obstacleColor1} />
      <PendulumHammer position={[-1.0, 2.5, 117]} length={2.2} speed={2.2} color={config.obstacleColor2} />
      <JumpPad position={[2.5, 0.05, 120]} boostForce={16.0} color={config.accentColor} />

      {/* 9. FINAL SPRINT & SEAMLESS DOWNHILL MOMENTUM RAMP (Z = 124 to 148) */}
      {/* Flat approach */}
      <RigidBody type="fixed" colliders={false} friction={0.6}>
        <CuboidCollider args={[2.5, 0.4, 5.0]} position={[0, -0.4, 129]} />
        <mesh receiveShadow position={[0, -0.4, 129]}>
          <boxGeometry args={[5, 0.8, 10]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
      </RigidBody>

      {/* Elevated shortcut bridge */}
      <RigidBody type="fixed" colliders={false} friction={0.6}>
        <CuboidCollider args={[1.5, 0.3, 6.0]} position={[0, 3.0, 131]} />
        <mesh receiveShadow castShadow position={[0, 3.0, 131]}>
          <boxGeometry args={[3, 0.6, 12]} />
          <meshStandardMaterial color={config.accentColor} roughness={0.5} />
        </mesh>
      </RigidBody>

      {/* Shortcut slanted slide ramp dropping players down to the momentum ramp */}
      <RigidBody type="fixed" colliders={false} friction={0.1}>
        <CuboidCollider args={[1.5, 0.3, 3.0]} position={[0, 1.3, 139]} />
        <mesh receiveShadow castShadow position={[0, 1.3, 139]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[3, 0.6, 6]} />
          <meshStandardMaterial color={config.accentColor} roughness={0.1} />
        </mesh>
      </RigidBody>

      {/* Downhill Momentum Speed Ramp on main path. Surface is set to 'speed-ramp' */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[2.5, 0.4, 4.5]} position={[0, -1.2, 138.5]} rotation={[0.2, 0, 0]} />
        <mesh receiveShadow position={[0, -1.2, 138.5]} rotation={[0.2, 0, 0]} userData={{ surface: 'speed-ramp' }}>
          <boxGeometry args={[5, 0.8, 9]} />
          <meshStandardMaterial color={config.accentColor} roughness={0.15} metalness={0.2} />
        </mesh>
      </RigidBody>

      {/* Moving gates on low flat road approach */}
      <MovingPlatform position={[0, 0.4, 129]} size={[4.8, 0.8, 0.3]} direction="y" range={1.2} speed={2.0} color={config.obstacleColor1} />

      {/* Option D: Final Hammer obstacle combo at the bottom of the momentum ramp */}
      <RotatingSweeper position={[0, -1.8, 143]} radius={2.0} height={0.6} speed={2.2} color={config.obstacleColor1} />

      {/* Finish platform - at Y = -2.2, flush with bottom of speed slide */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[3.0, 0.4, 2.5]} position={[0, -2.4, 145.5]} />
        <mesh receiveShadow position={[0, -2.4, 145.5]}>
          <boxGeometry args={[6, 0.8, 5]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.5} />
        </mesh>

        {/* Pillars */}
        <mesh castShadow position={[-2.2, -0.6, 145.5]}>
          <cylinderGeometry args={[0.15, 0.15, 2.8, 12]} />
          <meshStandardMaterial color={config.obstacleColor2} />
        </mesh>
        <mesh castShadow position={[2.2, -0.6, 145.5]}>
          <cylinderGeometry args={[0.15, 0.15, 2.8, 12]} />
          <meshStandardMaterial color={config.obstacleColor2} />
        </mesh>
        <mesh castShadow position={[0, 0.8, 145.5]}>
          <boxGeometry args={[4.8, 0.3, 0.4]} />
          <meshStandardMaterial color={config.obstacleColor1} />
        </mesh>
      </RigidBody>

      {/* Finish trigger sensor aligned at Y = -1.8 */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider 
          args={[2.4, 1.5, 0.15]} 
          sensor 
          onIntersectionEnter={handleFinish} 
          position={[0, -1.0, 145.5]} 
        />
      </RigidBody>
    </group>
  );
};
