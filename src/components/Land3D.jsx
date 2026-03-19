import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sky, Stars, ContactShadows, Grid, Float, Environment } from '@react-three/drei';
import Plot3D from './Plot3D';
import { COLS, ROWS, indexToRowCol } from '../data/plotsData';

const Tree = ({ position }) => {
    const scale = useMemo(() => 0.5 + Math.random() * 0.5, []);
    return (
        <group position={position} scale={[scale, scale, scale]}>
            <mesh position={[0, 0.5, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.15, 1]} />
                <meshStandardMaterial color="#4d2c19" />
            </mesh>
            <mesh position={[0, 1.2, 0]} castShadow>
                <coneGeometry args={[0.6, 1.2, 8]} />
                <meshStandardMaterial color="#14532d" roughness={0.8} />
            </mesh>
            <mesh position={[0, 1.7, 0]} castShadow>
                <coneGeometry args={[0.4, 0.8, 8]} />
                <meshStandardMaterial color="#166534" roughness={0.8} />
            </mesh>
        </group>
    );
};

const Decorations = () => {
    const trees = useMemo(() => {
        const items = [];
        for (let i = 0; i < 40; i++) {
            const side = Math.random() > 0.5 ? 1 : -1;
            const dist = 18 + Math.random() * 10;
            const angle = Math.random() * Math.PI * 2;
            items.push([Math.cos(angle) * dist, 0, Math.sin(angle) * dist]);
        }
        return items;
    }, []);

    return (
        <group>
            {trees.map((pos, i) => <Tree key={i} position={pos} />)}
        </group>
    );
};

export default function Land3D({
    ownershipMap,
    user,
    onPlotClick,
    selectedPlotIndex
}) {
    const plots = useMemo(() => {
        const items = [];
        for (let i = 0; i < COLS * ROWS; i++) {
            const { row, col } = indexToRowCol(i);
            const owner = ownershipMap[i];
            items.push(
                <Plot3D
                    key={i}
                    index={i}
                    row={row}
                    col={col}
                    owner={owner}
                    isMine={owner?.ownerId === user?.id}
                    isSelected={selectedPlotIndex === i}
                    onClick={onPlotClick}
                />
            );
        }
        return items;
    }, [ownershipMap, user, onPlotClick, selectedPlotIndex]);

    return (
        <div className="w-full h-full cursor-move bg-navy-950 rounded-xl overflow-hidden shadow-2xl border border-navy-700/50">
            <Canvas shadows dpr={[1, 2]}>
                <Suspense fallback={null}>
                    <PerspectiveCamera makeDefault position={[0, 40, 50]} fov={35} />

                    <Sky sunPosition={[100, 40, 100]} inclination={0} azimuth={0.25} turbidity={10} rayleigh={0.5} />
                    <Stars radius={150} depth={50} count={7000} factor={4} saturation={1} fade speed={1.5} />

                    <ambientLight intensity={1.5} />
                    <pointLight position={[50, 50, 50]} intensity={2.5} decay={1.5} castShadow />
                    <directionalLight
                        position={[-30, 40, 30]}
                        intensity={2.5}
                        castShadow
                        shadow-mapSize={[2048, 2048]}
                    />

                    {/* The Land World */}
                    <group position={[0, 0, 0]}>
                        <Grid
                            infiniteGrid
                            fadeDistance={120}
                            fadeStrength={5}
                            cellSize={1.3}
                            sectionSize={6.5}
                            sectionThickness={1.5}
                            sectionColor="#1e293b"
                            cellColor="#0f172a"
                            position={[0, -0.1, 0]}
                        />
                        {plots}
                        <Decorations />
                    </group>

                    <ContactShadows position={[0, -0.1, 0]} opacity={0.6} scale={60} blur={2} far={10} />

                    <OrbitControls
                        enableDamping
                        dampingFactor={0.05}
                        maxPolarAngle={Math.PI / 2.3}
                        minDistance={15}
                        maxDistance={100}
                        target={[0, 0, 0]}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}
