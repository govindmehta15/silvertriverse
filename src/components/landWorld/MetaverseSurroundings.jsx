import { memo, useMemo } from 'react';

function Tower({ position, scale, color, glow }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[1.06, 0.04, 1.06]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={1.8} />
      </mesh>
      <mesh position={[0, -0.52, 0]}>
        <boxGeometry args={[1.06, 0.04, 1.06]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}

function Mountain({ position, scale }) {
  return (
    <mesh position={[position[0], scale[1] / 2, position[2]]} scale={scale} castShadow receiveShadow>
      <coneGeometry args={[1, 1, 4]} />
      <meshStandardMaterial color="#2c2a3a" roughness={0.92} metalness={0.05} />
    </mesh>
  );
}

export default memo(function MetaverseSurroundings({ radius = 140 }) {
  const towers = useMemo(() => {
    const neon = ['#22d3ee', '#38bdf8', '#818cf8', '#a78bfa', '#2dd4bf'];
    const body = ['#0b1020', '#0f172a', '#111827', '#172033'];
    const items = [];
    for (let i = 0; i < 72; i++) {
      const angle = (i / 72) * Math.PI * 2;
      const ring = i % 3;
      const dist = radius + ring * 18 + (i % 2 ? 6 : -6);
      const h = 9 + ((i * 11) % 14);
      const w = 5 + ((i * 5) % 5);
      items.push({
        pos: [Math.cos(angle) * dist, h / 2, Math.sin(angle) * dist],
        scale: [w / 5, h, w / 5],
        color: body[i % body.length],
        glow: neon[i % neon.length],
      });
    }
    return items;
  }, [radius]);

  const mountains = useMemo(() => {
    const items = [];
    const ringCount = 28;
    for (let i = 0; i < ringCount; i++) {
      const angle = (i / ringCount) * Math.PI * 2;
      const dist = radius + 85 + (i % 3) * 18;
      const width = 42 + (i % 5) * 12;
      const height = 32 + (i % 4) * 14;
      items.push({
        pos: [Math.cos(angle) * dist, 0, Math.sin(angle) * dist],
        scale: [width, height, width],
      });
    }
    return items;
  }, [radius]);

  return (
    <group>
      {/* Far mountain background behind skyline */}
      {mountains.map((m, i) => (
        <Mountain key={`m-${i}`} position={m.pos} scale={m.scale} />
      ))}

      {towers.map((t, i) => (
        <Tower
          key={i}
          position={t.pos}
          scale={t.scale}
          color={t.color}
          glow={t.glow}
        />
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.24, 0]} receiveShadow>
        <ringGeometry args={[radius - 18, radius + 42, 128]} />
        <meshStandardMaterial color="#111827" emissive="#312e81" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
});
