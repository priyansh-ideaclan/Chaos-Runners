import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider, CylinderCollider, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';

// Reusable Kinematic Moving Platform
interface MovingPlatformProps {
  position: [number, number, number];
  size: [number, number, number];
  direction: 'x' | 'y' | 'z';
  range: number;
  speed: number;
  color?: string;
}

const MovingPlatform: React.FC<MovingPlatformProps> = ({ position, size, direction, range, speed, color = '#bd00ff' }) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const startPos = useRef(new THREE.Vector3(...position));

  useFrame((state) => {
    const rb = rigidBodyRef.current;
    if (!rb) return;

    const time = state.clock.getElapsedTime();
    const offset = Math.sin(time * speed) * range;

    const currentPos = startPos.current.clone();
    if (direction === 'x') currentPos.x += offset;
    if (direction === 'y') currentPos.y += offset;
    if (direction === 'z') currentPos.z += offset;

    rb.setNextKinematicTranslation(currentPos);
  });

  return (
    <RigidBody ref={rigidBodyRef} type="kinematicPosition" colliders="cuboid" friction={1.0}>
      <mesh castShadow receiveShadow position={position}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
    </RigidBody>
  );
};

// Reusable Rotating Sweeper Obstacle
interface RotatingSweeperProps {
  position: [number, number, number];
  radius: number;
  height: number;
  speed: number;
  color?: string;
}

const RotatingSweeper: React.FC<RotatingSweeperProps> = ({ position, radius, height, speed, color = '#ff007f' }) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null);

  useFrame((state) => {
    const rb = rigidBodyRef.current;
    if (!rb) return;

    const time = state.clock.getElapsedTime();
    const angle = time * speed;
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    
    rb.setNextKinematicRotation(q);
  });

  return (
    <group position={position}>
      {/* Central static axle */}
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[height / 2, 0.35]} position={[0, height / 2, 0]} />
        <mesh castShadow position={[0, height / 2, 0]}>
          <cylinderGeometry args={[0.3, 0.4, height, 16]} />
          <meshStandardMaterial color="#444" roughness={0.5} />
        </mesh>
      </RigidBody>

      {/* Rotating Sweeper Arm */}
      <RigidBody ref={rigidBodyRef} type="kinematicPosition" colliders="cuboid" friction={0.8} restitution={1.2}>
        <mesh castShadow position={[0, height - 0.2, 0]}>
          <boxGeometry args={[radius * 2, 0.4, 0.3]} />
          <meshStandardMaterial color={color} roughness={0.2} emissive={color} emissiveIntensity={0.2} />
        </mesh>
      </RigidBody>
    </group>
  );
};

// Reusable Jump Pad (Bounce Pad)
interface JumpPadProps {
  position: [number, number, number];
  boostForce?: number;
}

const JumpPad: React.FC<JumpPadProps> = ({ position, boostForce = 14 }) => {
  const handleCollision = (event: any) => {
    // Look for rigid body with name "player"
    const target = event.rigidBodyObject;
    if (target && target.name === 'player') {
      // Set linear velocity y axis directly to simulate snappy bounce
      const vel = target.linvel();
      target.setLinvel({ x: vel.x, y: boostForce, z: vel.z }, true);
    }
  };

  return (
    <group position={position}>
      {/* Visual ring base */}
      <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.1, 32]} />
        <meshStandardMaterial color="#ffd60a" roughness={0.2} />
      </mesh>
      {/* Bounce pad mesh */}
      <RigidBody type="fixed" colliders={false} onCollisionEnter={handleCollision}>
        <CylinderCollider args={[0.05, 0.9]} position={[0, 0.05, 0]} />
        <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 0.1, 16]} />
          <meshStandardMaterial color="#00e5ff" roughness={0.1} emissive="#00e5ff" emissiveIntensity={0.3} />
        </mesh>
      </RigidBody>
    </group>
  );
};

// Checkpoint pad component
interface CheckpointProps {
  position: [number, number, number];
  id: number;
}

const Checkpoint: React.FC<CheckpointProps> = ({ position, id }) => {
  const passCheckpointAction = useGameStore((state) => state.passCheckpoint);
  const activeCheckpoint = useGameStore((state) => state.lastCheckpoint);
  
  const isActive = activeCheckpoint && 
    Math.abs(activeCheckpoint[0] - position[0]) < 0.1 && 
    Math.abs(activeCheckpoint[2] - position[2]) < 0.1;

  const handleEnter = (event: any) => {
    if (event.rigidBodyObject && event.rigidBodyObject.name === 'player') {
      passCheckpointAction([position[0], position[1] + 1.5, position[2]]);
    }
  };

  return (
    <group position={position}>
      <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial 
          color={isActive ? '#00e5ff' : '#444444'} 
          emissive={isActive ? '#00e5ff' : '#000000'}
          emissiveIntensity={isActive ? 0.6 : 0}
          roughness={0.6}
        />
      </mesh>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider 
          args={[2, 1, 2]} 
          sensor 
          onIntersectionEnter={handleEnter} 
          position={[0, 0.5, 0]} 
        />
      </RigidBody>
    </group>
  );
};

export const Level: React.FC = () => {
  const triggerWinAction = useGameStore((state) => state.triggerWin);

  const handleFinish = (event: any) => {
    if (event.rigidBodyObject && event.rigidBodyObject.name === 'player') {
      triggerWinAction();
    }
  };

  return (
    <group>
      {/* 1. START ZONE */}
      <RigidBody type="fixed" colliders="cuboid" friction={0.6}>
        {/* Spawn Platform */}
        <mesh receiveShadow position={[0, -0.5, 0]}>
          <boxGeometry args={[10, 1, 10]} />
          <meshStandardMaterial color="#1a142e" roughness={0.7} />
        </mesh>
        
        {/* Starting boundary fence */}
        <mesh castShadow position={[-5, 0.5, 0]}>
          <boxGeometry args={[0.2, 1, 10]} />
          <meshStandardMaterial color="#ff007f" roughness={0.5} />
        </mesh>
        <mesh castShadow position={[5, 0.5, 0]}>
          <boxGeometry args={[0.2, 1, 10]} />
          <meshStandardMaterial color="#ff007f" roughness={0.5} />
        </mesh>
        <mesh castShadow position={[0, 0.5, -5]}>
          <boxGeometry args={[10, 1, 0.2]} />
          <meshStandardMaterial color="#ff007f" roughness={0.5} />
        </mesh>
      </RigidBody>

      {/* 2. SECTION 1: BALANCE BRIDGE WITH SWEEPER */}
      <RigidBody type="fixed" colliders="cuboid" friction={0.8}>
        {/* Connecting bridge */}
        <mesh receiveShadow position={[0, -0.5, 12.5]}>
          <boxGeometry args={[3, 1, 15]} />
          <meshStandardMaterial color="#1e183a" roughness={0.6} />
        </mesh>
      </RigidBody>

      {/* Rotating sweeper in center of the bridge */}
      <RotatingSweeper position={[0, 0, 12.5]} radius={3.5} height={1.2} speed={2.5} color="#ff007f" />


      {/* 3. SECTION 2: FLOATING MOVING PLATFORMS */}
      <RigidBody type="fixed" colliders="cuboid">
        {/* intermediate safety platform */}
        <mesh receiveShadow position={[0, -0.5, 23]}>
          <boxGeometry args={[6, 1, 4]} />
          <meshStandardMaterial color="#1a142e" roughness={0.6} />
        </mesh>
      </RigidBody>

      {/* Left to right moving platform */}
      <MovingPlatform 
        position={[-3, -0.5, 29]} 
        size={[3.5, 0.5, 5]} 
        direction="x" 
        range={4} 
        speed={2.2} 
        color="#bd00ff" 
      />

      {/* Right to left moving platform */}
      <MovingPlatform 
        position={[3, -0.5, 36]} 
        size={[3.5, 0.5, 5]} 
        direction="x" 
        range={-4} 
        speed={1.8} 
        color="#00e5ff" 
      />


      {/* 4. SECTION 3: CHECKPOINT 1 AND JUMP PAD */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.5, 43]}>
          <boxGeometry args={[8, 1, 6]} />
          <meshStandardMaterial color="#1e183a" roughness={0.6} />
        </mesh>
      </RigidBody>

      <Checkpoint position={[0, 0, 43]} id={1} />
      <JumpPad position={[0, 0, 45]} boostForce={11.5} />


      {/* 5. SECTION 4: HIGH PLATFORM AND SLIDING RAMPS */}
      {/* High landing platform */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, 4.5, 53]}>
          <boxGeometry args={[8, 1, 8]} />
          <meshStandardMaterial color="#1a142e" roughness={0.6} />
        </mesh>
      </RigidBody>

      {/* Frictionless Slippery sliding ramp going downwards */}
      <RigidBody type="fixed" colliders="cuboid" friction={0.01}>
        <mesh receiveShadow position={[0, 2, 65.5]} rotation={[0.22, 0, 0]}>
          <boxGeometry args={[6, 0.8, 18]} />
          <meshStandardMaterial color="#ffd60a" roughness={0.01} metalness={0.4} />
        </mesh>
      </RigidBody>


      {/* 6. SECTION 5: SPINNING DOORS */}
      {/* Landing platform after slide */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.5, 78]}>
          <boxGeometry args={[10, 1, 8]} />
          <meshStandardMaterial color="#1e183a" roughness={0.6} />
        </mesh>
      </RigidBody>

      {/* Spinning revolves */}
      <RotatingSweeper position={[-2.5, 0, 78]} radius={2.2} height={1.0} speed={-1.5} color="#00e5ff" />
      <RotatingSweeper position={[2.5, 0, 78]} radius={2.2} height={1.0} speed={1.5} color="#00e5ff" />


      {/* 7. SECTION 6: CHECKPOINT 2 AND FINAL CHALLENGE */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.5, 87]}>
          <boxGeometry args={[8, 1, 6]} />
          <meshStandardMaterial color="#1a142e" roughness={0.6} />
        </mesh>
      </RigidBody>

      <Checkpoint position={[0, 0, 87]} id={2} />

      {/* Narrow final platform with two rapid sweepers */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -0.5, 100]}>
          <boxGeometry args={[4, 1, 18]} />
          <meshStandardMaterial color="#1e183a" roughness={0.6} />
        </mesh>
      </RigidBody>

      <RotatingSweeper position={[0, 0, 96]} radius={2.5} height={1.2} speed={3.0} color="#ff007f" />
      <RotatingSweeper position={[0, 0, 104]} radius={2.5} height={1.2} speed={-3.5} color="#ff007f" />


      {/* 8. FINISH LINE PLATFORM AND ARCHWAY */}
      <RigidBody type="fixed" colliders="cuboid">
        {/* Finish platform */}
        <mesh receiveShadow position={[0, -0.5, 114]}>
          <boxGeometry args={[8, 1, 8]} />
          <meshStandardMaterial color="#2d1c54" roughness={0.5} />
        </mesh>

        {/* Left pillar */}
        <mesh castShadow position={[-3, 2, 114]}>
          <cylinderGeometry args={[0.3, 0.3, 4, 16]} />
          <meshStandardMaterial color="#00e5ff" roughness={0.2} emissive="#00e5ff" emissiveIntensity={0.2} />
        </mesh>

        {/* Right pillar */}
        <mesh castShadow position={[3, 2, 114]}>
          <cylinderGeometry args={[0.3, 0.3, 4, 16]} />
          <meshStandardMaterial color="#00e5ff" roughness={0.2} emissive="#00e5ff" emissiveIntensity={0.2} />
        </mesh>

        {/* Top crossbar */}
        <mesh castShadow position={[0, 4.1, 114]}>
          <boxGeometry args={[6.6, 0.4, 0.6]} />
          <meshStandardMaterial color="#ff007f" roughness={0.2} emissive="#ff007f" emissiveIntensity={0.2} />
        </mesh>

        {/* Decorative Crown on Arch */}
        <mesh position={[0, 4.7, 114]}>
          <coneGeometry args={[0.3, 0.5, 4]} />
          <meshStandardMaterial color="#ffd60a" metalness={0.8} roughness={0.2} />
        </mesh>
      </RigidBody>

      {/* Finish line sensor trigger */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider 
          args={[3.5, 2, 0.2]} 
          sensor 
          onIntersectionEnter={handleFinish} 
          position={[0, 1.5, 114]} 
        />
      </RigidBody>
    </group>
  );
};
