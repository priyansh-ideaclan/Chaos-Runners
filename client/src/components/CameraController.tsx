import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Distance from player the follow-cam sits */
const FOLLOW_DISTANCE = 5.2;

/** How high above the player the follow-cam sits (metres) */
const FOLLOW_HEIGHT = 2.2;

/** How quickly the follow-cam position lerps to its target (per frame) */
const FOLLOW_POS_LERP = 0.10;

/** How quickly the look-at point lerps (per frame) */
const FOLLOW_LOOK_LERP = 0.12;

/** How quickly yaw auto-rotates to face the player's movement direction */
const YAW_AUTO_LERP = 0.05;

/** Mouse sensitivity */
const MOUSE_SENSITIVITY = 0.0022;

/** Pitch limits (radians) */
const PITCH_MIN = -Math.PI / 2.8; // ~64° — look up
const PITCH_MAX = Math.PI / 5;    // ~36° — look down

/** Duration (seconds) of the cinematic intro hold */
const INTRO_DURATION = 3.2;

/** Duration (seconds) of the blend from intro-cam to follow-cam once PLAYING starts */
const BLEND_DURATION = 1.5;

/**
 * Intro camera:
 *  - positioned behind the starting line at a wide, slightly elevated angle
 *  - faces in the +Z direction (race direction) showing the whole lineup
 */
const INTRO_CAM_OFFSET = new THREE.Vector3(0, 4.5, -9.0);  // behind & above
const INTRO_CAM_LOOKAT_OFFSET = new THREE.Vector3(0, 1.0, 6.0); // ahead of player

// ─── Component ────────────────────────────────────────────────────────────────

export const CameraController: React.FC = () => {
  const { camera, gl } = useThree();
  const phase = useGameStore((state) => state.phase);

  // ── Mouse-controlled yaw / pitch ──────────────────────────────────────────
  const yaw   = useRef(Math.PI);   // Start facing +Z (race direction)
  const pitch = useRef(-0.28);     // Slight downward tilt

  // ── Pointer lock ──────────────────────────────────────────────────────────
  const isLocked = useRef(false);

  // ── Intro / blend state ───────────────────────────────────────────────────
  const introTimer  = useRef(0);       // counts up during ROUND_INTRO
  const blendTimer  = useRef(0);       // counts up during PLAYING blend phase
  const isBlending  = useRef(false);   // true for first BLEND_DURATION seconds of PLAYING
  const prevPhase   = useRef<string>('');

  // Snapshot of intro-cam position/target at the moment PLAYING starts
  const blendFromPos    = useRef(new THREE.Vector3());
  const blendFromLookAt = useRef(new THREE.Vector3());

  // ── Persistent smoothed values for the follow-cam ─────────────────────────
  const smoothCamPos    = useRef(new THREE.Vector3(0, 6, -10));
  const smoothLookAt    = useRef(new THREE.Vector3(0, 1, 0));
  const smoothYaw       = useRef(Math.PI);

  // ─────────────────────────────────────────────────────────────────────────
  // Pointer lock setup / teardown
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'PLAYING') {
      if (document.pointerLockElement === gl.domElement) {
        document.exitPointerLock();
      }
      isLocked.current = false;
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isLocked.current || isBlending.current) return;
      yaw.current   -= e.movementX * MOUSE_SENSITIVITY;
      pitch.current -= e.movementY * MOUSE_SENSITIVITY;
      pitch.current  = Math.max(PITCH_MIN, Math.min(PITCH_MAX, pitch.current));
    };

    const onLockChange = () => {
      isLocked.current = document.pointerLockElement === gl.domElement;
    };

    const onCanvasClick = () => {
      if (phase === 'PLAYING' && !isBlending.current) {
        gl.domElement.requestPointerLock();
      }
    };

    gl.domElement.addEventListener('click', onCanvasClick);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', onLockChange);

    return () => {
      gl.domElement.removeEventListener('click', onCanvasClick);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onLockChange);
    };
  }, [phase, gl.domElement]);

  // ─────────────────────────────────────────────────────────────────────────
  // Detect phase transitions
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'ROUND_INTRO') {
      introTimer.current  = 0;
      isBlending.current  = false;
      blendTimer.current  = 0;
      // Reset yaw to face the race direction (+Z)
      yaw.current   = Math.PI;
      pitch.current = -0.28;
    }

    if (phase === 'PLAYING' && prevPhase.current === 'ROUND_INTRO') {
      // Snapshot current camera state for a smooth blend start
      blendFromPos.current.copy(camera.position);
      const lookDir = new THREE.Vector3(0, 0, -1)
        .applyQuaternion(camera.quaternion)
        .multiplyScalar(5)
        .add(camera.position);
      blendFromLookAt.current.copy(lookDir);
      isBlending.current = true;
      blendTimer.current = 0;
    }

    prevPhase.current = phase;
  }, [phase]);

  // ─────────────────────────────────────────────────────────────────────────
  // Main per-frame camera logic
  // ─────────────────────────────────────────────────────────────────────────
  useFrame((state, delta) => {
    const playerMesh = state.scene.getObjectByName('player-visual');
    if (!playerMesh) return;

    const playerQualified = useGameStore.getState().playerQualified;

    // After qualifying, spectate the leading bot
    let targetMesh = playerMesh;
    if (playerQualified) {
      let closest: THREE.Object3D | null = null;
      let closestZ = -Infinity;
      state.scene.traverse((child) => {
        if (child.name === 'bot-visual') {
          const wp = new THREE.Vector3();
          child.getWorldPosition(wp);
          if (wp.z > closestZ) {
            closestZ = wp.z;
            closest = child;
          }
        }
      });
      if (closest) targetMesh = closest;
    }

    // World-space position of the target character
    const playerPos = new THREE.Vector3();
    targetMesh.getWorldPosition(playerPos);

    // ── ROUND_INTRO: cinematic locked wide-angle view ──────────────────────
    if (phase === 'ROUND_INTRO') {
      introTimer.current = Math.min(introTimer.current + delta, INTRO_DURATION);

      // Slightly orbit the camera horizontally during the intro for drama
      const orbitAngle = Math.sin(introTimer.current * 0.4) * 0.18; // ±10° sweep
      const orbitOffset = INTRO_CAM_OFFSET.clone();
      orbitOffset.applyEuler(new THREE.Euler(0, orbitAngle, 0));

      const introCamTarget = playerPos.clone().add(orbitOffset);
      const introLookTarget = playerPos.clone().add(INTRO_CAM_LOOKAT_OFFSET);

      // Smooth glide into the intro position (first frame may be far away)
      camera.position.lerp(introCamTarget, 0.06);
      smoothCamPos.current.copy(camera.position);

      const currentLook = new THREE.Vector3(0, 0, -1)
        .applyQuaternion(camera.quaternion)
        .multiplyScalar(5)
        .add(camera.position);
      currentLook.lerp(introLookTarget, 0.06);
      camera.lookAt(currentLook);

      smoothLookAt.current.copy(introLookTarget);
      return;
    }

    // ── PLAYING: blend from intro-cam → follow-cam ────────────────────────
    if (phase === 'PLAYING' && isBlending.current) {
      blendTimer.current += delta;
      const t = Math.min(blendTimer.current / BLEND_DURATION, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // smooth step

      // Compute the follow-cam target right now so we blend toward it
      const followTarget = computeFollowCamPos(playerPos, yaw.current, pitch.current);
      const followLook = playerPos.clone().add(new THREE.Vector3(0, 0.5, 0));

      const blendedPos    = blendFromPos.current.clone().lerp(followTarget, ease);
      const blendedLookAt = blendFromLookAt.current.clone().lerp(followLook, ease);

      camera.position.copy(blendedPos);
      camera.lookAt(blendedLookAt);

      smoothCamPos.current.copy(blendedPos);
      smoothLookAt.current.copy(blendedLookAt);

      if (t >= 1) {
        isBlending.current = false;
      }
      return;
    }

    // ── PLAYING / QUALIFIED: standard follow-cam ──────────────────────────

    // Auto-rotate yaw to face the direction the player is moving,
    // but ONLY when the mouse is not controlling the camera (not locked)
    // and the player is actually moving
    if (!isLocked.current) {
      // Look at the player's forward velocity direction from the physics body
      const playerRB = state.scene.getObjectByName('player');
      if (playerRB) {
        const wpCurrent = new THREE.Vector3();
        const wpParent  = new THREE.Vector3();
        playerRB.getWorldPosition(wpParent);
        playerMesh.getWorldPosition(wpCurrent);

        // Try to infer movement direction from visual group rotation
        const visualRot = playerMesh.rotation.y;
        const movDir = new THREE.Vector3(
          Math.sin(visualRot),
          0,
          Math.cos(visualRot)
        );

        if (movDir.lengthSq() > 0.01) {
          // Desired yaw: camera faces opposite to movement (behind player)
          const desiredYaw = Math.atan2(movDir.x, movDir.z) + Math.PI;
          let diff = desiredYaw - yaw.current;
          // Wrap diff to [-π, π]
          while (diff > Math.PI)  diff -= 2 * Math.PI;
          while (diff < -Math.PI) diff += 2 * Math.PI;
          yaw.current += diff * YAW_AUTO_LERP;
        }
      }
    }

    // Compute desired follow-cam world position
    const targetCamPos  = computeFollowCamPos(playerPos, yaw.current, pitch.current);
    const targetLookAt  = playerPos.clone().add(new THREE.Vector3(0, 0.5, 0));

    // Floor clip prevention: never let camera go below player + 0.4m
    if (targetCamPos.y < playerPos.y + 0.4) {
      targetCamPos.y = playerPos.y + 0.4;
    }

    // Smooth lerp
    smoothCamPos.current.lerp(targetCamPos, FOLLOW_POS_LERP);
    smoothLookAt.current.lerp(targetLookAt, FOLLOW_LOOK_LERP);

    camera.position.copy(smoothCamPos.current);
    camera.lookAt(smoothLookAt.current);
  });

  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: compute follow-cam world position from player pos + angles
// ─────────────────────────────────────────────────────────────────────────────
function computeFollowCamPos(
  playerPos: THREE.Vector3,
  yaw: number,
  pitch: number
): THREE.Vector3 {
  // Spherical coordinates: camera orbits behind/above the player
  const x = FOLLOW_DISTANCE * Math.cos(pitch) * Math.sin(yaw);
  const y = FOLLOW_HEIGHT   + FOLLOW_DISTANCE * Math.sin(-pitch);
  const z = FOLLOW_DISTANCE * Math.cos(pitch) * Math.cos(yaw);

  return playerPos.clone().add(new THREE.Vector3(x, y, z));
}
