import { memo, useMemo } from 'react';
import * as THREE from 'three';

const RoadMaterial = new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.8,
});

const RoadLineMaterial = new THREE.MeshStandardMaterial({
    color: '#f59e0b',
});

const Road = memo(({ position, rotation, length }) => (
    <group position={position} rotation={rotation}>
        {/* Asphalt */}
        <mesh receiveShadow>
            <planeGeometry args={[1.2, length]} />
            <primitive object={RoadMaterial} attach="material" />
        </mesh>
        {/* Yellow dashed line */}
        <mesh position={[0, 0.01, 0]}>
            <planeGeometry args={[0.05, length]} />
            <primitive object={RoadLineMaterial} attach="material" />
        </mesh>
    </group>
));

export default memo(function Roads({ cols, rows, spacing, roadWidth }) {
    const totalSize = cols * spacing + (Math.floor((cols - 1) / 4) * roadWidth);
    
    const roadItems = useMemo(() => {
        const items = [];
        const halfSize = totalSize / 2;
        
        // Vertical roads
        for (let c = 4; c < cols; c += 4) {
            // Road is between plot (c-1) and plot (c)
            const x = (c * spacing) + (Math.floor(c / 4) * roadWidth) - halfSize - (roadWidth / 2);
            items.push(
                <Road key={`v-${c}`} position={[x, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} length={totalSize} />
            );
        }
        
        // Horizontal roads
        for (let r = 4; r < rows; r += 4) {
            const z = (r * spacing) + (Math.floor(r / 4) * roadWidth) - halfSize - (roadWidth / 2);
            items.push(
                <Road key={`h-${r}`} position={[0, -0.04, z]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} length={totalSize} />
            );
        }
        
        return items;
    }, [cols, rows, spacing, roadWidth, totalSize]);

    return <group>{roadItems}</group>;
});
