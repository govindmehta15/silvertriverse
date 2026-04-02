import { useMemo } from 'react';
import { Box, Cone, Cylinder, Octahedron, Sphere, Torus } from '@react-three/drei';
import * as THREE from 'three';

function hex(color) {
  return new THREE.Color(color);
}

function DoorAndWindows({ trimColor, windows, doorStyle }) {
  return (
    <>
      <Box args={[doorStyle === 'double' ? 0.16 : 0.11, 0.22, 0.04]} position={[0, 0.12, 0.37]}>
        <meshStandardMaterial color={trimColor} roughness={0.5} />
      </Box>
      {windows.front && (
        <>
          <Box args={[0.11, 0.11, 0.04]} position={[-0.2, 0.33, 0.37]}>
            <meshStandardMaterial color="#fff" emissive="#fcd34d" emissiveIntensity={1.8} />
          </Box>
          <Box args={[0.11, 0.11, 0.04]} position={[0.2, 0.33, 0.37]}>
            <meshStandardMaterial color="#fff" emissive="#fcd34d" emissiveIntensity={1.8} />
          </Box>
        </>
      )}
      {windows.left && (
        <Box args={[0.04, 0.1, 0.12]} position={[-0.39, 0.34, 0]}>
          <meshStandardMaterial color="#bfdbfe" metalness={0.35} roughness={0.2} />
        </Box>
      )}
      {windows.right && (
        <Box args={[0.04, 0.1, 0.12]} position={[0.39, 0.34, 0]}>
          <meshStandardMaterial color="#bfdbfe" metalness={0.35} roughness={0.2} />
        </Box>
      )}
    </>
  );
}

const ClassicCottage = ({ wallColor, roofColor, trimColor, windows, doorStyle }) => (
  <group>
    <Box args={[0.76, 0.58, 0.72]} position={[0, 0.29, 0]} castShadow>
      <meshStandardMaterial color={wallColor} roughness={0.3} metalness={0.2} />
    </Box>
    <Cone args={[0.62, 0.44, 4]} position={[0, 0.78, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <meshStandardMaterial color={roofColor} roughness={0.6} />
    </Cone>
    <Box args={[0.11, 0.28, 0.11]} position={[0.22, 0.88, 0.14]} castShadow>
      <meshStandardMaterial color="#1c1917" roughness={0.8} />
    </Box>
    <DoorAndWindows trimColor={trimColor} windows={windows} doorStyle={doorStyle} />
  </group>
);

const ModernVilla = ({ wallColor, trimColor, windows, doorStyle }) => (
  <group>
    <Box args={[0.85, 0.4, 0.78]} position={[0, 0.2, 0]} castShadow>
      <meshStandardMaterial color={wallColor} roughness={0.08} metalness={0.6} />
    </Box>
    <Box args={[0.5, 0.3, 0.5]} position={[0.15, 0.53, 0.1]} castShadow>
      <meshStandardMaterial color={hex(wallColor).multiplyScalar(0.7)} roughness={0.1} metalness={0.7} />
    </Box>
    <Box args={[0.82, 0.36, 0.04]} position={[0, 0.2, 0.41]}>
      <meshStandardMaterial color="#bfdbfe" roughness={0} metalness={1} transparent opacity={0.35} />
    </Box>
    <Box args={[1.0, 0.06, 0.3]} position={[0, 0.4, -0.45]} castShadow>
      <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.5} />
    </Box>
    <Box args={[0.6, 0.04, 0.02]} position={[0, 0.26, 0.44]}>
      <meshStandardMaterial color="#fff" emissive={trimColor} emissiveIntensity={2.4} />
    </Box>
    <DoorAndWindows trimColor={trimColor} windows={windows} doorStyle={doorStyle} />
  </group>
);

const CrystalTower = ({ wallColor }) => (
  <group>
    <Cylinder args={[0.28, 0.38, 1.1, 6]} position={[0, 0.55, 0]} castShadow>
      <meshStandardMaterial color={wallColor} roughness={0.05} metalness={0.5} transparent opacity={0.85} />
    </Cylinder>
    <Octahedron args={[0.38]} position={[0, 1.22, 0]} castShadow>
      <meshStandardMaterial color={wallColor} emissive={wallColor} emissiveIntensity={0.5} roughness={0} metalness={0.4} />
    </Octahedron>
    {[0.3, 0.65, 1.0].map((y, i) => (
      <Torus key={i} args={[0.3, 0.022, 6, 14]} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={1.6} />
      </Torus>
    ))}
  </group>
);

const Pagoda = ({ wallColor, roofColor }) => (
  <group>
    <Cylinder args={[0.44, 0.5, 0.28, 8]} position={[0, 0.14, 0]} castShadow>
      <meshStandardMaterial color={wallColor} roughness={0.4} metalness={0.2} />
    </Cylinder>
    {[0, 1, 2].map((i) => (
      <group key={i} position={[0, 0.28 + i * 0.3, 0]}>
        <Cylinder args={[0.37 - i * 0.1, 0.39 - i * 0.1, 0.18, 8]} castShadow>
          <meshStandardMaterial color={wallColor} roughness={0.4} metalness={0.2} />
        </Cylinder>
        <Cone args={[0.52 - i * 0.12, 0.12, 8]} position={[0, 0.15, 0]} rotation={[Math.PI, 0, 0]}>
          <meshStandardMaterial color={roofColor} roughness={0.5} />
        </Cone>
      </group>
    ))}
    <Cone args={[0.08, 0.34, 8]} position={[0, 1.3, 0]}>
      <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={1.2} />
    </Cone>
  </group>
);

const FloatingCube = ({ wallColor }) => (
  <group position={[0, 0.44, 0]}>
    <Box args={[0.65, 0.65, 0.65]} castShadow>
      <meshStandardMaterial color={wallColor} roughness={0.02} metalness={0.9} emissive={wallColor} emissiveIntensity={0.2} />
    </Box>
    {[0, 1, 2].map((i) => (
      <Torus key={i} args={[0.42, 0.02, 6, 14]} rotation={[i === 0 ? Math.PI / 2 : 0, i === 1 ? Math.PI / 2 : 0, i === 2 ? Math.PI / 2 : 0]}>
        <meshStandardMaterial color="#fff" emissive={wallColor} emissiveIntensity={1.8} />
      </Torus>
    ))}
  </group>
);

const CosmicPyramid = ({ wallColor, roofColor }) => (
  <group>
    <Cone args={[0.6, 1.1, 4]} position={[0, 0.55, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <meshStandardMaterial color={roofColor} roughness={0.05} metalness={0.6} emissive={wallColor} emissiveIntensity={0.2} />
    </Cone>
    <Torus args={[0.7, 0.03, 6, 22]} rotation={[0.3, 0, 0]}>
      <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={2.2} transparent opacity={0.8} />
    </Torus>
    <Torus args={[0.55, 0.025, 6, 22]} rotation={[1.1, 0, 0]}>
      <meshStandardMaterial color={wallColor} emissive={wallColor} emissiveIntensity={2.4} transparent opacity={0.6} />
    </Torus>
    <Sphere args={[0.1, 6, 6]} position={[0, 1.15, 0]}>
      <meshStandardMaterial color="#fff" emissive={wallColor} emissiveIntensity={2.5} />
    </Sphere>
  </group>
);

function HouseModel({ facadeId, wallColor, roofColor, trimColor, windows, doorStyle }) {
  switch (facadeId) {
    case 'modern':
      return <ModernVilla wallColor={wallColor} trimColor={trimColor} windows={windows} doorStyle={doorStyle} />;
    case 'tower':
      return <CrystalTower wallColor={wallColor} />;
    case 'pagoda':
      return <Pagoda wallColor={wallColor} roofColor={roofColor} />;
    case 'floating':
      return <FloatingCube wallColor={wallColor} />;
    case 'cosmic':
      return <CosmicPyramid wallColor={wallColor} roofColor={roofColor} />;
    case 'cottage':
    default:
      return <ClassicCottage wallColor={wallColor} roofColor={roofColor} trimColor={trimColor} windows={windows} doorStyle={doorStyle} />;
  }
}

export default function HomeExterior({ design }) {
  const { facadeId, wallColor, roofColor, trimColor, doorStyle, windows } = design;
  const glow = useMemo(() => hex(wallColor).multiplyScalar(0.6).getStyle(), [wallColor]);

  return (
    <group position={[0, 0, -4]}>
      <Box args={[1.1, 0.18, 1.1]} position={[0, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#6b3a0a" emissive={glow} emissiveIntensity={0.35} roughness={0.28} metalness={0.4} />
      </Box>
      {[
        [-0.48, 0, -0.48],
        [0.48, 0, -0.48],
        [-0.48, 0, 0.48],
        [0.48, 0, 0.48],
      ].map(([x, y, z], i) => (
        <Box key={i} args={[0.07, 0.22, 0.07]} position={[x, y, z]}>
          <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={0.85} roughness={0.2} metalness={0.6} />
        </Box>
      ))}
      <group position={[0, 0.08, 0]}>
        <HouseModel
          facadeId={facadeId}
          wallColor={wallColor}
          roofColor={roofColor}
          trimColor={trimColor}
          windows={windows}
          doorStyle={doorStyle}
        />
      </group>
    </group>
  );
}
