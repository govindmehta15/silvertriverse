// Yard props — lamp, path, shrubs (unlocked via cards)
export default function YardDecor({ design: d }) {
  const { yardProps } = d;
  if (!yardProps) return null;

  return (
    <group>
      {yardProps.lamp && (
        <group position={[-1.2, 0, 2]}>
          <mesh position={[0, 0.55, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 1.1, 8]} />
            <meshStandardMaterial color="#3f3f46" />
          </mesh>
          <mesh position={[0, 1.15, 0]}>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial color="#fef9c3" emissive="#fbbf24" emissiveIntensity={0.4} />
          </mesh>
        </group>
      )}
      {yardProps.path && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 3.5]}>
          <planeGeometry args={[1.2, 5]} />
          <meshStandardMaterial color="#a8a29e" roughness={0.85} />
        </mesh>
      )}
      {yardProps.shrub && (
        <>
          {[
            [2.2, 0, 1.5],
            [-2.4, 0, 0.8],
            [1.8, 0, -0.5],
          ].map((pos, i) => (
            <mesh key={i} position={pos} castShadow>
              <sphereGeometry args={[0.45, 8, 8]} />
              <meshStandardMaterial color="#166534" roughness={0.9} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}
