import { useRef, useMemo, useState, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text, Cone, Cylinder, Sphere, Torus, Octahedron } from '@react-three/drei';
import * as THREE from 'three';

// ── Theme accent → colours ────────────────────────────────────────────────────
const THEME_COLOURS = {
  gold:    { house: '#f59e0b', plot: '#6b3a0a', glow: '#fbbf24' },
  emerald: { house: '#10b981', plot: '#084c38', glow: '#34d399' },
  violet:  { house: '#a78bfa', plot: '#3b0764', glow: '#c4b5fd' },
  red:     { house: '#f87171', plot: '#7f1d1d', glow: '#fca5a5' },
  cyan:    { house: '#22d3ee', plot: '#0e4959', glow: '#67e8f9' },
  slate:   { house: '#94a3b8', plot: '#1e293b', glow: '#cbd5e1' },
  rose:    { house: '#fb7185', plot: '#4c0519', glow: '#fda4af' },
  orange:  { house: '#fb923c', plot: '#431407', glow: '#fdba74' },
  green:   { house: '#4ade80', plot: '#14532d', glow: '#86efac' },
  blue:    { house: '#60a5fa', plot: '#1e3a8a', glow: '#93c5fd' },
  neutral: { house: '#e2e8f0', plot: '#334155', glow: '#f1f5f9' },
};

const FALLBACK_COLOURS = [
  { house: '#f59e0b', plot: '#6b3a0a', glow: '#fbbf24' },
  { house: '#60a5fa', plot: '#1e3a8a', glow: '#93c5fd' },
  { house: '#4ade80', plot: '#14532d', glow: '#86efac' },
  { house: '#f87171', plot: '#7f1d1d', glow: '#fca5a5' },
  { house: '#a78bfa', plot: '#3b0764', glow: '#c4b5fd' },
  { house: '#f472b6', plot: '#500724', glow: '#f9a8d4' },
  { house: '#22d3ee', plot: '#0e4959', glow: '#67e8f9' },
  { house: '#fb923c', plot: '#431407', glow: '#fdba74' },
];

const hashInt = (id) => {
  let h = 0;
  const s = String(id);
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h);
};

const resolveColours = (ownerId, ownerThemeAccent) => {
  if (ownerThemeAccent && THEME_COLOURS[ownerThemeAccent]) return THEME_COLOURS[ownerThemeAccent];
  return FALLBACK_COLOURS[hashInt(ownerId || '0') % FALLBACK_COLOURS.length];
};

// ── Wall Frame: uses a pre-loaded THREE.Texture directly ─────────────────────
// meshBasicMaterial — no lighting calc, very fast
const WallFrame = memo(({ texture, position, rotation }) => {
  const imageMat = useMemo(() => {
    if (!texture) return null;
    const mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.FrontSide });
    return mat;
  }, [texture]);

  if (!imageMat) return null;

  return (
    <group position={position} rotation={rotation}>
      {/* Gold outer frame */}
      <mesh>
        <boxGeometry args={[0.32, 0.32, 0.04]} />
        <meshStandardMaterial color="#92400e" roughness={0.3} metalness={0.85} />
      </mesh>
      {/* Dark backing */}
      <mesh position={[0, 0, 0.015]}>
        <boxGeometry args={[0.26, 0.26, 0.02]} />
        <meshStandardMaterial color="#1c1917" roughness={0.8} />
      </mesh>
      {/* Collectible image — flat plane with preloaded texture */}
      <mesh position={[0, 0, 0.028]}>
        <planeGeometry args={[0.23, 0.23]} />
        <primitive object={imageMat} attach="material" />
      </mesh>
      {/* Tiny point light for a gallery spotlight effect */}
      <pointLight color="#fffbeb" intensity={0.5} distance={0.8} position={[0, 0.18, 0.1]} />
    </group>
  );
});

// ── Collectible gallery helper ────────────────────────────────────────────────
const Gallery = memo(({ wallTextures }) => {
  if (!wallTextures || wallTextures.length === 0) return null;
  const slots = [
    { pos: [0,    0.36, 0.385], rot: [0, 0, 0] },          // front centre
    { pos: [-0.39, 0.36, 0],   rot: [0,  Math.PI / 2, 0] },// left side
    { pos: [ 0.39, 0.36, 0],   rot: [0, -Math.PI / 2, 0] },// right side
  ];
  return (
    <>
      {wallTextures.slice(0, slots.length).map((tex, i) => (
        <WallFrame key={i} texture={tex} position={slots[i].pos} rotation={slots[i].rot} />
      ))}
    </>
  );
});

// ── Orbital frames (for tower/pyramid) ────────────────────────────────────────
const OrbitalFrames = memo(({ wallTextures, radius = 0.65, y = 0.4, count = 3 }) => {
  if (!wallTextures || wallTextures.length === 0) return null;
  return (
    <>
      {wallTextures.slice(0, count).map((tex, i) => {
        const angle = (i / count) * Math.PI * 2;
        return (
          <WallFrame key={i} texture={tex}
            position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}
            rotation={[0, -angle + Math.PI, 0]}
          />
        );
      })}
    </>
  );
});

// ── 6 House designs ───────────────────────────────────────────────────────────

const ClassicCottage = memo(({ color, wallTextures }) => (
  <group>
    <Box args={[0.76, 0.58, 0.72]} position={[0, 0.29, 0]} castShadow>
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
    </Box>
    <Cone args={[0.62, 0.44, 4]} position={[0, 0.78, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <meshStandardMaterial color="#7f1d1d" roughness={0.6} />
    </Cone>
    {/* Chimney */}
    <Box args={[0.11, 0.28, 0.11]} position={[0.22, 0.88, 0.14]} castShadow>
      <meshStandardMaterial color="#1c1917" roughness={0.8} />
    </Box>
    {/* Door */}
    <Box args={[0.14, 0.22, 0.04]} position={[0, 0.12, 0.37]}>
      <meshStandardMaterial color="#78350f" roughness={0.5} />
    </Box>
    {/* Window glows */}
    <Box args={[0.11, 0.11, 0.04]} position={[-0.2, 0.33, 0.37]}>
      <meshStandardMaterial color="#fff" emissive="#fcd34d" emissiveIntensity={3} />
    </Box>
    <Box args={[0.11, 0.11, 0.04]} position={[0.2, 0.33, 0.37]}>
      <meshStandardMaterial color="#fff" emissive="#fcd34d" emissiveIntensity={3} />
    </Box>
    <Gallery wallTextures={wallTextures} />
  </group>
));

const ModernVilla = memo(({ color, wallTextures }) => (
  <group>
    <Box args={[0.85, 0.4, 0.78]} position={[0, 0.2, 0]} castShadow>
      <meshStandardMaterial color={color} roughness={0.08} metalness={0.6} />
    </Box>
    <Box args={[0.5, 0.3, 0.5]} position={[0.15, 0.53, 0.1]} castShadow>
      <meshStandardMaterial color={new THREE.Color(color).multiplyScalar(0.7)} roughness={0.1} metalness={0.7} />
    </Box>
    {/* Glass facade */}
    <Box args={[0.82, 0.36, 0.04]} position={[0, 0.2, 0.41]}>
      <meshStandardMaterial color="#bfdbfe" roughness={0} metalness={1} transparent opacity={0.35} />
    </Box>
    {/* Cantilever slab */}
    <Box args={[1.0, 0.06, 0.3]} position={[0, 0.4, -0.45]} castShadow>
      <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.5} />
    </Box>
    {/* Light strip */}
    <Box args={[0.6, 0.04, 0.02]} position={[0, 0.26, 0.44]}>
      <meshStandardMaterial color="#fff" emissive={color} emissiveIntensity={4} />
    </Box>
    <Gallery wallTextures={wallTextures} />
  </group>
));

const CrystalTower = memo(({ color, wallTextures }) => (
  <group>
    <Cylinder args={[0.28, 0.38, 1.1, 6]} position={[0, 0.55, 0]} castShadow>
      <meshStandardMaterial color={color} roughness={0.05} metalness={0.5} transparent opacity={0.85} />
    </Cylinder>
    <Octahedron args={[0.38]} position={[0, 1.22, 0]} castShadow>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} roughness={0} metalness={0.4} transparent opacity={0.9} />
    </Octahedron>
    {[0.3, 0.65, 1.0].map((y, i) => (
      <Torus key={i} args={[0.3, 0.022, 8, 14]} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={2} />
      </Torus>
    ))}
    <OrbitalFrames wallTextures={wallTextures} radius={0.6} y={0.45} count={Math.min(wallTextures?.length ?? 0, 3)} />
  </group>
));

const Pagoda = memo(({ color, wallTextures }) => (
  <group>
    <Cylinder args={[0.44, 0.5, 0.28, 8]} position={[0, 0.14, 0]} castShadow>
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
    </Cylinder>
    {[0, 1, 2].map((i) => (
      <group key={i} position={[0, 0.28 + i * 0.3, 0]}>
        <Cylinder args={[0.37 - i * 0.1, 0.39 - i * 0.1, 0.18, 8]} castShadow>
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
        </Cylinder>
        <Cone args={[0.52 - i * 0.12, 0.12, 8]} position={[0, 0.15, 0]} rotation={[Math.PI, 0, 0]}>
          <meshStandardMaterial color="#7f1d1d" roughness={0.5} />
        </Cone>
      </group>
    ))}
    <Cone args={[0.08, 0.34, 8]} position={[0, 1.3, 0]}>
      <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={1.5} />
    </Cone>
    {/* Lanterns */}
    {[[-0.3, 0.6, 0.3], [0.3, 0.6, -0.3]].map(([x, y, z], i) => (
      <Sphere key={i} args={[0.07, 6, 6]} position={[x, y, z]}>
        <meshStandardMaterial color="#fef08a" emissive="#fbbf24" emissiveIntensity={3} />
      </Sphere>
    ))}
    {/* Frames on base sides */}
    {wallTextures && wallTextures.slice(0, 2).map((tex, i) => (
      <WallFrame key={i} texture={tex}
        position={[0, 0.18, i === 0 ? 0.47 : -0.47]}
        rotation={[0, i === 0 ? 0 : Math.PI, 0]}
      />
    ))}
  </group>
));

// Floating cube with animated y from parent
const FloatingCube = memo(({ color, floatY, wallTextures }) => (
  <group position={[0, floatY, 0]}>
    <Box args={[0.65, 0.65, 0.65]} castShadow>
      <meshStandardMaterial color={color} roughness={0.02} metalness={0.9} emissive={color} emissiveIntensity={0.2} />
    </Box>
    {[0, 1, 2].map((i) => (
      <Torus key={i} args={[0.42, 0.02, 6, 14]}
        rotation={[i === 0 ? Math.PI / 2 : 0, i === 1 ? Math.PI / 2 : 0, i === 2 ? Math.PI / 2 : 0]}>
        <meshStandardMaterial color="#fff" emissive={color} emissiveIntensity={3} />
      </Torus>
    ))}
    <Torus args={[0.52, 0.04, 6, 22]} position={[0, -0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} transparent opacity={0.7} />
    </Torus>
    {/* Frames on cube faces */}
    {wallTextures && wallTextures.slice(0, 3).map((tex, i) => {
      const angle = (i / 3) * Math.PI * 2;
      return (
        <WallFrame key={i} texture={tex}
          position={[Math.cos(angle) * 0.37, 0, Math.sin(angle) * 0.37]}
          rotation={[0, -angle, 0]}
        />
      );
    })}
  </group>
));

const CosmicPyramid = memo(({ color, elapsed, index, wallTextures }) => (
  <group>
    <Cone args={[0.6, 1.1, 4]} position={[0, 0.55, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <meshStandardMaterial color={color} roughness={0.05} metalness={0.6} emissive={color} emissiveIntensity={0.14} />
    </Cone>
    <group rotation={[0.3, (elapsed || 0) * 1.1 + index, 0]}>
      <Torus args={[0.7, 0.03, 6, 22]}>
        <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={3} transparent opacity={0.8} />
      </Torus>
    </group>
    <group rotation={[1.1, -(elapsed || 0) * 0.75 + index, 0]}>
      <Torus args={[0.55, 0.025, 6, 22]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} transparent opacity={0.6} />
      </Torus>
    </group>
    <Sphere args={[0.1, 6, 6]} position={[0, 1.15, 0]}>
      <meshStandardMaterial color="#fff" emissive={color} emissiveIntensity={5} />
    </Sphere>
    <OrbitalFrames wallTextures={wallTextures} radius={0.68} y={0.15} count={Math.min(wallTextures?.length ?? 0, 4)} />
  </group>
));

// ── HouseModel ─────────────────────────────────────────────────────────────────
const HouseModel = memo(({ seed, colors, cardCount, wallTextures, elapsed, index, floatY }) => {
  const type = useMemo(() => {
    if (cardCount >= 10) return 5;
    if (cardCount >= 5)  return 4;
    if (cardCount >= 3)  return 3;
    if (cardCount >= 1)  return 2;
    return seed % 2 === 0 ? 0 : 1;
  }, [cardCount, seed]);

  const c = colors.house;
  return (
    <>
      {type === 0 && <ClassicCottage color={c} wallTextures={wallTextures} />}
      {type === 1 && <ModernVilla color={c} wallTextures={wallTextures} />}
      {type === 2 && <CrystalTower color={c} wallTextures={wallTextures} />}
      {type === 3 && <Pagoda color={c} wallTextures={wallTextures} />}
      {type === 4 && <FloatingCube color={c} floatY={floatY} wallTextures={wallTextures} />}
      {type === 5 && <CosmicPyramid color={c} elapsed={elapsed} index={index} wallTextures={wallTextures} />}
    </>
  );
});

// ── Plot3D ─────────────────────────────────────────────────────────────────────
function Plot3D({
  index, row, col, owner, isMine, isSelected, onClick,
  ownerThemeAccent,
  ownerCardCount,
  wallTextures,   // ← pre-loaded THREE.Texture[] from Land3D
}) {
  const houseGroupRef = useRef();
  const [hovered, setHovered]   = useState(false);
  const [floatState, setFloat]  = useState({ y: 0.12, elapsed: 0 });

  const colors   = useMemo(() => resolveColours(owner?.ownerId, ownerThemeAccent), [owner?.ownerId, ownerThemeAccent]);
  const houseSeed = useMemo(() => hashInt(owner?.ownerId || '0'), [owner?.ownerId]);
  const cardCount = ownerCardCount ?? 0;
  const isOwned   = !!owner;
  const initial   = owner?.ownerName ? owner.ownerName.trim().charAt(0).toUpperCase() : '';

  const x = col - 11.5;
  const z = row - 11.5;

  // Animate float + rotation only for non-advanced houses
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const needFloat = cardCount < 4;
    if (needFloat && houseGroupRef.current) {
      houseGroupRef.current.position.y = 0.12 + Math.sin(t * 1.6 + index * 0.3) * 0.04;
      houseGroupRef.current.rotation.y += 0.003;
    }
    setFloat({ y: 0.44 + Math.sin(t * 1.8 + index) * 0.12, elapsed: t });
  });

  // Ground plate colour
  const plotColor        = isOwned ? (isMine ? '#78350f' : colors.plot) : (hovered ? '#1e3a5f' : '#0c1a2e');
  const plotEmissive     = isOwned ? colors.glow : (hovered ? '#1d4ed8' : '#000000');
  const plotEmissiveIntensity = isOwned ? 0.14 : (hovered ? 0.2 : 0);

  return (
    <group position={[x * 1.3, 0, z * 1.3]}>

      {/* ── Ground plate ──────────────────────────────────── */}
      <Box
        args={[1.1, 0.18, 1.1]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onClick(index); }}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={plotColor}
          emissive={plotEmissive}
          emissiveIntensity={plotEmissiveIntensity}
          roughness={0.28}
          metalness={0.4}
        />
      </Box>

      {/* ── Border accents (owned only) ─────────────────── */}
      {isOwned && (
        <>
          {/* Corner posts */}
          {[[-0.48, 0, -0.48], [0.48, 0, -0.48], [-0.48, 0, 0.48], [0.48, 0, 0.48]].map(([cx, , cz], i) => (
            <Box key={i} args={[0.07, 0.22, 0.07]} position={[cx, 0, cz]}>
              <meshStandardMaterial color={colors.glow} emissive={colors.glow} emissiveIntensity={1} roughness={0.2} metalness={0.6} />
            </Box>
          ))}
          {/* Edge strips */}
          <Box args={[0.88, 0.04, 0.04]} position={[0, 0.09, -0.52]}>
            <meshStandardMaterial color={colors.glow} emissive={colors.glow} emissiveIntensity={1.5} transparent opacity={0.75} />
          </Box>
          <Box args={[0.88, 0.04, 0.04]} position={[0, 0.09,  0.52]}>
            <meshStandardMaterial color={colors.glow} emissive={colors.glow} emissiveIntensity={1.5} transparent opacity={0.75} />
          </Box>
          <Box args={[0.04, 0.04, 0.88]} position={[-0.52, 0.09, 0]}>
            <meshStandardMaterial color={colors.glow} emissive={colors.glow} emissiveIntensity={1.5} transparent opacity={0.75} />
          </Box>
          <Box args={[0.04, 0.04, 0.88]} position={[ 0.52, 0.09, 0]}>
            <meshStandardMaterial color={colors.glow} emissive={colors.glow} emissiveIntensity={1.5} transparent opacity={0.75} />
          </Box>
        </>
      )}

      {/* ── House ──────────────────────────────────────────── */}
      {isOwned && (
        <group ref={houseGroupRef}>
          <HouseModel
            seed={houseSeed}
            colors={colors}
            cardCount={cardCount}
            wallTextures={wallTextures}
            elapsed={floatState.elapsed}
            floatY={floatState.y}
            index={index}
          />

          {/* Owner initial label */}
          <Text
            position={[0, 2.0, 0]}
            fontSize={0.34}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.055}
            outlineColor="#000"
          >
            {initial}
          </Text>

          {/* Glow light */}
          <pointLight
            color={isMine ? '#f59e0b' : colors.glow}
            intensity={2.5}
            distance={3.5}
            position={[0, 0.4, 0]}
          />
        </group>
      )}

      {/* ── Selection / hover ring ─────────────────────────── */}
      {(hovered || isSelected) && (
        <Cylinder args={[0.65, 0.65, 0.04, 18]} position={[0, -0.05, 0]}>
          <meshBasicMaterial
            color={isSelected ? colors.glow : '#60a5fa'}
            transparent
            opacity={0.38}
          />
        </Cylinder>
      )}
    </group>
  );
}

export default memo(Plot3D);
