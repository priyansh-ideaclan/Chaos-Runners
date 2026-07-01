import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, useRapier, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';

export interface BotProps {
  id: string;
  name: string;
  color: string;
  accessory: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  spawnPos: [number, number, number];
}

// Handcrafted navigation node lists for Levels 1-5
const LEVEL_1_NODES: Array<[number, number, number]> = [
  [0, 0, 0], [0, 0, 8], [0, 0, 16], [0, 0, 26], [0, 0, 34],
  [0, 0, 44], [0, 0, 52], [0, 0, 60], [0, 0, 72]
];

const LEVEL_2_NODES: Array<[number, number, number]> = [
  [0, 0, 0], [0, 0, 6], [-2, 0, 11], [2, 0, 24], [0, 0, 36],
  [0, 0, 48], [0, 0, 56], [0, 0, 70], [0, 0, 84], [0, 0, 88],
  [0, 4.1, 95], [0, 4.1, 103], [0, 4.1, 110]
];

const LEVEL_3_NODES: Array<[number, number, number]> = [
  [0, 0, 0], [-1.6, 0.25, 14], [1.6, 0.25, 24], [0, 0, 30],
  [0, 0, 40], [0, 0, 50], [0, 0, 58], [-1.2, 0, 70], [1.2, 0, 82],
  [0, 0, 91], [0, 0, 102], [-1.5, 0, 119], [1.5, 0, 125], [0, 0, 140]
];

const LEVEL_4_NODES: Array<[number, number, number]> = [
  [0, 0, 0], [0, 0, 10], [0, 0, 18], [0, 0, 25], [0, 0, 34],
  [-1.6, 0, 44], [1.6, 0, 52], [0, 0, 60], [0, 0, 76], [0, 0, 85],
  [0, 0, 100], [0, 0, 114], [0, 0, 126], [0, 0, 138], [0, 0, 150],
  [0, 0, 160], [0, 0, 172], [0, 0, 185]
];

const LEVEL_5_NODES: Array<[number, number, number]> = [
  [0, 9.1, 0], [0, 9.1, 6], [-0.6, 8.5, 11], [0.6, 8.5, 11],
  [0, 7.8, 16], [-0.6, 7.0, 22], [0.6, 7.0, 22], [0, 6.3, 28],
  [-0.6, 5.6, 33], [0, 5.0, 40], [0, 4.6, 55], [0, 4.6, 68],
  [0, 4.6, 77], [0, 4.6, 91], [0, 4.6, 103], [0, 4.6, 115],
  [0, 4.6, 128], [0, 4.6, 138], [0, 4.6, 155], [0, 4.6, 175],
  [0, 4.6, 192]
];

const LEVEL_PATHS: Record<number, Array<[number, number, number]>> = {
  0: LEVEL_1_NODES,
  1: LEVEL_2_NODES,
  2: LEVEL_3_NODES,
  3: LEVEL_4_NODES,
  4: LEVEL_5_NODES,
};

export const Bot: React.FC<BotProps> = ({ id, name, color, accessory, difficulty, spawnPos }) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const visualGroupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  const { rapier, world } = useRapier();
  const phase = useGameStore((state) => state.phase);
  const currentLevel = useGameStore((state) => state.currentLevelIndex);
  const qualifyBot = useGameStore((state) => state.qualifyBot);
  const eliminateBot = useGameStore((state) => state.eliminateBot);

  // States
  const [isQualified, setIsQualified] = useState(false);
  const [isEliminated, setIsEliminated] = useState(false);
  
  const currentNodeIndex = useRef(0);
  const targetOffset = useRef(new THREE.Vector3(0, 0, 0));
  const botLastCheckpoint = useRef<[number, number, number]>(spawnPos);
  
  // Stuck detection variables
  const lastPosRef = useRef(new THREE.Vector3());
  const stuckTimeRef = useRef(0);

  // AI ticking optimization
  const aiTickTimer = useRef(0);
  const aiTickRate = difficulty === 'EASY' ? 0.25 : difficulty === 'MEDIUM' ? 0.12 : 0.016;
  const isGroundedRef = useRef(false);
  const jumpCooldown = useRef(0);
  
  // Base running speeds
  const botSpeed = useRef(difficulty === 'EASY' ? 3.5 : difficulty === 'MEDIUM' ? 4.2 : 4.9);

  useEffect(() => {
    if (phase === 'PLAYING') {
      setIsQualified(false);
      setIsEliminated(false);
      currentNodeIndex.current = 0;
      botLastCheckpoint.current = spawnPos;
      jumpCooldown.current = 0;
      stuckTimeRef.current = 0;
      lastPosRef.current.set(spawnPos[0], spawnPos[1], spawnPos[2]);
      
      const widthSpread = difficulty === 'EASY' ? 1.4 : difficulty === 'MEDIUM' ? 0.7 : 0.2;
      targetOffset.current.set(
        (Math.random() - 0.5) * widthSpread,
        0,
        (Math.random() - 0.5) * widthSpread
      );

      if (rigidBodyRef.current) {
        rigidBodyRef.current.setTranslation(new THREE.Vector3(...spawnPos), true);
        rigidBodyRef.current.setLinvel(new THREE.Vector3(0, 0, 0), true);
        rigidBodyRef.current.setAngvel(new THREE.Vector3(0, 0, 0), true);
      }
    }
  }, [phase, spawnPos, difficulty]);

  useFrame((state, delta) => {
    if (phase !== 'PLAYING' || isQualified || isEliminated) {
      if (visualGroupRef.current && isQualified) {
        const time = state.clock.getElapsedTime();
        visualGroupRef.current.position.y = -0.12 + Math.abs(Math.sin(time * 12)) * 0.25;
        leftArmRef.current?.rotation.set(Math.sin(time * 10) * 0.5 - 1.2, 0, 0.4);
        rightArmRef.current?.rotation.set(Math.sin(time * 10) * 0.5 - 1.2, 0, -0.4);
      }
      return;
    }

    const rb = rigidBodyRef.current;
    if (!rb) return;

    const pos = rb.translation();

    // 1. Raycast ground check
    const rayOrigin = new THREE.Vector3(pos.x, pos.y, pos.z);
    const rayDir = { x: 0, y: -1, z: 0 };
    const maxToi = 0.55;
    const ray = new rapier.Ray(rayOrigin, rayDir);
    const hit = world.castRay(ray, maxToi, true);
    isGroundedRef.current = hit !== null;

    if (jumpCooldown.current > 0) {
      jumpCooldown.current -= delta;
    }

    // 2. Teleport check if fell below kill boundaries
    const killBoundaryY = currentLevel === 4 ? 0.0 : -8.0; // Level 5 (index 4) starts high
    if (pos.y < killBoundaryY) {
      rb.setTranslation(new THREE.Vector3(...botLastCheckpoint.current), true);
      rb.setLinvel(new THREE.Vector3(0, 0, 0), true);
      rb.setAngvel(new THREE.Vector3(0, 0, 0), true);
      stuckTimeRef.current = 0;
      return;
    }

    // Checkpoint updates based on positions
    if (currentLevel === 0) {
      if (pos.z > 42 && botLastCheckpoint.current[2] < 42) botLastCheckpoint.current = [0, 1.2, 46];
    } else if (currentLevel === 1) {
      if (pos.z > 52 && botLastCheckpoint.current[2] < 52) botLastCheckpoint.current = [0, 1.2, 56];
      if (pos.z > 92 && botLastCheckpoint.current[2] < 92) botLastCheckpoint.current = [0, 5.2, 95];
    } else if (currentLevel === 2) {
      if (pos.z > 54 && botLastCheckpoint.current[2] < 54) botLastCheckpoint.current = [0, 1.2, 58];
    } else if (currentLevel === 3) {
      if (pos.z > 32 && botLastCheckpoint.current[2] < 32) botLastCheckpoint.current = [0, 1.2, 34];
      if (pos.z > 98 && botLastCheckpoint.current[2] < 98) botLastCheckpoint.current = [0, 1.2, 102];
    } else if (currentLevel === 4) {
      if (pos.z > 38 && botLastCheckpoint.current[2] < 38) botLastCheckpoint.current = [0, 5.5, 40];
      if (pos.z > 101 && botLastCheckpoint.current[2] < 101) botLastCheckpoint.current = [0, 5.5, 103];
    }

    // 3. Three.js Raycaster for surface properties (ice, mud, conveyors)
    let currentSurface = 'normal';
    let conveyorSpeed = 0;
    const raycaster = new THREE.Raycaster(
      new THREE.Vector3(pos.x, pos.y, pos.z),
      new THREE.Vector3(0, -1, 0)
    );
    const intersects = raycaster.intersectObjects(state.scene.children, true);
    if (intersects.length > 0 && intersects[0].distance < 0.65) {
      const hitObj = intersects[0].object;
      if (hitObj.userData && hitObj.userData.surface) {
        currentSurface = hitObj.userData.surface;
        if (currentSurface === 'conveyor') {
          conveyorSpeed = hitObj.userData.pushSpeed || 0;
        }
      } else if (hitObj.parent && hitObj.parent.userData && hitObj.parent.userData.surface) {
        currentSurface = hitObj.parent.userData.surface;
        if (currentSurface === 'conveyor') {
          conveyorSpeed = hitObj.parent.userData.pushSpeed || 0;
        }
      }
    }

    // 4. Steer logic configurations
    let activeSpeed = botSpeed.current;
    let accelerationRatio = isGroundedRef.current ? 0.15 : 0.06;
    let jumpImpulse = 6.2;

    if (currentSurface === 'ice') {
      accelerationRatio = 0.035;
      activeSpeed *= 1.1;
    } else if (currentSurface === 'mud') {
      activeSpeed *= 0.45;
      jumpImpulse = 3.2;
    }

    // 4b. Wind Zone detection
    let windForceX = 0;
    let windForceZ = 0;
    const windZones = state.scene.children.filter((child) => child.name === 'wind-zone');
    windZones.forEach((zone) => {
      const zonePos = new THREE.Vector3();
      zone.getWorldPosition(zonePos);
      const zoneSize = zone.userData.size;
      const zoneForce = zone.userData.force;
      if (zoneSize && zoneForce) {
        const dx = pos.x - zonePos.x;
        const dy = pos.y - zonePos.y;
        const dz = pos.z - zonePos.z;
        if (
          Math.abs(dx) < zoneSize[0] / 2 &&
          Math.abs(dy - 0.5) < zoneSize[1] / 2 &&
          Math.abs(dz) < zoneSize[2] / 2
        ) {
          windForceX += zoneForce[0] * 0.12;
          windForceZ += zoneForce[2] * 0.12;
        }
      }
    });

    // AI Path steering updates
    aiTickTimer.current -= delta;
    let steerDir = new THREE.Vector3(0, 0, 0);
    let shouldJump = false;

    const pathNodes = LEVEL_PATHS[currentLevel] || LEVEL_1_NODES;
    const targetNode = pathNodes[currentNodeIndex.current];

    if (targetNode) {
      const targetPos = new THREE.Vector3(...targetNode).add(targetOffset.current);
      const dist = new THREE.Vector3(pos.x, pos.y, pos.z).distanceTo(targetPos);

      if (dist < 1.3 && currentNodeIndex.current < pathNodes.length - 1) {
        currentNodeIndex.current++;
        const widthSpread = difficulty === 'EASY' ? 1.4 : difficulty === 'MEDIUM' ? 0.7 : 0.2;
        targetOffset.current.set(
          (Math.random() - 0.5) * widthSpread,
          0,
          (Math.random() - 0.5) * widthSpread
        );
      }

      steerDir.subVectors(targetPos, new THREE.Vector3(pos.x, pos.y, pos.z));
      steerDir.y = 0;
      steerDir.normalize();

      // Qualify finish check
      if (currentNodeIndex.current === pathNodes.length - 1 && dist < 1.4) {
        setIsQualified(true);
        qualifyBot(id);
        rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
        return;
      }
    }

    // 5. Jump logic conditions
    if (aiTickTimer.current <= 0) {
      aiTickTimer.current = aiTickRate;

      // Obstacle sweeper jumping
      const obstacles = state.scene.children.filter((child) => child.name === 'rotating-arm' || child.name === 'obstacle');
      obstacles.forEach((obs) => {
        const obsPos = new THREE.Vector3();
        obs.getWorldPosition(obsPos);
        const obsDist = new THREE.Vector3(pos.x, pos.y, pos.z).distanceTo(obsPos);
        if (obsDist < 2.5 && jumpCooldown.current <= 0 && Math.random() < (difficulty === 'EASY' ? 0.35 : 0.75)) {
          shouldJump = true;
        }
      });

      // Level specific jumping
      if (currentLevel === 0) {
        if (pos.z > 9 && pos.z < 21 && Math.random() < 0.1) shouldJump = true; // Hurdles
      } else if (currentLevel === 1) {
        if (pos.z > 8 && pos.z < 26 && Math.random() < 0.15) shouldJump = true; // Gaps
        if (pos.z > 83.5 && pos.z < 86.5 && Math.abs(pos.x) < 0.8) shouldJump = true; // Jump pad
      } else if (currentLevel === 2) {
        if (pos.z > 108 && pos.z < 129 && Math.random() < 0.12) shouldJump = true; // Balance beams void
      } else if (currentLevel === 3) {
        if (pos.z > 8 && pos.z < 33 && Math.random() < 0.08) shouldJump = true; // Collapsing tiles
        if (pos.z > 41 && pos.z < 65 && Math.random() < 0.18) shouldJump = true; // Precision jumps
        if (pos.z > 84 && pos.z < 87 && Math.abs(pos.x) < 0.8) shouldJump = true; // Mud speed jump pad
      } else if (currentLevel === 4) {
        if (pos.z > 4 && pos.z < 35 && Math.random() < 0.1) shouldJump = true; // Hex tiles climb
        if (pos.z > 136 && pos.z < 139) shouldJump = true; // Mud speed jump pad
      }

      // --- STUCK RECOVERY ENGINE ---
      const displacement = new THREE.Vector2(pos.x - lastPosRef.current.x, pos.z - lastPosRef.current.z).length();
      if (displacement < 0.02 && steerDir.lengthSq() > 0.01) {
        stuckTimeRef.current += aiTickRate;
        if (stuckTimeRef.current > 0.8 && isGroundedRef.current && jumpCooldown.current <= 0) {
          shouldJump = true;
          stuckTimeRef.current = 0;
        }
      } else {
        stuckTimeRef.current = 0;
      }
      lastPosRef.current.set(pos.x, pos.y, pos.z);
    }

    // Apply linear velocities
    const vel = rb.linvel();
    let moveTargetX = steerDir.x * activeSpeed;
    let moveTargetZ = steerDir.z * activeSpeed;
    let moveTargetY = vel.y;

    if (shouldJump && isGroundedRef.current && jumpCooldown.current <= 0) {
      moveTargetY = jumpImpulse;
      jumpCooldown.current = 1.0;
    }

    const nextVelX = THREE.MathUtils.lerp(vel.x, moveTargetX + windForceX, accelerationRatio);
    const nextVelZ = THREE.MathUtils.lerp(vel.z, moveTargetZ + windForceZ + conveyorSpeed, accelerationRatio);

    rb.setLinvel({ x: nextVelX, y: moveTargetY, z: nextVelZ }, true);

    // Rotate bot visual mesh
    if (steerDir.lengthSq() > 0.01 && visualGroupRef.current) {
      const targetRot = Math.atan2(steerDir.x, steerDir.z);
      let diff = targetRot - visualGroupRef.current.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      visualGroupRef.current.rotation.y += diff * 0.15;
    }

    // Waddling legs/arms animations
    const clockTime = state.clock.getElapsedTime();
    const speed = new THREE.Vector3(vel.x, 0, vel.z).length();

    const visual = visualGroupRef.current;
    const lLeg = leftLegRef.current;
    const rLeg = rightLegRef.current;
    const lArm = leftArmRef.current;
    const rArm = rightArmRef.current;

    if (visual && lLeg && rLeg && lArm && rArm) {
      visual.scale.set(0.6, 0.6, 0.6);
      visual.rotation.x = 0;
      visual.rotation.z = 0;
      lLeg.rotation.set(0, 0, 0);
      rLeg.rotation.set(0, 0, 0);
      lArm.rotation.set(0, 0, 0.15);
      rArm.rotation.set(0, 0, -0.15);
      visual.position.y = -0.12;

      if (!isGroundedRef.current) {
        visual.scale.set(0.54, 0.69, 0.54);
        const flail = 22;
        lLeg.rotation.x = Math.sin(clockTime * flail) * 0.5;
        rLeg.rotation.x = Math.cos(clockTime * flail) * 0.5;
        lArm.rotation.z = -Math.PI/3 + Math.sin(clockTime * flail) * 0.4;
        rArm.rotation.z = Math.PI/3 + Math.cos(clockTime * flail) * 0.4;
      } else if (speed > 0.3) {
        const waddleFreq = Math.max(12, speed * 2.8);
        lLeg.rotation.x = Math.sin(clockTime * waddleFreq) * 0.5;
        rLeg.rotation.x = -Math.sin(clockTime * waddleFreq) * 0.5;
        lArm.rotation.x = -Math.sin(clockTime * waddleFreq) * 0.5;
        rArm.rotation.x = Math.sin(clockTime * waddleFreq) * 0.5;
        
        visual.position.y = -0.12 + Math.abs(Math.sin(clockTime * waddleFreq)) * 0.12;
        visual.rotation.z = Math.sin(clockTime * waddleFreq) * 0.08;
      } else {
        const breathing = 2.5;
        visual.position.y = -0.12 + Math.sin(clockTime * breathing) * 0.03;
        lArm.rotation.z = -Math.sin(clockTime * breathing) * 0.05 - 0.15;
        rArm.rotation.z = Math.sin(clockTime * breathing) * 0.05 + 0.15;
      }
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders={false}
      enabledRotations={[false, false, false]}
      name="bot"
      position={spawnPos}
      linearDamping={0.5}
      friction={0.6}
      restitution={0.1}
    >
      <CapsuleCollider args={[0.25, 0.24]} />

      <group ref={visualGroupRef} name="bot-visual" scale={[0.6, 0.6, 0.6]}>
        <mesh castShadow receiveShadow>
          <capsuleGeometry args={[0.4, 0.7, 10, 20]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
        </mesh>

        <group position={[0, 0.28, 0.3]} scale={[1, 0.75, 1]}>
          <mesh>
            <sphereGeometry args={[0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#fff" roughness={0.1} />
          </mesh>
          <mesh position={[-0.08, 0.05, 0.2]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color="#000" />
          </mesh>
          <mesh position={[0.08, 0.05, 0.2]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color="#000" />
          </mesh>
        </group>

        <group ref={leftArmRef} position={[-0.45, 0.1, 0]}>
          <mesh castShadow><capsuleGeometry args={[0.08, 0.2, 8, 8]} /><meshStandardMaterial color={color} /></mesh>
        </group>
        <group ref={rightArmRef} position={[0.45, 0.1, 0]}>
          <mesh castShadow><capsuleGeometry args={[0.08, 0.2, 8, 8]} /><meshStandardMaterial color={color} /></mesh>
        </group>
        <group ref={leftLegRef} position={[-0.2, -0.65, 0]}>
          <mesh castShadow><capsuleGeometry args={[0.1, 0.15, 8, 8]} /><meshStandardMaterial color={color} /></mesh>
        </group>
        <group ref={rightLegRef} position={[0.2, -0.65, 0]}>
          <mesh castShadow><capsuleGeometry args={[0.1, 0.15, 8, 8]} /><meshStandardMaterial color={color} /></mesh>
        </group>

        {accessory === 'crown' && (
          <group position={[0, 0.72, 0]}>
            <mesh castShadow><cylinderGeometry args={[0.22, 0.2, 0.15, 12]} /><meshStandardMaterial color="#ffd700" metalness={0.8} /></mesh>
            <mesh castShadow position={[0, 0.1, 0]}><coneGeometry args={[0.22, 0.12, 12, 1, true]} /><meshStandardMaterial color="#ffd700" metalness={0.8} /></mesh>
          </group>
        )}
        {accessory === 'party' && (
          <mesh position={[0, 0.8, 0.05]} rotation={[-0.2, 0, 0]} castShadow>
            <coneGeometry args={[0.16, 0.35, 12]} />
            <meshStandardMaterial color="#00ffff" roughness={0.4} />
          </mesh>
        )}
        {accessory === 'glasses' && (
          <group position={[0, 0.3, 0.49]}>
            <mesh><boxGeometry args={[0.36, 0.06, 0.04]} /><meshStandardMaterial color="#000" /></mesh>
            <mesh position={[-0.08, -0.02, 0.01]}><boxGeometry args={[0.12, 0.08, 0.02]} /><meshStandardMaterial color="#ff007f" transparent opacity={0.8} /></mesh>
            <mesh position={[0.08, -0.02, 0.01]}><boxGeometry args={[0.12, 0.08, 0.02]} /><meshStandardMaterial color="#ff007f" transparent opacity={0.8} /></mesh>
          </group>
        )}
      </group>
    </RigidBody>
  );
};
