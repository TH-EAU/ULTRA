import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';
import { Vector3 } from 'three';

// Props pour le composant Grass
interface GrassProps {
    count: number; // Nombre de brins d'herbe
    area: number; // Taille du champ (carré)
}

// Composant pour un brin d'herbe
function GrassBlade({ position }: { position: THREE.Vector3 }) {
    const ref = useRef<THREE.InstancedMesh>(null);
    useFrame((state) => {
        if (ref.current) {
            // Animation simple de balancement (effet vent)
            const time = state.clock.getElapsedTime();
            ref.current.position.y = Math.sin(time + ref.current.position.x + position.x) * 0.1;
        }
    });

    return <Instance ref={ref} />;
}

// Composant principal pour le champ d'herbe
function Grass({ count, area }: GrassProps) {
    // Générer des positions aléatoires pour les brins d'herbe
    const positions = useMemo(() => {
        const pos: Vector3[] = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * area;
            const z = (Math.random() - 0.5) * area;
            pos.push(new Vector3(x, 0, z));
        }
        return pos;
    }, [count, area]);

    // Matériau pixelisé (MeshBasicMaterial pour simplicité)
    const material = useMemo(
        () =>
            new THREE.MeshBasicMaterial({
                color: new THREE.Color('#00ff00'), // Vert pour l'herbe
                side: THREE.DoubleSide,
            }),
        []
    );

    // Géométrie d'un brin d'herbe (plan simple)
    const geometry = useMemo(
        () => new THREE.PlaneGeometry(0.1, 0.5, 1, 1), // Low-res pour pixel art
        []
    );

    return (
        <Instances limit={count} geometry={geometry} material={material}>
            {positions.map((position, i) => (
                <GrassBlade key={i} position={position} />
            ))}
        </Instances>
    );
}

export default Grass