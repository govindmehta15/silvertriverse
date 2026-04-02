import { memo, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Cone, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const Cloud = memo(({ position }) => (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group position={position}>
            <Sphere args={[1, 10, 10]} position={[0, 0, 0]}>
                <meshStandardMaterial color="white" roughness={1} />
            </Sphere>
            <Sphere args={[0.7, 10, 10]} position={[0.8, -0.2, 0]}>
                <meshStandardMaterial color="white" roughness={1} />
            </Sphere>
            <Sphere args={[0.7, 10, 10]} position={[-0.8, -0.2, 0]}>
                <meshStandardMaterial color="white" roughness={1} />
            </Sphere>
        </group>
    </Float>
));

const Mountain = memo(({ position, scale, color }) => (
    <mesh position={[position[0], scale[1] / 2, position[2]]} scale={scale} castShadow receiveShadow>
        <coneGeometry args={[1, 1, 4]} />
        <meshStandardMaterial color={color || "#4b3d33"} roughness={0.9} />
    </mesh>
));

export default memo(function TownshipSurroundings() {
    const MOUNTAIN_COLORS = ['#3b2a1a', '#4b3d33', '#2a1f18', '#5c4d44', '#1a1a1a'];
    const clouds = useMemo(() => {
        const items = [];
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const dist = 70 + Math.random() * 50;
            items.push([
                Math.cos(angle) * dist,
                20 + Math.random() * 10,
                Math.sin(angle) * dist
            ]);
        }
        return items;
    }, []);

    const mountains = useMemo(() => {
        const items = [];
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const dist = 140 + (i % 2) * 20;
            items.push({
                pos: [Math.cos(angle) * dist, 0, Math.sin(angle) * dist],
                scale: [60 + Math.random() * 80, 50 + Math.random() * 40, 60 + Math.random() * 60],
                color: MOUNTAIN_COLORS[i % MOUNTAIN_COLORS.length]
            });
        }
        return items;
    }, []);

    return (
        <group>
            {/* Far Mountains */}
            {mountains.map((m, i) => (
                <Mountain key={i} position={m.pos} scale={m.scale} color={m.color} />
            ))}

            {/* Floating Clouds */}
            {clouds.map((pos, i) => (
                <Cloud key={i} position={pos} />
            ))}

            {/* Lake / Water Area (distant) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -90]} receiveShadow>
                <circleGeometry args={[50, 64]} />
                <meshStandardMaterial
                    color="#1d4ed8"
                    roughness={0.1}
                    metalness={0.8}
                    transparent
                    opacity={0.7}
                />
            </mesh>
        </group>
    );
});
