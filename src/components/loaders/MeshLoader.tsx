import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

interface MeshLoaderProps {
    path: string;
    position: [number, number, number];
    material?: THREE.Material; // Permet de passer n'importe quel matériau
}

const MeshLoader = ({ path, position, material }: MeshLoaderProps) => {
    const gltf = useGLTF(path);

    useEffect(() => {
        gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;

                // Si un material est passé en props, on l'applique
                if (material) {
                    mesh.material = material;
                }
            }
        });
    }, [gltf.scene, material]);

    return <primitive object={gltf.scene} position={position} />;
};

export default MeshLoader;
