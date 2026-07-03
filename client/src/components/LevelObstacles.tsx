import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider, CylinderCollider, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';
import { audioManager } from '../utils/audioManager';

// --- EXISTING BASIC OBSTACLES RE-EXPORTED / OPTIMIZED ---

// Kinematic Moving Platform
interface MovingPlatformProps {
  position: [number, number, number];
  size: [number, number, number];
  direction: 'x' | 'y' | 'z';
  range: number;
  speed: number;
  color?: string;
}

export const MovingPlatform: React.FC<MovingPlatformProps> = ({ position, size, direction, range, speed, color = '#bd00ff' }) => {
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

// Rotating Sweeper Obstacle
interface RotatingSweeperProps {
  position: [number, number, number];
  radius: number;
  height: number;
  speed: number;
  color?: string;
  name?: string;
}

export const RotatingSweeper: React.FC<RotatingSweeperProps> = ({ position, radius, height, speed, color = '#ff007f', name = 'rotating-arm' }) => {
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
    <group position={position} name={name}>
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[height / 2, 0.2]} position={[0, height / 2, 0]} />
        <mesh castShadow position={[0, height / 2, 0]}>
          <cylinderGeometry args={[0.15, 0.2, height, 12]} />
          <meshStandardMaterial color="#444" roughness={0.5} />
        </mesh>
      </RigidBody>

      <RigidBody ref={rigidBodyRef} type="kinematicPosition" colliders="cuboid" friction={0.8} restitution={1.2}>
        <mesh castShadow position={[0, height - 0.15, 0]}>
          <boxGeometry args={[radius * 2, 0.25, 0.15]} />
          <meshStandardMaterial color={color} roughness={0.2} emissive={color} emissiveIntensity={0.2} />
        </mesh>
      </RigidBody>
    </group>
  );
};

// Jump Pad (Bounce Pad)
interface JumpPadProps {
  position: [number, number, number];
  boostForce?: number;
  color?: string;
}

export const JumpPad: React.FC<JumpPadProps> = ({ position, boostForce = 12.5, color = '#00e5ff' }) => {
  const handleCollision = (event: any) => {
    const target = event.rigidBodyObject;
    if (target && (target.name === 'player' || target.name === 'bot')) {
      const vel = target.linvel();
      target.setLinvel({ x: vel.x, y: boostForce, z: vel.z }, true);
      audioManager.playJump();
    }
  };

  return (
    <group position={position}>
      <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.65, 24]} />
        <meshStandardMaterial color="#ffd60a" roughness={0.2} />
      </mesh>
      <RigidBody type="fixed" colliders={false} onCollisionEnter={handleCollision}>
        <CylinderCollider args={[0.04, 0.55]} position={[0, 0.04, 0]} />
        <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.08, 12]} />
          <meshStandardMaterial color={color} roughness={0.1} emissive={color} emissiveIntensity={0.3} />
        </mesh>
      </RigidBody>
    </group>
  );
};

// Checkpoint pad
interface CheckpointProps {
  position: [number, number, number];
  id: number;
}

export const Checkpoint: React.FC<CheckpointProps> = ({ position, id }) => {
  const passCheckpointAction = useGameStore((state) => state.passCheckpoint);
  const activeCheckpoint = useGameStore((state) => state.lastCheckpoint);
  
  const isActive = activeCheckpoint && 
    Math.abs(activeCheckpoint[0] - position[0]) < 0.1 && 
    Math.abs(activeCheckpoint[2] - position[2]) < 0.1;

  const handleEnter = (event: any) => {
    if (event.rigidBodyObject && event.rigidBodyObject.name === 'player') {
      passCheckpointAction([position[0], position[1] + 1.2, position[2]]);
      audioManager.playCheckpoint();
    }
  };

  return (
    <group position={position}>
      <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 2.5]} />
        <meshStandardMaterial 
          color={isActive ? '#00e5ff' : '#333333'} 
          emissive={isActive ? '#00e5ff' : '#000000'}
          emissiveIntensity={isActive ? 0.6 : 0}
          roughness={0.6}
        />
      </mesh>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider 
          args={[1.25, 0.8, 1.25]} 
          sensor 
          onIntersectionEnter={handleEnter} 
          position={[0, 0.4, 0]} 
        />
      </RigidBody>
    </group>
  );
};


// --- NEW COMPONENT SPECIFIC OBSTACLES & SURFACES ---

// 1. Ice Platform (Reduced Friction)
export const IcePlatform: React.FC<{ position: [number, number, number]; size: [number, number, number]; color?: string }> = ({ position, size, color = '#7ce8ff' }) => {
  return (
    <RigidBody type="fixed" colliders="cuboid" friction={0.01} name="ice-floor">
      <mesh castShadow receiveShadow position={position} userData={{ surface: 'ice' }}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.01} metalness={0.5} />
      </mesh>
    </RigidBody>
  );
};

// 2. Mud Platform (Slowing Area)
export const MudPlatform: React.FC<{ position: [number, number, number]; size: [number, number, number]; color?: string }> = ({ position, size, color = '#422915' }) => {
  return (
    <RigidBody type="fixed" colliders="cuboid" friction={0.8} name="mud-floor">
      <mesh castShadow receiveShadow position={position} userData={{ surface: 'mud' }}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.9} metalness={0.0} />
      </mesh>
    </RigidBody>
  );
};

// 3. Speed Boost Pad
export const SpeedPad: React.FC<{ position: [number, number, number]; color?: string }> = ({ position, color = '#39ff14' }) => {
  const handleEnter = (event: any) => {
    const target = event.rigidBodyObject;
    if (target && (target.name === 'player' || target.name === 'bot')) {
      const currentVel = target.linvel();
      // Apply sharp boost forward in positive Z direction
      target.setLinvel({
        x: currentVel.x * 1.5,
        y: currentVel.y,
        z: Math.max(8.5, currentVel.z + 5.0)
      }, true);
      audioManager.playClick();
    }
  };

  return (
    <group position={position}>
      {/* Arrow graphics */}
      <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 1.2]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh receiveShadow position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.3, 0.6, 3]} />
        <meshBasicMaterial color={color} />
      </mesh>
      
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider 
          args={[0.6, 0.2, 0.6]} 
          sensor 
          onIntersectionEnter={handleEnter} 
          position={[0, 0.1, 0]}
        />
      </RigidBody>
    </group>
  );
};

// 4. Conveyor Belt Platform (Pushes player forward/backward)
export const ConveyorBelt: React.FC<{ position: [number, number, number]; size: [number, number, number]; pushSpeed: number; color?: string }> = ({ position, size, pushSpeed, color = '#2c2c2c' }) => {
  return (
    <RigidBody type="fixed" colliders="cuboid" friction={0.6}>
      <mesh castShadow receiveShadow position={position} userData={{ surface: 'conveyor', pushSpeed }}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </RigidBody>
  );
};

// 5. Tilting Platform (Tilts based on weight balance)
export const TiltingDeck: React.FC<{ position: [number, number, number]; size: [number, number, number]; color?: string }> = ({ position, size, color = '#ff007f' }) => {
  const groupRef = useRef<THREE.Group>(null);
  const tiltZ = useRef(0);
  const tiltX = useRef(0);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;

    // Search scene for player or bots
    const player = state.scene.getObjectByName('player');
    const bots = state.scene.children.filter((child) => child.name === 'bot');

    let totalWeightZ = 0;
    let totalWeightX = 0;

    // Check player
    if (player) {
      const d = player.position.clone().sub(group.position);
      if (Math.abs(d.z) < size[2] / 2 && Math.abs(d.x) < size[0] / 2) {
        totalWeightZ -= d.x * 0.08;
        totalWeightX += d.z * 0.08;
      }
    }

    // Check bots
    bots.forEach((bot) => {
      const d = bot.position.clone().sub(group.position);
      if (Math.abs(d.z) < size[2] / 2 && Math.abs(d.x) < size[0] / 2) {
        totalWeightZ -= d.x * 0.04; // bots weigh slightly less for layout stability
        totalWeightX += d.z * 0.04;
      }
    });

    // Smoothly rotate the visual mesh towards weights
    tiltZ.current = THREE.MathUtils.lerp(tiltZ.current, totalWeightZ, 0.08);
    tiltX.current = THREE.MathUtils.lerp(tiltX.current, totalWeightX, 0.08);

    group.rotation.z = tiltZ.current;
    group.rotation.x = tiltX.current;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Central static support axle */}
      <mesh position={[0, -size[1] / 2 - 0.2, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.5, 12]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* The tilting platform platform */}
      <RigidBody type="fixed" colliders="cuboid" friction={0.8}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={size} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      </RigidBody>
    </group>
  );
};

// 6. Collapsing Platform (Hex-a-Gone styled block that disappears and respawns)
export const CollapsingTile: React.FC<{ position: [number, number, number]; size: [number, number, number]; color?: string }> = ({ position, size, color = '#bd00ff' }) => {
  const [tileState, setTileState] = useState<'active' | 'warn' | 'gone'>('active');

  useEffect(() => {
    if (tileState === 'warn') {
      const timer = setTimeout(() => {
        setTileState('gone');
      }, 750); // Warning delay

      return () => clearTimeout(timer);
    } else if (tileState === 'gone') {
      const timer = setTimeout(() => {
        setTileState('active'); // Respawns after 3.5 seconds
      }, 3500);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [tileState]);

  const handleEnter = () => {
    if (tileState === 'active') {
      setTileState('warn');
      audioManager.playLand();
    }
  };

  if (tileState === 'gone') return null;

  const isWarn = tileState === 'warn';
  const displayColor = isWarn ? '#ffd60a' : color;

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={displayColor} 
          roughness={0.3} 
          emissive={isWarn ? '#ffd60a' : '#000000'}
          emissiveIntensity={isWarn ? 0.7 : 0}
        />
      </mesh>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[size[0] / 2, size[1] / 2, size[2] / 2]} />
        <CuboidCollider 
          args={[size[0] / 2 - 0.05, 0.2, size[2] / 2 - 0.05]} 
          sensor 
          onIntersectionEnter={handleEnter} 
          position={[0, size[1] / 2 + 0.1, 0]}
        />
      </RigidBody>
    </group>
  );
};

// 7. Rolling Log Obstacle (Sweeps players sideways)
export const RollingLog: React.FC<{ position: [number, number, number]; length: number; radius: number; rotSpeed: number; color?: string }> = ({ position, length, radius, rotSpeed, color = '#ff6700' }) => {
  const rbRef = useRef<RapierRigidBody>(null);

  useFrame((state) => {
    const rb = rbRef.current;
    if (!rb) return;

    const time = state.clock.getElapsedTime();
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), time * rotSpeed);
    rb.setNextKinematicRotation(q);
  });

  return (
    <group position={position}>
      {/* Supporting side pegs */}
      <mesh position={[-length / 2 - 0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.3]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[length / 2 + 0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.3]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      <RigidBody ref={rbRef} type="kinematicPosition" colliders={false}>
        <CylinderCollider args={[length / 2, radius]} rotation={[0, 0, Math.PI / 2]} />
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[radius, radius, length, 16]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      </RigidBody>
    </group>
  );
};

// 8. Wind / Fan Zone (Pushes player horizontally)
export const WindFanZone: React.FC<{ position: [number, number, number]; size: [number, number, number]; force: [number, number, number] }> = ({ position, size, force }) => {
  return (
    <group position={position} name="wind-zone" userData={{ size, force }}>
      {/* The visual Fan blower */}
      <mesh position={[-size[0] / 2 - 0.25, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.8, 0.5, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Transparent wind tunnel visual indicator */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={size} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.06} wireframe />
      </mesh>
    </group>
  );
};

// 9. Hanging Pendulum Hammer (Swings back and forth)
export const PendulumHammer: React.FC<{ position: [number, number, number]; length: number; speed: number; maxAngle?: number; color?: string }> = ({ position, length, speed, maxAngle = Math.PI / 3, color = '#ff007f' }) => {
  const rbRef = useRef<RapierRigidBody>(null);

  useFrame((state) => {
    const rb = rbRef.current;
    if (!rb) return;

    const time = state.clock.getElapsedTime();
    // Oscillate pendulum swing rotation around Z axis
    const angle = Math.sin(time * speed) * maxAngle;
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle);
    
    rb.setNextKinematicRotation(q);
  });

  // Top axle sits at position + length. We offset group position to pivot point
  // and child coordinates down from the pivot.
  return (
    <group position={[position[0], position[1] + length, position[2]]}>
      {/* Supporting top axle mounting at pivot point */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.2, 0.5]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      <RigidBody ref={rbRef} type="kinematicPosition" colliders={false} name="rotating-arm">
        {/* Rod collider - hanging down from pivot */}
        <CuboidCollider args={[0.08, length / 2, 0.08]} position={[0, -length / 2, 0]} />
        {/* Hammer head weight collider - at the bottom */}
        <CuboidCollider args={[0.55, 0.4, 0.55]} position={[0, -length + 0.3, 0]} />

        {/* Visual rod */}
        <mesh position={[0, -length / 2, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, length, 8]} />
          <meshStandardMaterial color="#777" roughness={0.4} />
        </mesh>
        
        {/* Visual hammer head */}
        <mesh position={[0, -length + 0.3, 0]} castShadow>
          <boxGeometry args={[1.0, 0.7, 1.0]} />
          <meshStandardMaterial color={color} roughness={0.2} emissive={color} emissiveIntensity={0.15} />
        </mesh>
      </RigidBody>
    </group>
  );
};
