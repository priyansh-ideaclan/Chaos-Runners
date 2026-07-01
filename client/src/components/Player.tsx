import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, useRapier, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameControls } from '../hooks/useGameControls';
import { useGameStore } from '../store/useGameStore';

export const Player: React.FC = () => {
  const controls = useGameControls();
  const { lastCheckpoint, passCheckpoint, phase, triggerWin, resetGame } = useGameStore();
  const { camera } = useThree();
  const { rapier, world } = useRapier();

  // Refs for physics and visual elements
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const visualGroupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  // Zustand selections
  const customization = useGameStore((state) => state.customization);

  // Local movement state
  const isGroundedRef = useRef(false);
  const isDivingRef = useRef(false);
  const diveTimerRef = useRef(0);
  const diveCooldownRef = useRef(0);
  const isGrabbingRef = useRef(false);

  // Reset player state when game restarts
  useEffect(() => {
    if (phase === 'PLAYING' && rigidBodyRef.current && lastCheckpoint) {
      rigidBodyRef.current.setTranslation(new THREE.Vector3(...lastCheckpoint), true);
      rigidBodyRef.current.setLinvel(new THREE.Vector3(0, 0, 0), true);
      rigidBodyRef.current.setAngvel(new THREE.Vector3(0, 0, 0), true);
      isDivingRef.current = false;
      diveTimerRef.current = 0;
      diveCooldownRef.current = 0;
      isGrabbingRef.current = false;
    }
  }, [phase, lastCheckpoint]);

  useFrame((state, delta) => {
    if (phase !== 'PLAYING') return;

    const rigidBody = rigidBodyRef.current;
    if (!rigidBody) return;

    const pos = rigidBody.translation();

    // 1. Respawn if fell
    if (pos.y < -8) {
      const respawnPoint = lastCheckpoint || [0, 4, 0];
      rigidBody.setTranslation(new THREE.Vector3(...respawnPoint), true);
      rigidBody.setLinvel(new THREE.Vector3(0, 0, 0), true);
      rigidBody.setAngvel(new THREE.Vector3(0, 0, 0), true);
      isDivingRef.current = false;
      return;
    }

    const rayOrigin = new THREE.Vector3(pos.x, pos.y, pos.z);
    const rayDir = { x: 0, y: -1, z: 0 };
    
    // Capsule collider ends at pos.y - 0.9, we check slightly below it
    const maxToi = 0.95;
    const ray = new rapier.Ray(rayOrigin, rayDir);
    const hit = world.castRay(ray, maxToi, true);
    isGroundedRef.current = hit !== null;

    // 3. Movement speed factors
    let moveSpeed = 6.5;
    if (isDivingRef.current) {
      moveSpeed = 9.0; // Dive sliding is faster but decreases quickly
    } else if (controls.grab) {
      moveSpeed = 3.0; // Grab state slows player down
      isGrabbingRef.current = true;
    } else {
      isGrabbingRef.current = false;
    }

    // 4. Calculate movement vectors relative to camera heading
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    camDir.y = 0;
    camDir.normalize();

    const camRight = new THREE.Vector3();
    camRight.crossVectors(new THREE.Vector3(0, 1, 0), camDir).normalize();

    const moveDir = new THREE.Vector3(0, 0, 0);
    if (controls.forward) moveDir.add(camDir);
    if (controls.backward) moveDir.sub(camDir);
    if (controls.left) moveDir.add(camRight);
    if (controls.right) moveDir.sub(camRight);

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
    }

    // 5. Update horizontal velocities
    const currentVel = rigidBody.linvel();
    let targetX = moveDir.x * moveSpeed;
    let targetZ = moveDir.z * moveSpeed;

    // Handle diving logic
    if (controls.dive && !isDivingRef.current && diveCooldownRef.current <= 0) {
      isDivingRef.current = true;
      diveTimerRef.current = 0.6; // dive slide duration
      diveCooldownRef.current = 1.4; // total cooldown

      // Apply forward dive impulse
      const lookDir = new THREE.Vector3(0, 0, -1).applyQuaternion(visualGroupRef.current?.quaternion || new THREE.Quaternion());
      lookDir.y = 0.2; // slight upward tilt
      lookDir.normalize();

      rigidBody.setLinvel({
        x: lookDir.x * 12.0,
        y: 4.5, // jump lift during dive
        z: lookDir.z * 12.0
      }, true);
    }

    // Update timers
    if (diveTimerRef.current > 0) {
      diveTimerRef.current -= delta;
      if (diveTimerRef.current <= 0) {
        isDivingRef.current = false;
      }
    }
    if (diveCooldownRef.current > 0) {
      diveCooldownRef.current -= delta;
    }

    // Interpolate velocities towards target velocities (smooth acceleration)
    const accel = isGroundedRef.current ? 0.22 : 0.08; // less control in mid-air
    const nextVelX = THREE.MathUtils.lerp(currentVel.x, targetX, accel);
    const nextVelZ = THREE.MathUtils.lerp(currentVel.z, targetZ, accel);

    // Apply linear velocity
    let nextVelY = currentVel.y;
    
    // 6. Jump Logic
    if (controls.jump && isGroundedRef.current && !isDivingRef.current) {
      nextVelY = 8.5; // Jump strength
    }

    rigidBody.setLinvel({ x: nextVelX, y: nextVelY, z: nextVelZ }, true);

    // 7. Rotate player towards movement direction
    if (moveDir.lengthSq() > 0.01 && visualGroupRef.current) {
      const targetRotation = Math.atan2(moveDir.x, moveDir.z);
      // Smoothly interpolate rotation (slerp)
      const currentRotation = visualGroupRef.current.rotation.y;
      
      // Handle wrap-around angle math smoothly
      let diff = targetRotation - currentRotation;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      
      visualGroupRef.current.rotation.y += diff * 0.18;
    }

    // 8. Procedural Animation State Machine
    const clockTime = state.clock.getElapsedTime();
    const speed = new THREE.Vector3(currentVel.x, 0, currentVel.z).length();

    const visual = visualGroupRef.current;
    const lLeg = leftLegRef.current;
    const rLeg = rightLegRef.current;
    const lArm = leftArmRef.current;
    const rArm = rightArmRef.current;

    if (visual && lLeg && rLeg && lArm && rArm) {
      // Default reset scale and rotations
      visual.scale.set(1, 1, 1);
      visual.rotation.x = 0;
      visual.rotation.z = 0;
      lLeg.rotation.set(0, 0, 0);
      rLeg.rotation.set(0, 0, 0);
      lArm.rotation.set(0, 0, 0.1);
      rArm.rotation.set(0, 0, -0.1);
      visual.position.y = 0;

      if (isDivingRef.current) {
        // --- DIVE STATE ---
        // Tilt body forward flat, flail arms and legs backwards
        visual.rotation.x = Math.PI / 2;
        
        lLeg.rotation.x = 0.5;
        rLeg.rotation.x = 0.5;
        lLeg.rotation.z = -0.2;
        rLeg.rotation.z = 0.2;

        lArm.rotation.x = -1.2;
        rArm.rotation.x = -1.2;
        lArm.rotation.y = 0.3;
        rArm.rotation.y = -0.3;

        // slide body slightly lower
        visual.position.y = -0.2;
      } else if (!isGroundedRef.current) {
        // --- AIR/FALL STATE ---
        // Squish and stretch vertically, flail limbs wildly
        visual.scale.set(0.9, 1.15, 0.9);
        
        const flailFreq = 22;
        lLeg.rotation.x = Math.sin(clockTime * flailFreq) * 0.6;
        rLeg.rotation.x = Math.cos(clockTime * flailFreq) * 0.6;

        lArm.rotation.z = -Math.PI / 2.5 + Math.sin(clockTime * flailFreq) * 0.5;
        rArm.rotation.z = Math.PI / 2.5 + Math.cos(clockTime * flailFreq) * 0.5;
      } else if (isGrabbingRef.current) {
        // --- GRABBING STATE ---
        // Slow walk waddle + reach arms straight forward
        const waddleFreq = 10;
        lLeg.rotation.x = Math.sin(clockTime * waddleFreq) * 0.3;
        rLeg.rotation.x = -Math.sin(clockTime * waddleFreq) * 0.3;

        // Reach arms forward with a slight hover bob
        lArm.rotation.x = -Math.PI / 2;
        lArm.rotation.y = 0.15;
        rArm.rotation.x = -Math.PI / 2;
        rArm.rotation.y = -0.15;

        visual.position.y = Math.abs(Math.sin(clockTime * waddleFreq)) * 0.05;
      } else if (speed > 0.3) {
        // --- RUNNING/WALKING STATE ---
        // Energetic waddle, body bobbing up/down and tilting left/right
        const runningFreq = Math.max(12, speed * 2.8);
        const waddleAngle = 0.5;

        lLeg.rotation.x = Math.sin(clockTime * runningFreq) * waddleAngle;
        rLeg.rotation.x = -Math.sin(clockTime * runningFreq) * waddleAngle;

        // Opposing arm swings
        lArm.rotation.x = -Math.sin(clockTime * runningFreq) * 0.6;
        rArm.rotation.x = Math.sin(clockTime * runningFreq) * 0.6;
        
        // Body bobbing and side-to-side rotation tilt
        visual.position.y = Math.abs(Math.sin(clockTime * runningFreq)) * 0.12;
        visual.rotation.z = Math.sin(clockTime * runningFreq) * 0.08;
      } else {
        // --- IDLE STATE ---
        // Soft breathing bob up/down, minor arm sway
        const idleFreq = 2.5;
        visual.position.y = Math.sin(clockTime * idleFreq) * 0.03;
        
        lArm.rotation.z = -Math.sin(clockTime * idleFreq) * 0.05 - 0.15;
        rArm.rotation.z = Math.sin(clockTime * idleFreq) * 0.05 + 0.15;
      }
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders={false}
      enabledRotations={[false, false, false]}
      name="player"
      position={[0, 4, 0]}
      friction={0.6}
      restitution={0.1}
    >
      <CapsuleCollider args={[0.45, 0.4]} />

      {/* Visual representation */}
      <group ref={visualGroupRef} name="player-visual">
        {/* Main Capsule Body */}
        <mesh castShadow receiveShadow>
          <capsuleGeometry args={[0.4, 0.7, 10, 20]} />
          <meshStandardMaterial
            color={customization.color}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>

        {/* Visor / Face Shield */}
        <group position={[0, 0.28, 0.3]} scale={[1, 0.75, 1]}>
          <mesh castShadow>
            <sphereGeometry args={[0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.2} />
          </mesh>

          {/* Left Eye */}
          <mesh position={[-0.08, 0.05, 0.2]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color="#000000" />
          </mesh>

          {/* Right Eye */}
          <mesh position={[0.08, 0.05, 0.2]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </group>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.45, 0.1, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.08, 0.2, 8, 8]} />
            <meshStandardMaterial color={customization.color} roughness={0.2} />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.45, 0.1, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.08, 0.2, 8, 8]} />
            <meshStandardMaterial color={customization.color} roughness={0.2} />
          </mesh>
        </group>

        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.2, -0.65, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.1, 0.15, 8, 8]} />
            <meshStandardMaterial color={customization.color} roughness={0.2} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.2, -0.65, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.1, 0.15, 8, 8]} />
            <meshStandardMaterial color={customization.color} roughness={0.2} />
          </mesh>
        </group>

        {/* ACCESSORY HATS */}
        {customization.accessory === 'crown' && (
          <group position={[0, 0.72, 0]}>
            {/* Crown Base */}
            <mesh castShadow>
              <cylinderGeometry args={[0.22, 0.2, 0.15, 12]} />
              <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Crown Spikes */}
            <mesh position={[0, 0.1, 0]} castShadow>
              <coneGeometry args={[0.22, 0.12, 12, 1, true]} />
              <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        )}

        {customization.accessory === 'party' && (
          <mesh position={[0, 0.8, 0.05]} rotation={[-0.2, 0, 0]} castShadow>
            <coneGeometry args={[0.16, 0.35, 12]} />
            <meshStandardMaterial color="#ff00a0" roughness={0.4} />
          </mesh>
        )}

        {customization.accessory === 'glasses' && (
          <group position={[0, 0.3, 0.49]} rotation={[0.0, 0, 0]}>
            {/* Glasses Frame Bar */}
            <mesh castShadow>
              <boxGeometry args={[0.36, 0.06, 0.04]} />
              <meshStandardMaterial color="#000000" roughness={0.1} />
            </mesh>
            {/* Left Lens */}
            <mesh position={[-0.08, -0.02, 0.01]} castShadow>
              <boxGeometry args={[0.12, 0.08, 0.02]} />
              <meshStandardMaterial color="#00e5ff" metalness={0.9} roughness={0.0} transparent opacity={0.8} />
            </mesh>
            {/* Right Lens */}
            <mesh position={[0.08, -0.02, 0.01]} castShadow>
              <boxGeometry args={[0.12, 0.08, 0.02]} />
              <meshStandardMaterial color="#00e5ff" metalness={0.9} roughness={0.0} transparent opacity={0.8} />
            </mesh>
          </group>
        )}
      </group>
    </RigidBody>
  );
};
