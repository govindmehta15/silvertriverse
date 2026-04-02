import { Suspense, memo, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  ContactShadows,
  Grid,
  MapControls,
  PerspectiveCamera,
  Sky,
  Stars,
  useTexture,
} from '@react-three/drei';
import * as THREE from 'three';
import Plot3D from '../Plot3D';
import { COLS, ROWS } from '../../data/plotsData';
import { getData } from '../../services/storageService';
import { mockUsers } from '../../mock/mockUsers';
import { getThemeById } from '../../data/profileThemes';
import Roads from '../Roads';
import MetaverseSurroundings from './MetaverseSurroundings';

const MemoPlot = memo(Plot3D);
const SPACING = 1.65;
const ROAD_WIDTH = 1.65;
const PLOT_SCALE = 1.15;

function buildUsersById() {
  const saved = getData('users');
  const all = saved && saved.length > 0 ? saved : mockUsers;
  return all.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
}

function getOwnerThemeAccent(ownerId) {
  if (!ownerId) return null;
  const themeId = getData(`silvertriverse_profile_theme_${ownerId}`);
  if (!themeId) return null;
  return getThemeById(themeId)?.accent ?? null;
}

function Scene({
  ownershipMap,
  user,
  onPlotClick,
  selectedPlotIndex,
  layout,
  decorByPlot,
  decorTextureByKey,
}) {
  const usersById = useMemo(() => buildUsersById(), []);
  const grassTexture = useTexture('/images/grass_texture.png');
  const collectibleTexturePaths = useMemo(() => {
    const unique = new Set();
    Object.values(decorByPlot || {}).forEach((slots) => {
      if (!Array.isArray(slots)) return;
      slots.forEach((key) => {
        const path = decorTextureByKey?.[key];
        if (path) unique.add(path);
      });
    });
    return Array.from(unique);
  }, [decorByPlot, decorTextureByKey]);
  const collectibleTextures = useTexture(collectibleTexturePaths);
  const collectibleTextureMap = useMemo(() => {
    const map = {};
    collectibleTexturePaths.forEach((path, i) => {
      map[path] = collectibleTextures[i];
    });
    return map;
  }, [collectibleTexturePaths, collectibleTextures]);

  useEffect(() => {
    if (!grassTexture) return;
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(32, 32);
    grassTexture.anisotropy = 4;
  }, [grassTexture]);

  const cols = layout?.cols || COLS;
  const rows = layout?.rows || ROWS;
  const active = layout?.activePlotIndices || Array.from({ length: cols * rows }, (_, i) => i);
  const totalColSpan = (cols * SPACING) + (Math.floor((cols - 1) / 4) * ROAD_WIDTH);
  const totalRowSpan = (rows * SPACING) + (Math.floor((rows - 1) / 4) * ROAD_WIDTH);
  const halfSizeX = totalColSpan / 2;
  const halfSizeZ = totalRowSpan / 2;
  const worldRadius = Math.max(totalColSpan, totalRowSpan) / 2 + 70;

  const plots = useMemo(() => {
    const items = [];
    for (const i of active) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const colOffset = Math.floor(col / 4) * ROAD_WIDTH;
      const rowOffset = Math.floor(row / 4) * ROAD_WIDTH;
      const px = (col * SPACING) + colOffset - halfSizeX + (SPACING / 2);
      const pz = (row * SPACING) + rowOffset - halfSizeZ + (SPACING / 2);
      const owner = ownershipMap[i];
      const ownerId = owner?.ownerId;
      const ownerUser = ownerId ? usersById[ownerId] : null;
      const slotKeys = Array.isArray(decorByPlot?.[String(i)]) ? decorByPlot[String(i)] : [];
      const wallTextures = ownerId === user?.id
        ? slotKeys
          .map((collectibleKey) => collectibleTextureMap[decorTextureByKey?.[collectibleKey]])
          .filter(Boolean)
        : [];
      items.push(
        <group key={i} scale={[PLOT_SCALE, PLOT_SCALE, PLOT_SCALE]}>
          <MemoPlot
            index={i}
            row={row}
            col={col}
            x={px}
            z={pz}
            owner={owner}
            isMine={ownerId === user?.id}
            isSelected={selectedPlotIndex === i}
            onClick={onPlotClick}
            ownerThemeAccent={getOwnerThemeAccent(ownerId)}
            ownerCardCount={ownerUser?.ownedCards?.length ?? 0}
            wallTextures={wallTextures}
          />
        </group>
      );
    }
    return items;
  }, [
    ownershipMap,
    user,
    onPlotClick,
    selectedPlotIndex,
    usersById,
    active,
    cols,
    halfSizeX,
    halfSizeZ,
    decorByPlot,
    collectibleTextureMap,
    decorTextureByKey,
  ]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 34, 48]} fov={40} />

      <Sky
        sunPosition={[60, 35, -60]}
        inclination={0.48}
        azimuth={0.28}
        turbidity={10}
        rayleigh={1.8}
        mieDirectionalG={0.85}
        mieCoefficient={0.004}
      />
      <Stars radius={worldRadius + 80} depth={60} count={4500} factor={4} saturation={1} fade speed={0.5} />

      <ambientLight intensity={1.25} color="#fef3c7" />
      <directionalLight
        position={[50, 50, -40]}
        intensity={2.6}
        color="#fde68a"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={150}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />
      <directionalLight position={[-35, 25, 35]} intensity={0.9} color="#bfdbfe" />

      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} receiveShadow>
          <planeGeometry args={[worldRadius * 2.4, worldRadius * 2.4]} />
          <meshStandardMaterial
            map={grassTexture}
            color="#1a2f1a"
            roughness={0.92}
            metalness={0.06}
          />
        </mesh>
        <Roads cols={cols} rows={rows} spacing={SPACING} roadWidth={ROAD_WIDTH} />
        <MetaverseSurroundings radius={worldRadius} />
        <Grid
          infiniteGrid
          fadeDistance={worldRadius + 20}
          fadeStrength={5}
          cellSize={SPACING}
          sectionSize={SPACING * 5}
          sectionThickness={1.5}
          sectionColor="#334155"
          cellColor="#0f1a2b"
          position={[0, -0.12, 0]}
        />
        {plots}
      </group>

      <ContactShadows
        position={[0, -0.12, 0]}
        opacity={0.45}
        scale={Math.max(110, worldRadius * 1.25)}
        blur={2}
        far={Math.max(20, worldRadius * 0.28)}
      />

      <MapControls
        enableDamping
        dampingFactor={0.06}
        enableRotate
        enablePan
        panSpeed={0.9}
        rotateSpeed={0.8}
        zoomSpeed={0.95}
        mouseButtons={{
          LEFT: THREE.MOUSE.PAN,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.ROTATE,
        }}
        touches={{
          ONE: THREE.TOUCH.PAN,
          TWO: THREE.TOUCH.DOLLY_ROTATE,
        }}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={10}
        maxDistance={Math.max(220, worldRadius * 2.6)}
      />
    </>
  );
}

export default function LandWorldUnified3D({
  ownershipMap,
  user,
  onPlotClick,
  selectedPlotIndex,
  layout,
  decorByPlot,
  decorTextureByKey,
}) {
  return (
    <div style={{ width: '100%', height: '100%', cursor: 'move' }}>
      <Canvas
        shadows
        dpr={Math.min(window.devicePixelRatio, 1.5)}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        frameloop="demand"
      >
        <Suspense fallback={null}>
          <Scene
            ownershipMap={ownershipMap}
            user={user}
            onPlotClick={onPlotClick}
            selectedPlotIndex={selectedPlotIndex}
            layout={layout}
            decorByPlot={decorByPlot}
            decorTextureByKey={decorTextureByKey}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
