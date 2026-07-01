import React, { useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider, CylinderCollider } from '@react-three/rapier';
import { Checkpoint, IcePlatform, ConveyorBelt, MudPlatform, RollingLog, MovingPlatform, WindFanZone, SpeedPad, TiltingDeck, RotatingSweeper } from '../LevelObstacles';
import { useGameStore } from '../../store/useGameStore';
import { getThemeConfig } from '../../utils/themeManager';
import * as THREE from 'three';

// Local collapsing Hex Tile helper for Level 5
interface HexProps {
  position: [number, number, number];
  color: string;
}

const Level5Hex: React.FC<HexProps> = ({ position, color }) => {
  const [state, setState] = useState<'active' | 'warn' | 'gone'>('active');

  useEffect(() => {
    if (state === 'warn') {
      const timer = setTimeout(() => setState('gone'), 700);
      return () => clearTimeout(timer);
    } else if (state === 'gone') {
      const timer = setTimeout(() => setState('active'), 4000); // Respawns later
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state]);

  const handleEnter = () => {
    if (state === 'active') {
      setState('warn');
    }
  };

  if (state === 'gone') return null;

  const isWarn = state === 'warn';
  const displayColor = isWarn ? '#ffd60a' : color;

  return (
    <group position={position} userData={{ active: state === 'active', yPos: position[1] }}>
      <mesh castShadow receiveShadow rotation={[0, Math.PI / 6, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.2, 6]} />
        <meshStandardMaterial 
          color={displayColor} 
          roughness={0.3} 
          emissive={isWarn ? '#ffd60a' : '#000000'}
          emissiveIntensity={isWarn ? 0.7 : 0}
        />
      </mesh>
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[0.1, 0.5]} rotation={[0, Math.PI / 6, 0]} />
        <CylinderCollider args={[0.2, 0.48]} sensor onIntersectionEnter={handleEnter} position={[0, 0.1, 0]} />
      </RigidBody>
    </group>
  );
};

export const Level5: React.FC = () => {
  const triggerWinAction = useGameStore((state) => state.triggerWin);
  const theme = useGameStore((state) => state.visualTheme);
  const config = getThemeConfig(theme);

  const handleFinish = (event: any) => {
    if (event.rigidBodyObject && event.rigidBodyObject.name === 'player') {
      triggerWinAction();
    }
  };

  return (
    <group name="level5">
      {/* 1. HIGH START ZONE (y = 9.5) */}
      <RigidBody type="fixed" colliders="cuboid" friction={0.6}>
        <mesh receiveShadow position={[0, 9.1, 0]}>
          <boxGeometry args={[5, 0.8, 4]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.7} />
        </mesh>
      </RigidBody>

      {/* 2. SECTION 1: COLLAPSING HONEYCOMB BRIDGE (Tightened gaps) */}
      <group name="honeycomb-bridge">
        {/* Layer of spaced hexes bridging down to y=5.5 */}
        <Level5Hex position={[0, 9.1, 5]} color={config.obstacleColor1} />
        <Level5Hex position={[-0.6, 8.5, 9]} color={config.accentColor} />
        <Level5Hex position={[0.6, 8.5, 9]} color={config.accentColor} />
        
        <Level5Hex position={[0, 7.8, 13]} color={config.obstacleColor2} />
        
        <Level5Hex position={[-0.6, 7.0, 17]} color={config.obstacleColor1} />
        <Level5Hex position={[0.6, 7.0, 17]} color={config.obstacleColor1} />
        
        <Level5Hex position={[0, 6.3, 21]} color={config.accentColor} />
        <Level5Hex position={[-0.6, 5.6, 25]} color={config.obstacleColor2} />
        <Level5Hex position={[0.6, 5.6, 25]} color={config.obstacleColor2} />
      </group>

      {/* 3. SECTION 2: CHECKPOINT 1 (Shifted -11 units to z = 29) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, 4.6, 29]}>
          <boxGeometry args={[4.5, 0.8, 5]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.6} />
        </mesh>
      </RigidBody>
      <Checkpoint position={[0, 5.0, 29]} id={1} />

      {/* 4. SECTION 3: ICE RAMPS AND OPPOSING CONVEYORS */}
      <IcePlatform position={[0, 4.6, 44]} size={[3.6, 0.8, 12]} color="#d0f8ff" />
      
      {/* Opposite sliding conveyors */}
      <ConveyorBelt position={[-1.2, 4.6, 57]} size={[1.2, 0.8, 10]} pushSpeed={-4.0} color="#ff0055" />
      <ConveyorBelt position={[0, 4.6, 57]} size={[1.2, 0.8, 10]} pushSpeed={5.0} color="#39ff14" />
      <ConveyorBelt position={[1.2, 4.6, 57]} size={[1.2, 0.8, 10]} pushSpeed={-4.0} color="#ff0055" />

      {/* Rest deck */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, 4.6, 66]}>
          <boxGeometry args={[4, 0.8, 4]} />
          <meshStandardMaterial color={config.groundColor} />
        </mesh>
      </RigidBody>

      {/* 5. SECTION 4: HEAVY MUD AND ROLLING SPIN LOGS */}
      <MudPlatform position={[0, 4.6, 80]} size={[3.5, 0.8, 14]} color="#2d170a" />
      <RollingLog position={[0, 5.25, 80]} length={3.5} radius={0.25} rotSpeed={3.8} color={config.obstacleColor1} />

      {/* 6. SECTION 5: CHECKPOINT 2 */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, 4.6, 92]}>
          <boxGeometry args={[4.5, 0.8, 5]} />
          <meshStandardMaterial color={config.groundColor} />
        </mesh>
      </RigidBody>
      <Checkpoint position={[0, 5.0, 92]} id={2} />

      {/* 7. SECTION 6: MOVING DECKS WITH LATERAL GUSTS */}
      <MovingPlatform position={[0, 4.6, 104]} size={[2.2, 0.4, 4.5]} direction="x" range={2.0} speed={2.5} color={config.accentColor} />
      <WindFanZone position={[-0.8, 5.0, 104]} size={[3.5, 2.0, 6]} force={[2.6, 0, 0]} />

      <MovingPlatform position={[0, 4.6, 117]} size={[2.2, 0.4, 4.5]} direction="x" range={-2.0} speed={2.2} color={config.obstacleColor2} />
      <WindFanZone position={[0.8, 5.0, 117]} size={[3.5, 2.0, 6]} force={[-2.6, 0, 0]} />

      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, 4.6, 127]}>
          <boxGeometry args={[4, 0.8, 4]} />
          <meshStandardMaterial color={config.groundColor} />
        </mesh>
      </RigidBody>
      <SpeedPad position={[0, 5.01, 127]} />

      {/* 8. SECTION 7: EXTREME FINAL CLIMB OVER TILTING BEAMS */}
      <TiltingDeck position={[0, 4.6, 144]} size={[1.8, 0.3, 14]} color={config.obstacleColor1} />
      
      {/* Final platform steep climb with active sweeper */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, 4.6, 164]}>
          <boxGeometry args={[2.5, 0.8, 14]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.6} />
        </mesh>
      </RigidBody>
      <RotatingSweeper position={[0, 5.0, 164]} radius={2.0} height={0.8} speed={3.2} color={config.obstacleColor2} />

      {/* 9. THE CROWN FINISH PLATFORM */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, 4.6, 181]}>
          <boxGeometry args={[6, 0.8, 6]} />
          <meshStandardMaterial color={config.groundColor} roughness={0.5} />
        </mesh>

        {/* Pillars */}
        <mesh castShadow position={[-2.2, 6.5, 181]}>
          <cylinderGeometry args={[0.15, 0.15, 3.0, 12]} />
          <meshStandardMaterial color={config.obstacleColor2} />
        </mesh>
        <mesh castShadow position={[2.2, 6.5, 181]}>
          <cylinderGeometry args={[0.15, 0.15, 3.0, 12]} />
          <meshStandardMaterial color={config.obstacleColor2} />
        </mesh>
        <mesh castShadow position={[0, 8.0, 181]}>
          <boxGeometry args={[4.8, 0.3, 0.4]} />
          <meshStandardMaterial color={config.obstacleColor1} />
        </mesh>
        {/* Giant Yellow Crown Decoration */}
        <mesh position={[0, 8.6, 181]}>
          <coneGeometry args={[0.4, 0.6, 5]} />
          <meshStandardMaterial color="#ffd60a" metalness={0.9} roughness={0.1} />
        </mesh>
      </RigidBody>

      {/* Finish trigger */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider 
          args={[2.5, 1.5, 0.15]} 
          sensor 
          onIntersectionEnter={handleFinish} 
          position={[0, 6.0, 181]} 
        />
      </RigidBody>
    </group>
  );
};
