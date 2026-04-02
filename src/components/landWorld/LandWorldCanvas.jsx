import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, ContactShadows, Grid, Stars } from '@react-three/drei';
import HomeExterior from './HomeExterior';
import PlayerController from './PlayerController';
import YardDecor from './YardDecor';

function GroundAndFence({ halfExtent }) {
  const fenceMat = useMemo(() => ({ color: '#69c86cff', roughness: 0.9 }), []);
  const grass = useMemo(() => ({ color: '#2ca654ff', roughness: 0.95 }), []);
  const h = halfExtent;
  const postH = 0.85;
  const railY = postH * 0.5;
  const thick = 0.14;
  const span = h * 2;

  const edges = [
    [0, -h, span, thick],
    [0, h, span, thick],
    [-h, 0, thick, span],
    [h, 0, thick, span],
  ];

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[h * 2.2, h * 2.2]} />
        <meshStandardMaterial {...grass} />
      </mesh>
      <Grid
        infiniteGrid
        fadeDistance={65}
        fadeStrength={5}
        cellSize={1.1}
        sectionSize={5.5}
        sectionThickness={1.2}
        sectionColor="#334155"
        cellColor="#1e293b"
        position={[0, 0.02, 0]}
      />
      {edges.map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, railY, z]} castShadow>
          <boxGeometry args={[w, 0.08, d]} />
          <meshStandardMaterial {...fenceMat} />
        </mesh>
      ))}
      {[-h, h].flatMap((z) =>
        [-h, h].map((x) => (
          <mesh key={`p-${x}-${z}`} position={[x, postH / 2, z]} castShadow>
            <boxGeometry args={[thick, postH, thick]} />
            <meshStandardMaterial {...fenceMat} />
          </mesh>
        ))
      )}
    </group>
  );
}

export default function LandWorldCanvas({ layout, design, onSpawnCommit, spawn }) {
  const half = layout.bounds.halfExtent;

  return (
    <div className="absolute inset-0 h-full w-full touch-none">
      <Canvas
        shadows
        camera={{ fov: 68, near: 0.1, far: 200, position: [0, 1.6, 7] }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#0f0c29']} />
        <fog attach="fog" args={['#1a1040', 20, 70]} />
        <ambientLight intensity={1.1} color="#fef3c7" />
        <directionalLight
          position={[34, 32, -30]}
          intensity={2.2}
          color="#fde68a"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <directionalLight position={[-25, 20, 28]} intensity={0.85} color="#bfdbfe" />
        <Sky sunPosition={[60, 35, -60]} turbidity={10} rayleigh={1.8} mieDirectionalG={0.85} mieCoefficient={0.004} />
        <Stars radius={130} depth={40} count={2500} factor={3.5} saturation={1} fade speed={0.6} />
        <Suspense fallback={null}>
          <GroundAndFence halfExtent={half} />
          <HomeExterior design={design} />
          <YardDecor design={design} />
          <ContactShadows opacity={0.35} scale={24} blur={2.5} far={12} />
        </Suspense>
        <PlayerController
          halfExtent={half}
          initialPosition={spawn}
          onPositionCommit={onSpawnCommit}
          moveIntent={layout.moveIntent}
          resetSignal={layout.resetSignal}
        />
      </Canvas>
      <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg bg-black/45 px-3 py-2 text-xs text-white/90 backdrop-blur-sm">
        Click canvas to look · WASD/Arrows/pad to walk · Esc releases mouse
      </div>
    </div>
  );
}
