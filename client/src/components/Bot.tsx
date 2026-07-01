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
  [0, 0, 0], [0, 0, 7], [0, 0, 11], [0, 0, 14], [0, 0, 21.5],
  [0, 0, 25.5], [0, 0, 26.5], [0, 0, 34.5], [0, 0, 37.5], [0, 0, 46.0],
  [0, 0, 56.5]
];

const LEVEL_2_NODES: Array<[number, number, number]> = [
  [0, 0, 0], [0, 0, 6], [-2, 0, 7], [0, 0, 12.5], [2, 0, 18], [0, 0, 27.5],
  [0, 0, 31.5], [0, 0, 37.5], [0, 0, 45.5], [0, 0, 58.5], [0, 0, 71.0],
  [0, 4.1, 80.0], [0, 4.1, 89.5]
];

const LEVEL_3_NODES: Array<[number, number, number]> = [
  [0, 0, 0], [-1.6, 0.25, 10], [1.6, 0.25, 20], [0, 0, 15], [0, 0, 35.5],
  [0, 0, 47.5], [-1.2, 0, 55.5], [1.2, 0, 65.0], [0, 0, 72.5], [0, 0, 81.0],
  [-1.5, 0, 96.5], [1.5, 0, 96.5], [0, 0, 110.0]
];

const LEVEL_4_NODES: Array<[number, number, number]> = [
  [0, 0, 0], [0, 0, 6], [0, 0, 10], [0, 0, 17], [0, 0, 22],
  [-1.6, 0, 28], [1.6, 0, 32], [0, 0, 36], [0, 0, 45], [0, 0, 60],
  [0, 0, 62], [0, 0, 74], [0, 0, 82], [0, 0, 90], [0, 0, 101.5],
  [0, 0, 111], [0, 0, 121], [0, 0, 123], [0, 0, 140.5]
];

const LEVEL_5_NODES: Array<[number, number, number]> = [
  [0, 9.1, 0], [0, 9.1, 4.0], [-0.6, 8.5, 7.2], [0.6, 8.5, 7.2],
  [0, 7.8, 10.4], [-0.6, 7.0, 13.6], [0.6, 7.0, 13.6], [0, 6.3, 16.8],
  [-0.6, 5.6, 20.0], [0.6, 5.6, 20.0], [0, 5.0, 23.2], [0, 4.6, 34.0],
  [0, 4.6, 47.0], [0, 4.6, 56.0], [0, 4.6, 66.0], [0, 4.6, 78.0],
  [0, 4.6, 87.0], [0, 4.6, 96.0], [0, 4.6, 105.0], [0, 4.6, 116.0],
  [0, 4.6, 132.0], [0, 4.6, 144.0]
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

  const isGroundedRef = useRef(false);
  const jumpCooldown = useRef(0);
  const jumpCountRef = useRef(0);
  
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

    // 1. Raycast ground check (Velocity Locked & Offset Origin)
    const rayOrigin = new THREE.Vector3(pos.x, pos.y - 0.51, pos.z);
    const rayDir = { x: 0, y: -1, z: 0 };
    const maxToi = 0.08; // 8cm range below the capsule
    const ray = new rapier.Ray(rayOrigin, rayDir);
    const hit = world.castRay(ray, maxToi, true);
    
    const currentVelocity = rb.linvel();
    const isMovingUp = currentVelocity.y > 0.05;
    isGroundedRef.current = hit !== null && !isMovingUp;

    if (jumpCooldown.current > 0) {
      jumpCooldown.current -= delta;
    }

    // Reset jump counts on ground contact, or apply airborne penalty
    if (isGroundedRef.current) {
      jumpCountRef.current = 0;
    } else if (jumpCountRef.current === 0) {
      jumpCountRef.current = 1; // fell off a ledge, only 1 jump remaining
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

    // Natural hesitation slowdown before gap jumps for Easy/Medium bots
    const isNearGap = (currentLevel === 1 && pos.z > 7.5 && pos.z < 9.5) || (currentLevel === 1 && pos.z > 22.5 && pos.z < 24.5);
    if (isNearGap && (difficulty === 'EASY' || difficulty === 'MEDIUM') && Math.random() < 0.25) {
      activeSpeed *= 0.65;
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

      // Introduce human-like waddle steering noise (lateral zig-zag drift)
      const botIdx = parseInt(id.replace('bot_', '')) || 0;
      const clockTime = state.clock.getElapsedTime();
      const waddleSpeed = 5.0 + (botIdx % 3) * 1.2;
      const waddleAmp = 0.12 + (botIdx % 2) * 0.06;
      
      const lateralDir = new THREE.Vector3(-steerDir.z, 0, steerDir.x);
      steerDir.addScaledVector(lateralDir, Math.sin(clockTime * waddleSpeed) * waddleAmp);
      steerDir.normalize();

      // Qualify finish check
      if (currentNodeIndex.current === pathNodes.length - 1 && dist < 1.4) {
        setIsQualified(true);
        qualifyBot(id);
        rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
        return;
      }
    }

    // 5. Jump decision logic (evaluated every frame for responsive timing!)

    // A. Forward-Downward Raycast sensor for Gap/Void detection
    const forwardOffset = steerDir.clone().multiplyScalar(0.5);
    const forwardRayOrigin = new THREE.Vector3(pos.x + forwardOffset.x, pos.y - 0.51, pos.z + forwardOffset.z);
    const forwardRay = new rapier.Ray(forwardRayOrigin, { x: 0, y: -1, z: 0 });
    const forwardHit = world.castRay(forwardRay, 0.5, true);
    
    if (forwardHit === null && isGroundedRef.current && jumpCooldown.current <= 0) {
      shouldJump = true;
    }

    // B. Obstacle sweeper jumping with timing checks (dodging approaching arms)
    const sweepers = state.scene.children.filter((child) => child.name === 'rotating-arm');
    sweepers.forEach((sweeper) => {
      const sweeperPos = new THREE.Vector3();
      sweeper.getWorldPosition(sweeperPos);
      const dist = new THREE.Vector3(pos.x, pos.y, pos.z).distanceTo(sweeperPos);
      
      // If close to rotating sweeper base, check arm sweep angle
      if (dist < 3.2 && jumpCooldown.current <= 0) {
        const botAngle = Math.atan2(pos.x - sweeperPos.x, pos.z - sweeperPos.z);
        const sweepRot = sweeper.rotation.y;
        let angleDiff = Math.abs(sweepRot - botAngle);
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        angleDiff = Math.abs(angleDiff);

        // If blade is approaching within 45 degrees, trigger timed leap
        if (angleDiff < 0.8 && Math.random() < (difficulty === 'EASY' ? 0.5 : difficulty === 'MEDIUM' ? 0.8 : 0.98)) {
          shouldJump = true;
        }
      }
    });

    // C. Mid-air recovery jumping (double jump if falling)
    const currentVelY = rb.linvel().y;
    if (!isGroundedRef.current && currentVelY < -0.2 && jumpCountRef.current === 1 && jumpCooldown.current <= 0) {
      if (Math.random() < (difficulty === 'EASY' ? 0.2 : difficulty === 'MEDIUM' ? 0.6 : 0.9)) {
        shouldJump = true;
      }
    }

    // D. Stuck check / Barrier hopping (if speed is slow while trying to run)
    const displacement = new THREE.Vector2(pos.x - lastPosRef.current.x, pos.z - lastPosRef.current.z).length();
    if (displacement < 0.02 && steerDir.lengthSq() > 0.01) {
      stuckTimeRef.current += delta;
      if (stuckTimeRef.current > 0.35 && isGroundedRef.current && jumpCooldown.current <= 0) {
        shouldJump = true;
        stuckTimeRef.current = 0;
      }
    } else {
      stuckTimeRef.current = 0;
    }
    lastPosRef.current.set(pos.x, pos.y, pos.z);

    // E. Level-Specific Jump Triggers (e.g. Launch pads)
    if (currentLevel === 1) {
      // Level 2 Jump Pad zone
      if (pos.z > 83.5 && pos.z < 86.5 && Math.abs(pos.x) < 1.0 && jumpCooldown.current <= 0) {
        shouldJump = true;
      }
    } else if (currentLevel === 3) {
      // Level 4 Mud Speed Jump Pad
      if (pos.z > 83.5 && pos.z < 86.5 && Math.abs(pos.x) < 1.0 && jumpCooldown.current <= 0) {
        shouldJump = true;
      }
    } else if (currentLevel === 4) {
      // Level 5 Mud Speed Jump Pad
      if (pos.z > 136 && pos.z < 139 && Math.abs(pos.x) < 1.0 && jumpCooldown.current <= 0) {
        shouldJump = true;
      }
    }

    // Apply linear velocities
    const vel = rb.linvel();
    let moveTargetX = steerDir.x * activeSpeed;
    let moveTargetZ = steerDir.z * activeSpeed;
    let moveTargetY = vel.y;

    if (shouldJump && jumpCooldown.current <= 0 && jumpCountRef.current < 2) {
      moveTargetY = jumpImpulse;
      jumpCooldown.current = 0.5; // short cooldown between double jumps
      jumpCountRef.current++;
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
