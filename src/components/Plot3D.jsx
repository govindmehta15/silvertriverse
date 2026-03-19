import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text, MeshWobbleMaterial, Cone, Cylinder, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Helper to generate a consistent color from an ID
const getColorFromId = (id) => {
    if (!id) return '#1e293b';
    const colors = [
        '#f59e0b', '#3b82f6', '#10b981', '#ef4444',
        '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
        '#84cc16', '#6366f1'
    ];
    // Simple hash
    let hash = 0;
    const str = String(id);
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const HouseModel = ({ seed, color, isMine }) => {
    // Determine house type based on seed
    const type = seed % 3; // 0: Classic, 1: Modern, 2: Tower

    return (
        <group>
            {type === 0 && (
                <>
                    {/* Classic House */}
                    <Box args={[0.7, 0.6, 0.7]} position={[0, 0.3, 0]} castShadow>
                        <meshStandardMaterial color={color} roughness={0.2} metalness={0.4} />
                    </Box>
                    <Cone args={[0.6, 0.4, 4]} position={[0, 0.8, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                        <meshStandardMaterial color="#334155" roughness={0.5} />
                    </Cone>
                </>
            )}
            {type === 1 && (
                <>
                    {/* Modern Block */}
                    <Box args={[0.8, 0.4, 0.8]} position={[0, 0.2, 0]} castShadow>
                        <meshStandardMaterial color={color} roughness={0.1} metalness={0.6} />
                    </Box>
                    <Box args={[0.4, 0.6, 0.4]} position={[0.2, 0.4, 0.2]} castShadow>
                        <meshStandardMaterial color="#1e293b" roughness={0.1} metalness={0.8} />
                    </Box>
                </>
            )}
            {type === 2 && (
                <>
                    {/* Circular Tower */}
                    <Cylinder args={[0.35, 0.45, 1, 8]} position={[0, 0.5, 0]} castShadow>
                        <meshStandardMaterial color={color} roughness={0.3} metalness={0.3} />
                    </Cylinder>
                    <Sphere args={[0.4, 8, 8]} position={[0, 1.1, 0]} castShadow>
                        <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={0.5} />
                    </Sphere>
                </>
            )}

            {/* Window Glows */}
            <Box args={[0.1, 0.1, 0.05]} position={[0, 0.4, 0.36]}>
                <meshStandardMaterial color="#fff" emissive="#fcd34d" emissiveIntensity={2} />
            </Box>
        </group>
    );
};

export default function Plot3D({
    index,
    row,
    col,
    owner,
    isMine,
    isSelected,
    onClick
}) {
    const meshRef = useRef();
    const houseGroupRef = useRef();
    const [hovered, setHovered] = useState(false);

    const ownerColor = useMemo(() => getColorFromId(owner?.ownerId), [owner?.ownerId]);
    const houseSeed = useMemo(() => {
        if (!owner?.ownerId) return 0;
        return String(owner.ownerId).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    }, [owner?.ownerId]);

    useFrame((state) => {
        if (houseGroupRef.current) {
            houseGroupRef.current.position.y = 0.2 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.05;
            houseGroupRef.current.rotation.y += 0.005;
        }
    });

    const isOwned = !!owner;
    const initial = owner?.ownerName ? owner.ownerName.trim().charAt(0).toUpperCase() : '';

    const x = col - 11.5;
    const z = row - 11.5;

    return (
        <group position={[x * 1.3, 0, z * 1.3]}>
            {/* Ground Plate */}
            <Box
                ref={meshRef}
                args={[1.1, 0.2, 1.1]}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick(index);
                }}
                castShadow
                receiveShadow
            >
                <meshStandardMaterial
                    color={isOwned ? (isMine ? '#f59e0b' : '#334155') : (hovered ? '#475569' : '#1e293b')}
                    emissive={isSelected ? '#f59e0b' : '#000000'}
                    emissiveIntensity={isSelected ? 0.4 : 0}
                    roughness={0.4}
                    metalness={0.2}
                />
            </Box>

            {/* Interactive House */}
            {isOwned && (
                <group ref={houseGroupRef}>
                    <HouseModel seed={houseSeed} color={ownerColor} isMine={isMine} />

                    {/* Floating Label */}
                    <Text
                        position={[0, 1.6, 0]}
                        fontSize={0.4}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.05}
                        outlineColor="#000"
                    >
                        {initial}
                    </Text>

                    {/* Ground Glow for Owned Plots */}
                    <pointLight
                        color={isMine ? '#f59e0b' : ownerColor}
                        intensity={2}
                        distance={3}
                        position={[0, 0.5, 0]}
                    />
                </group>
            )}

            {/* Selection/Hover Highlight Ring */}
            {(hovered || isSelected) && (
                <Cylinder args={[0.7, 0.7, 0.05, 16]} position={[0, -0.05, 0]}>
                    <meshBasicMaterial color={isSelected ? '#f59e0b' : '#3b82f6'} transparent opacity={0.3} />
                </Cylinder>
            )}
        </group>
    );
}
