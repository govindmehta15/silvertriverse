import { Suspense, useMemo, useRef, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    OrbitControls, PerspectiveCamera, Stars,
    ContactShadows, Grid, Sky, useTexture
} from '@react-three/drei';
import Plot3D from './Plot3D';
import { COLS, ROWS, indexToRowCol } from '../data/plotsData';
import { getData } from '../utils/storageService';
import { mockUsers } from '../mock/mockUsers';
import { getThemeById } from '../data/profileThemes';

// ── All collectible image paths used by the app ───────────────────────────────
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

// ── Data helpers ──────────────────────────────────────────────────────────────
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
const SunOrb = memo(() => {
    const ref = useRef();
    useFrame(({ clock }) => {
        if (ref.current)
            ref.current.material.emissiveIntensity = 1.0 + Math.sin(clock.elapsedTime * 0.7) * 0.4;
    });
    return (
        <mesh ref={ref} position={[55, 55, -40]}>
            <sphereGeometry args={[3, 10, 10]} />
            <meshStandardMaterial color="#fde68a" emissive="#f97316" emissiveIntensity={1.2} />
        </mesh>
    );
});

// ── MemoizedPlot ──────────────────────────────────────────────────────────────
const MemoPlot = memo(Plot3D);

// ── Inner scene: textures loaded ONCE here, shared across all plots ───────────
function Scene({ ownershipMap, user, onPlotClick, selectedPlotIndex }) {
    const usersById = useMemo(() => buildUsersById(), []);

    // Load ALL collectible textures in one call — shared across all plots
    const loadedTextures = useTexture(ALL_COLLECTIBLE_IMAGES);
    const textureMap = useMemo(() => {
        const map = {};
        ALL_COLLECTIBLE_IMAGES.forEach((path, i) => { map[path] = loadedTextures[i]; });
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

    const plots = useMemo(() => {
        const items = [];
        for (let i = 0; i < COLS * ROWS; i++) {
            const { row, col } = indexToRowCol(i);
            const owner = ownershipMap[i];
            const ownerId = owner?.ownerId;
            const ownerUser = ownerId ? usersById[ownerId] : null;
            const wallTextures = buildWallTextures(ownerUser);

            items.push(
                <MemoPlot
                    key={i}
                    index={i}
                    row={row}
                    col={col}
                    owner={owner}
                    isMine={ownerId === user?.id}
                    isSelected={selectedPlotIndex === i}
                    onClick={onPlotClick}
                    ownerThemeAccent={getOwnerThemeAccent(ownerId, usersById)}
                    ownerCardCount={ownerUser?.ownedCards?.length ?? 0}
                    wallTextures={wallTextures}
                />
            );
        }
        return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ownershipMap, user, onPlotClick, selectedPlotIndex, usersById, textureMap]);

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 38, 50]} fov={36} />

            {/* Sky */}
            <Sky
                sunPosition={[60, 35, -60]}
                inclination={0.48}
                azimuth={0.28}
                turbidity={10}
                rayleigh={1.8}
                mieDirectionalG={0.85}
                mieCoefficient={0.004}
            />

            {/* Stars */}
            <Stars radius={150} depth={50} count={4000} factor={4} saturation={1} fade speed={0.6} />

            {/* Lighting — warm sun + cool fill */}
            <ambientLight intensity={1.4} color="#fef3c7" />
            <directionalLight
                position={[50, 50, -40]}
                intensity={3}
                color="#fde68a"
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-camera-far={120}
                shadow-camera-left={-40}
                shadow-camera-right={40}
                shadow-camera-top={40}
                shadow-camera-bottom={-40}
            />
            <directionalLight position={[-35, 25, 35]} intensity={0.9} color="#bfdbfe" />

            <SunOrb />

            {/* Grid world */}
            <group>
                <Grid
                    infiniteGrid
                    fadeDistance={110}
                    fadeStrength={5}
                    cellSize={1.3}
                    sectionSize={6.5}
                    sectionThickness={1.5}
                    sectionColor="#334155"
                    cellColor="#1e293b"
                    position={[0, -0.12, 0]}
                />
                {plots}
                <Decorations />
            </group>

            <ContactShadows
                position={[0, -0.12, 0]}
                opacity={0.45}
                scale={60}
                blur={2}
                far={10}
            />

            <OrbitControls
                enableDamping
                dampingFactor={0.06}
                maxPolarAngle={Math.PI / 2.15}
                minDistance={14}
                maxDistance={100}
                target={[0, 0, 0]}
            />
        </>
    );
}

// ── Land3D wrapper ────────────────────────────────────────────────────────────
export default function Land3D({ ownershipMap, user, onPlotClick, selectedPlotIndex }) {
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
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}
