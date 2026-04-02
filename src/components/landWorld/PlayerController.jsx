import { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

const MOVE_SPEED = 7;

/**
 * First-person walk with pointer lock; clamps to horizontal bounds (private yard).
 */
export default function PlayerController({
  halfExtent = 12,
  eyeHeight = 1.6,
  initialPosition,
  onPositionCommit,
  moveIntent,
  resetSignal = 0,
}) {
  const { camera } = useThree();
  const controlsRef = useRef(null);
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const lastCommit = useRef(0);

  const initialRef = useRef(initialPosition);
  useEffect(() => {
    const sp = initialRef.current;
    camera.position.set(sp?.x ?? 0, eyeHeight, sp?.z ?? 7);
  }, [camera, eyeHeight]);

  useEffect(() => {
    const sp = initialRef.current;
    camera.position.set(sp?.x ?? 0, eyeHeight, sp?.z ?? 7);
  }, [camera, eyeHeight, resetSignal]);

  useEffect(() => {
    const down = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'a' || k === 's' || k === 'd' || k === 'arrowup' || k === 'arrowleft' || k === 'arrowdown' || k === 'arrowright') {
        if (k === 'arrowup') keys.current.w = true;
        if (k === 'arrowleft') keys.current.a = true;
        if (k === 'arrowdown') keys.current.s = true;
        if (k === 'arrowright') keys.current.d = true;
        keys.current[k] = true;
      }
    };
    const up = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'a' || k === 's' || k === 'd' || k === 'arrowup' || k === 'arrowleft' || k === 'arrowdown' || k === 'arrowright') {
        if (k === 'arrowup') keys.current.w = false;
        if (k === 'arrowleft') keys.current.a = false;
        if (k === 'arrowdown') keys.current.s = false;
        if (k === 'arrowright') keys.current.d = false;
        keys.current[k] = false;
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const clampPos = useCallback(
    (x, z) => {
      const lim = halfExtent - 0.6;
      return {
        x: THREE.MathUtils.clamp(x, -lim, lim),
        z: THREE.MathUtils.clamp(z, -lim, lim),
      };
    },
    [halfExtent]
  );

  useFrame((_, delta) => {
    const k = keys.current;
    const padForward = moveIntent?.forward ?? 0;
    const padRight = moveIntent?.right ?? 0;
    if (!k.w && !k.s && !k.a && !k.d && padForward === 0 && padRight === 0) return;

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() < 1e-6) forward.set(0, 0, -1);
    forward.normalize();

    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const move = new THREE.Vector3();
    if (k.w) move.add(forward);
    if (k.s) move.sub(forward);
    if (k.d) move.add(right);
    if (k.a) move.sub(right);
    if (padForward !== 0) move.add(forward.clone().multiplyScalar(padForward));
    if (padRight !== 0) move.add(right.clone().multiplyScalar(padRight));
    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(MOVE_SPEED * delta);
      camera.position.x += move.x;
      camera.position.z += move.z;
      const c = clampPos(camera.position.x, camera.position.z);
      camera.position.x = c.x;
      camera.position.z = c.z;
    }

    const now = performance.now();
    if (onPositionCommit && now - lastCommit.current > 1500) {
      lastCommit.current = now;
      onPositionCommit({
        x: camera.position.x,
        y: eyeHeight,
        z: camera.position.z,
      });
    }
  });

  return <PointerLockControls ref={controlsRef} pointerSpeed={0.35} />;
}
