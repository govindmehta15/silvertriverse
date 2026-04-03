import React, { Suspense, useMemo, useRef, memo, useState, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    MapControls, PerspectiveCamera, Stars,
    ContactShadows, Grid, Sky, useTexture
} from '@react-three/drei';
import * as THREE from 'three';
import Plot3D from './Plot3D';
import TownshipSurroundings from './TownshipSurroundings';
import Roads from './Roads';

import { COLS, ROWS, indexToRowCol } from '../data/plotsData';
import { getData } from '../utils/storageService';
import { mockUsers } from '../mock/mockUsers';
import { getThemeById } from '../data/profileThemes';

export const ALL_COLLECTIBLE_IMAGES = [
    '/images/bomber_jacket.png',
    '/images/diamond_ring.png',
    '/images/diamond_necklace.png',
    '/images/scifi_weapon.png',
    '/images/ancient_book.png',
    '/images/leather_jacket.png',
    '/images/elegant_dress.png',
    '/images/film_scifi.png',
    '/images/film_thriller.png',
    '/images/post_bts.png',
    '/images/post_casting.png',
    '/images/legendary_crown.png',
    '/images/mech_armor.png',
    '/images/diamond_bracelet.png',
];

const LAND_ASSETS = [...ALL_COLLECTIBLE_IMAGES, '/images/grass_texture.png'];

// ── Data helpers ──────────────────────────────────────────────────────────────

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
    return {
        isNight,
        dayMix,
        sunPosition: [
            Math.cos(sunArc) * 100,
            Math.max(6, Math.sin(sunArc) * 90),
            -45,
        ],
        moonPosition: [
            -Math.cos(sunArc) * 86,
            Math.max(20, 56 - Math.sin(sunArc) * 34),
            34,
        ],
        sky: {
            // Day should look truly sky-blue (less milky white haze).
            turbidity: 3.5 - (1.4 * dayMix),
            rayleigh: 0.2 + (2.8 * dayMix),
            mieDirectionalG: 0.82 - (0.08 * dayMix),
            mieCoefficient: 0.009 - (0.0081 * dayMix),
        },
        starsCount: Math.round(7500 - (6800 * dayMix)),
        ambient: { intensity: 0.3 + (0.86 * dayMix), color: dayMix > 0.45 ? '#eef6ff' : '#9fb8ff' },
        sun: { intensity: 0.1 + (2.35 * dayMix), color: dayMix > 0.3 ? '#ffe9b6' : '#94a3b8' },
        moon: { intensity: 1.08 - (0.8 * dayMix), color: '#dbe7ff' },
        background: dayMix > 0.45 ? '#63C5DA' : '#0b1226',
    };
}

function buildUsersById() {
    const saved = getData('users');
    const all = (saved && saved.length > 0) ? saved : mockUsers;
    return all.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
}

function getOwnerThemeAccent(ownerId, usersById) {
    if (!ownerId) return null;
    const themeId = getData(`silvertriverse_profile_theme_${ownerId}`);
    if (!themeId) return null;
    return getThemeById(themeId)?.accent ?? null;
}

// ── Simple tree (low poly) ────────────────────────────────────────────────────
const Tree = memo(({ position, scale }) => (
    <group position={position} scale={scale}>
        <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.13, 1, 5]} />
            <meshStandardMaterial color="#4d2c19" />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow>
            <coneGeometry args={[0.5, 1.1, 6]} />
            <meshStandardMaterial color="#14532d" roughness={0.8} />
        </mesh>
    </group>
));

const Decorations = memo(() => {
    const trees = useMemo(() => {
        const items = [];
        for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * Math.PI * 2;
            const dist  = 18 + (i % 3) * 5;
            const s = 0.5 + (i % 3) * 0.2;
            items.push({
                pos: [Math.cos(angle) * dist, 0, Math.sin(angle) * dist],
                scale: [s, s, s]
            });
        }
        return items;
    }, []);
    return (
        <>
            {trees.map((t, i) => (
                <Tree key={i} position={t.pos} scale={t.scale} />
            ))}
        </>
    );
});

// ── Pulsing SunOrb ────────────────────────────────────────────────────────────
const SunOrb = memo(({ position = [55, 55, -40], isNight = false }) => {
    const ref = useRef();
    useFrame(({ clock }) => {
        if (ref.current)
            ref.current.material.emissiveIntensity = (isNight ? 0.8 : 1.0) + Math.sin(clock.elapsedTime * 0.7) * 0.25;
    });
    return (
        <mesh ref={ref} position={position}>
            <sphereGeometry args={[3, 10, 10]} />
            <meshStandardMaterial
                color={isNight ? '#e8efff' : '#fde68a'}
                emissive={isNight ? '#c5d2ff' : '#f97316'}
                emissiveIntensity={isNight ? 0.9 : 1.2}
            />
        </mesh>
    );
});

const SkyTintDome = memo(({ isNight = false }) => (
    <mesh>
        <sphereGeometry args={[900, 24, 24]} />
        <meshBasicMaterial
            color={isNight ? '#0b1226' : '#63C5DA'}
            side={THREE.BackSide}
            depthWrite={false}
        />
    </mesh>
));

const LightCloudLayer = memo(({ visible = true, strength = 1 }) => {
    const groupRef = useRef();
    const clouds = useMemo(() => {
        const items = [];
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2;
            const dist = 95 + ((i % 3) * 18);
            items.push({
                key: `lc-${i}`,
                // Lift cloud deck to a more natural mid-sky altitude.
                pos: [Math.cos(angle) * dist, 35 + (i % 3) * 3.2, Math.sin(angle) * dist],
                size: 5.8 + (i % 2) * 1.6,
            });
        }
        return items;
    }, []);

    useFrame(({ clock }) => {
        if (!groupRef.current || !visible) return;
        groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.025) * 0.18;
    });

    if (!visible) return null;

    const opacity = 0.26 + (0.32 * strength);
    return (
        <group ref={groupRef}>
            {clouds.map((c) => (
                <group key={c.key} position={c.pos}>
                    <mesh>
                        <sphereGeometry args={[c.size, 14, 14]} />
                        <meshStandardMaterial color="#f8fbff" transparent opacity={opacity} roughness={1} />
                    </mesh>
                    <mesh position={[c.size * 0.72, -0.35, 0]}>
                        <sphereGeometry args={[c.size * 0.78, 14, 14]} />
                        <meshStandardMaterial color="#f8fbff" transparent opacity={opacity * 0.95} roughness={1} />
                    </mesh>
                    <mesh position={[-c.size * 0.68, -0.25, 0.2]}>
                        <sphereGeometry args={[c.size * 0.7, 14, 14]} />
                        <meshStandardMaterial color="#f8fbff" transparent opacity={opacity * 0.9} roughness={1} />
                    </mesh>
                </group>
            ))}
        </group>
    );
});

// ── Error Boundary for 3D Stability ──────────────────────────────────────────
class MetropolisErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) { return { hasError: true }; }
    render() {
        if (this.state.hasError) {
            return (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white z-50 p-8 text-center">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">🏙️</span>
                    </div>
                    <h2 className="text-xl font-bold mb-2">Metropolis Baseline Stabilized</h2>
                    <p className="text-slate-400 max-w-xs mb-6">The 50x50 metropolitan grid encountered a WebGL timeout. We've paused rendering to protect your hardware.</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
                    >
                        Re-initialize City
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// ── MemoizedPlot ──────────────────────────────────────────────────────────────
const MemoPlot = memo(Plot3D);

// ── Selection Highlight: One mesh to represent the active selection ──────────
const SelectionHighlight = memo(({ targetIndex, halfSizeX, halfSizeZ }) => {
    const meshRef = useRef();
    useFrame(() => {
        if (!meshRef.current || targetIndex === null) {
            if (meshRef.current) meshRef.current.visible = false;
            return;
        }
        meshRef.current.visible = true;
        const { row, col } = indexToRowCol(targetIndex);
        const SPACING = 1.3, ROAD_WIDTH = 1.3;
        const colOffset = Math.floor(col / 4) * ROAD_WIDTH;
        const rowOffset = Math.floor(row / 4) * ROAD_WIDTH;
        const tx = (col * SPACING) + colOffset - halfSizeX + (SPACING / 2);
        const tz = (row * SPACING) + rowOffset - halfSizeZ + (SPACING / 2);

        // Smoothly glide the selection ring
        meshRef.current.position.x += (tx - meshRef.current.position.x) * 0.15;
        meshRef.current.position.z += (tz - meshRef.current.position.z) * 0.15;
        meshRef.current.rotation.y += 0.02;
    });

    return (
        <mesh ref={meshRef} position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.66, 0.66, 0.06, 32]} />
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.4} />
        </mesh>
    );
});

// ── Camera Controller: Animates to selected plot ──────────────────────────────
const CameraController = memo(({ targetIndex, halfSizeX, halfSizeZ }) => {
    const { controls } = useThree();
    useFrame(() => {
        if (!controls || targetIndex === null) return;
        const { row, col } = indexToRowCol(targetIndex);
        const SPACING = 1.3, ROAD_WIDTH = 1.3;
        const colOffset = Math.floor(col / 4) * ROAD_WIDTH;
        const rowOffset = Math.floor(row / 4) * ROAD_WIDTH;
        const tx = (col * SPACING) + colOffset - halfSizeX + (SPACING / 2);
        const tz = (row * SPACING) + rowOffset - halfSizeZ + (SPACING / 2);

        // Smoothly lerp the controls target
        const lerpFactor = 0.08;
        controls.target.x += (tx - controls.target.x) * lerpFactor;
        controls.target.y += (0 - controls.target.y) * lerpFactor;
        controls.target.z += (tz - controls.target.z) * lerpFactor;
    });
    return null;
});

// ── Inner scene: textures loaded ONCE here, shared across all plots ───────────
function getPlotProgress(index) {
    const saved = getData(`land_plot_progress_${index}`);
    return saved || 0;
}

// ── Instanced Ground Bases: 1 Draw Call for 2500 plots with Grass ────────────
const InstancedBases = memo(({ ownershipMap, user, spacing, roadWidth, halfSizeX, halfSizeZ, onPlotClick, grassTexture }) => {
    const meshRef = useRef();

    useLayoutEffect(() => {
        if (!meshRef.current) return;
        const tempObj = new THREE.Object3D();
        const tempColor = new THREE.Color();

        for (let i = 0; i < COLS * ROWS; i++) {
            const { row, col } = indexToRowCol(i);
            const colOffset = Math.floor(col / 4) * roadWidth;
            const rowOffset = Math.floor(row / 4) * roadWidth;
            const px = (col * spacing) + colOffset - halfSizeX + (spacing / 2);
            const pz = (row * spacing) + rowOffset - halfSizeZ + (spacing / 2);

            tempObj.position.set(px, -0.15, pz);
            tempObj.updateMatrix();
            meshRef.current.setMatrixAt(i, tempObj.matrix);

            const owner = ownershipMap[i];
            if (owner) {
                const isMine = owner.ownerId === user?.id;
                tempColor.set(isMine ? '#92400e' : '#1e1b4b');
            } else {
                tempColor.set('#064e3b'); // Dark Forest Green for unowned
            }
            meshRef.current.setColorAt(i, tempColor);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }, [ownershipMap, user, spacing, roadWidth, halfSizeX, halfSizeZ]);

    return (
        <instancedMesh ref={meshRef} args={[null, null, COLS * ROWS]} onPointerDown={(e) => { e.stopPropagation(); onPlotClick(e.instanceId); }}>
            <boxGeometry args={[1.2, 0.2, 1.2]} />
            <meshStandardMaterial map={grassTexture} color="#2d5a27" roughness={0.8} />
        </instancedMesh>
    );
});

function Scene({ ownershipMap, user, onPlotClick, selectedPlotIndex }) {
    const usersById = useMemo(() => buildUsersById(), []);
    const grassTexture = useTexture('/images/grass_texture.png');
    
    useLayoutEffect(() => {
        if (grassTexture) {
            grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
            grassTexture.repeat.set(120, 120); // Tile for infinite feel
        }
    }, [grassTexture]);

    // Load ALL collectible textures + grass (using static array to avoid infinite re-renders)
    const loadedTextures = useTexture(LAND_ASSETS);
    const textureMap = useMemo(() => {
        const map = {};
        LAND_ASSETS.forEach((path, i) => {
            map[path] = loadedTextures[i];
        });
        return map;
    }, [loadedTextures]);

    // Item ID → image path lookup table
    const ITEM_IMAGE_MAP = useMemo(() => ({
        y1: '/images/bomber_jacket.png',
        y2: '/images/diamond_ring.png',
        y3: '/images/diamond_necklace.png',
        y4: '/images/scifi_weapon.png',
        y5: '/images/ancient_book.png',
        y6: '/images/scifi_weapon.png',
        y7: '/images/bomber_jacket.png',
        y8: '/images/scifi_weapon.png',
        y9: '/images/scifi_weapon.png',
        y10: '/images/scifi_weapon.png',
        o1: '/images/leather_jacket.png',
        o2: '/images/bomber_jacket.png',
        o3: '/images/elegant_dress.png',
        o4: '/images/leather_jacket.png',
        o5: '/images/elegant_dress.png',
        o6: '/images/leather_jacket.png',
        o7: '/images/bomber_jacket.png',
        o8: '/images/elegant_dress.png',
        o9: '/images/leather_jacket.png',
        o10: '/images/bomber_jacket.png',
    }), []);

    const RELIC_IMAGE_MAP = useMemo(() => ({
        1: '/images/scifi_weapon.png',
        2: '/images/film_thriller.png',
        3: '/images/film_scifi.png',
        4: '/images/post_bts.png',
        5: '/images/post_casting.png',
    }), []);

    const dayNight = useMemo(() => getDayNightProfile(), []);
    const sunPos = dayNight.sunPosition;

    // Build wall textures list for a user (deduplicated, max 3)
    const buildWallTextures = (ownerUser) => {
        if (!ownerUser) return [];
        const paths = [];
        // Premium & daily purchased items
        for (const itemId of (ownerUser.purchasedItems || [])) {
            const p = ITEM_IMAGE_MAP[itemId];
            if (p && !paths.includes(p)) paths.push(p);
            if (paths.length >= 3) break;
        }
        // Relics
        for (const rid of (ownerUser.ownedRelics || [])) {
            const p = RELIC_IMAGE_MAP[rid] || '/images/scifi_weapon.png';
            if (p && !paths.includes(p)) paths.push(p);
            if (paths.length >= 3) break;
        }
        return paths.slice(0, 3).map(p => textureMap[p]).filter(Boolean);
    };

    const SPACING = 1.3;
    const ROAD_WIDTH = 1.3;
    const totalColSpan = (COLS * SPACING) + (Math.floor((COLS - 1) / 4) * ROAD_WIDTH);
    const totalRowSpan = (ROWS * SPACING) + (Math.floor((ROWS - 1) / 4) * ROAD_WIDTH);
    const halfSizeX = totalColSpan / 2;
    const halfSizeZ = totalRowSpan / 2;

    const plots = useMemo(() => {
        const items = [];
        const radiusSq = 60 * 60; 

        // Current view-point
        const currentIdx = selectedPlotIndex ?? 0;
        const { row: tr, col: tc } = indexToRowCol(currentIdx);
        const colOffT = Math.floor(tc / 4) * ROAD_WIDTH;
        const rowOffT = Math.floor(tr / 4) * ROAD_WIDTH;
        const targetX = (tc * SPACING) + colOffT - halfSizeX + (SPACING / 2);
        const targetZ = (tr * SPACING) + rowOffT - halfSizeZ + (SPACING / 2);

        for (let i = 0; i < COLS * ROWS; i++) {
            const owner = ownershipMap[i];
            const isMine = owner?.ownerId === user?.id;
            const isSelected = selectedPlotIndex === i;

            // Calculate position for culling
            const { row, col } = indexToRowCol(i);
            const colOffset = Math.floor(col / 4) * ROAD_WIDTH;
            const rowOffset = Math.floor(row / 4) * ROAD_WIDTH;
            const px = (col * SPACING) + colOffset - halfSizeX + (SPACING / 2);
            const pz = (row * SPACING) + rowOffset - halfSizeZ + (SPACING / 2);

            const distSq = Math.pow(px - targetX, 2) + Math.pow(pz - targetZ, 2);

            // Re-enable rendering for nearby houses OR owned houses
            if (isMine || isSelected || distSq < radiusSq) {
                const ownerId = owner?.ownerId;
                const ownerUser = ownerId ? usersById[ownerId] : null;

                items.push(
                    <MemoPlot
                        key={i}
                        index={i}
                        row={row}
                        col={col}
                        x={px}
                        z={pz}
                        owner={owner}
                        isMine={isMine}
                        isSelected={isSelected}
                        onClick={onPlotClick}
                        ownerThemeAccent={getOwnerThemeAccent(ownerId, usersById)}
                        ownerCardCount={ownerUser?.ownedCards?.length ?? 0}
                        wallTextures={buildWallTextures(ownerUser)}
                        progress={getPlotProgress(i)}
                    />
                );
            }
        }
        return items;
    }, [ownershipMap, user, onPlotClick, selectedPlotIndex, usersById, textureMap, halfSizeX, halfSizeZ, SPACING, ROAD_WIDTH]);

    return (
        <>
            <color attach="background" args={[dayNight.background]} />
            <PerspectiveCamera makeDefault position={[0, 38, 50]} fov={36} />

            {/* Sky */}
            <SkyTintDome isNight={dayNight.isNight} />
            <Sky
                sunPosition={sunPos}
                turbidity={dayNight.sky.turbidity}
                rayleigh={dayNight.sky.rayleigh}
                mieDirectionalG={dayNight.sky.mieDirectionalG}
                mieCoefficient={dayNight.sky.mieCoefficient}
            />
            <LightCloudLayer visible={!dayNight.isNight} strength={dayNight.dayMix} />
            <Stars radius={210} depth={70} count={dayNight.starsCount} factor={3.2} saturation={1} fade speed={dayNight.isNight ? 0.3 : 0.1} />
            {dayNight.isNight ? (
                <SunOrb position={dayNight.moonPosition} isNight />
            ) : (
                <SunOrb position={sunPos} />
            )}


            {/* Lighting — matching working LandWorld settings */}
            <ambientLight intensity={dayNight.ambient.intensity} color={dayNight.ambient.color} />
            <directionalLight
                position={sunPos}
                intensity={dayNight.sun.intensity}
                color={dayNight.sun.color}
                castShadow
                shadow-mapSize={[256, 256]}
                shadow-camera-far={150}
                shadow-camera-left={-40}
                shadow-camera-right={40}
                shadow-camera-top={40}
                shadow-camera-bottom={-40}
            />
            <directionalLight position={dayNight.moonPosition} intensity={dayNight.moon.intensity} color={dayNight.moon.color} />

            {/* World: Plots + Roads (Simplified Ground) */}
            <group>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} receiveShadow>
                    <planeGeometry args={[180, 180]} />
                    <meshStandardMaterial
                        color="#123512"
                        roughness={0.85}
                        metalness={0.1}
                    />
                </mesh>

                {/* Outer World Foundation (ocean-like far zone) */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]} receiveShadow>
                    <planeGeometry args={[1200, 1200]} />
                    <meshStandardMaterial
                        color="#0f4f68"
                        emissive="#0a3446"
                        emissiveIntensity={0.12}
                        roughness={0.22}
                        metalness={0.68}
                    />
                </mesh>

                {/* Distant Water/Ocean */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.28, -550]} receiveShadow>
                    <planeGeometry args={[2000, 400]} />
                    <meshStandardMaterial color="#0b4f6c" roughness={0.2} metalness={0.7} />
                </mesh>

                <Roads cols={COLS} rows={ROWS} spacing={SPACING} roadWidth={ROAD_WIDTH} />
                <group position={[0, -5, -320]}>
                    <TownshipSurroundings />
                </group>
                
                <InstancedBases 
                    ownershipMap={ownershipMap}
                    user={user}
                    spacing={SPACING}
                    roadWidth={ROAD_WIDTH}
                    halfSizeX={halfSizeX}
                    halfSizeZ={halfSizeZ}
                    onPlotClick={onPlotClick}
                    grassTexture={grassTexture}
                />

                <SelectionHighlight targetIndex={selectedPlotIndex} halfSizeX={halfSizeX} halfSizeZ={halfSizeZ} />
                
                {plots}
            </group>


            <CameraController targetIndex={selectedPlotIndex} halfSizeX={halfSizeX} halfSizeZ={halfSizeZ} />

            <MapControls
                enableDamping
                dampingFactor={0.06}
                maxPolarAngle={Math.PI / 2.15}
                minDistance={10}
                maxDistance={Math.max(120, totalColSpan * 1.5)}
                panSpeed={1.2}
                rotateSpeed={0.8}
            />
        </>
    );
}

// ── Land3D wrapper ────────────────────────────────────────────────────────────
export default function Land3D({ ownershipMap, user, onPlotClick, selectedPlotIndex }) {
    return (
        <div style={{ width: '100%', height: '100%', cursor: 'move' }}>
            <MetropolisErrorBoundary>
                <Canvas
                    shadows
                    onCreated={({ gl }) => {
                        gl.powerPreference = 'high-performance';
                        gl.shadowMap.type = THREE.PCFSoftShadowMap;
                    }}
                >
                    <Suspense fallback={null}>
                        <Scene 
                            ownershipMap={ownershipMap} 
                            user={user} 
                            onPlotClick={onPlotClick} 
                            selectedPlotIndex={selectedPlotIndex}
                        />
                    </Suspense>
                </Canvas>
            </MetropolisErrorBoundary>
        </div>
    );
}
