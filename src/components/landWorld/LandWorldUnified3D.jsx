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

function getDayNightProfile() {
  const now = new Date();
  const hour = now.getHours() + (now.getMinutes() / 60);
  const dayStart = 6;
  const sunsetStart = 18;
  const sunsetEnd = 19.5;
  const sunriseStart = 4.75;
  const sunriseEnd = 6.25;
  const isNight = hour >= sunsetEnd || hour < sunriseStart;
  let dayMix = 1;
  if (isNight) {
    dayMix = 0;
  } else if (hour >= sunsetStart && hour < sunsetEnd) {
    dayMix = 1 - ((hour - sunsetStart) / (sunsetEnd - sunsetStart));
  } else if (hour >= sunriseStart && hour < sunriseEnd) {
    dayMix = (hour - sunriseStart) / (sunriseEnd - sunriseStart);
  }

  const daylightProgress = Math.max(0, Math.min(1, (hour - dayStart) / 12));
  const sunArc = daylightProgress * Math.PI;
  const sunPosition = [
    Math.cos(sunArc) * 95,
    Math.max(6, Math.sin(sunArc) * 88),
    -54,
  ];
  const moonPosition = [
    -Math.cos(sunArc) * 82,
    Math.max(18, 54 - Math.sin(sunArc) * 32),
    36,
  ];
  return {
    isNight,
    dayMix,
    sunPosition,
    moonPosition,
    sky: {
      turbidity: 3.4 - (1.35 * dayMix),
      rayleigh: 0.28 + (2.5 * dayMix),
      mieDirectionalG: 0.86 - (0.08 * dayMix),
      mieCoefficient: 0.0095 - (0.0075 * dayMix),
    },
    starsCount: Math.round(7000 - (6400 * dayMix)),
    ambient: {
      intensity: 0.45 + (0.95 * dayMix),
      color: dayMix > 0.45 ? '#edf6ff' : '#9fb8ff',
    },
    sun: {
      intensity: 0.2 + (2.6 * dayMix),
      color: dayMix > 0.3 ? '#ffe7a7' : '#94a3b8',
    },
    moon: {
      intensity: 0.95 - (0.75 * dayMix),
      color: '#dbe7ff',
    },
    background: dayMix > 0.45 ? '#63C5DA' : '#0b1226',
  };
}

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
  const dayNight = useMemo(() => getDayNightProfile(), []);
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
            showBasePlate
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
      <color attach="background" args={[dayNight.background]} />
      <PerspectiveCamera makeDefault position={[0, 34, 48]} fov={40} />

      <Sky
        sunPosition={dayNight.sunPosition}
        inclination={0.48}
        azimuth={0.28}
        turbidity={dayNight.sky.turbidity}
        rayleigh={dayNight.sky.rayleigh}
        mieDirectionalG={dayNight.sky.mieDirectionalG}
        mieCoefficient={dayNight.sky.mieCoefficient}
      />
      <Stars
        radius={worldRadius + 80}
        depth={60}
        count={dayNight.starsCount}
        factor={4}
        saturation={1}
        fade
        speed={dayNight.isNight ? 0.35 : 0.12}
      />

      <ambientLight intensity={dayNight.ambient.intensity} color={dayNight.ambient.color} />
      <directionalLight
        position={dayNight.sunPosition}
        intensity={dayNight.sun.intensity}
        color={dayNight.sun.color}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={150}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />
      <directionalLight
        position={dayNight.moonPosition}
        intensity={dayNight.moon.intensity}
        color={dayNight.moon.color}
      />
      {dayNight.isNight && (
        <mesh position={dayNight.moonPosition}>
          <sphereGeometry args={[3.4, 20, 20]} />
          <meshStandardMaterial color="#e5edff" emissive="#cad8ff" emissiveIntensity={0.65} />
        </mesh>
      )}

      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} receiveShadow>
          <planeGeometry args={[worldRadius * 2.4, worldRadius * 2.4]} />
          <meshStandardMaterial
            map={grassTexture}
            color={dayNight.dayMix > 0.45 ? '#4c9a4f' : '#254834'}
            roughness={0.86}
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
          sectionColor="#4b647f"
          cellColor="#3d6f46"
          position={[0, -0.12, 0]}
        />
        {plots}
      </group>

      <ContactShadows
        position={[0, -0.12, 0]}
        opacity={0.3}
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
        rotateSpeed={0.78}
        zoomSpeed={1.1}
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
        minDistance={6}
        maxDistance={Math.max(180, worldRadius * 2.2)}
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
        frameloop="always"
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
