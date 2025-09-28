import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type PixelCubeProps = {
    pixelSize?: number;
    color?: string;
};

const PixelCube: React.FC<PixelCubeProps> = ({ pixelSize = 8.0, color = 'orange' }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    // ShaderMaterial créé une seule fois
    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                uPixelSize: { value: pixelSize },
                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                uColor: { value: new THREE.Color(color) },
            },
            vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        uniform vec2 uResolution;
        uniform float uPixelSize;
        uniform vec3 uColor;
        varying vec2 vUv;

        void main() {
          // Crée un effet "pixelisé"
          vec2 pixelUV = floor(vUv * uResolution / uPixelSize) * uPixelSize / uResolution;
          gl_FragColor = vec4(uColor * pixelUV.x, 1.0); // effet simple basé sur x
        }
      `,
        });
    }, [pixelSize, color]);

    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = clock.elapsedTime * 0.3;
            meshRef.current.rotation.y = clock.elapsedTime * 0.5;
        }
    });

    return (
        <mesh ref={meshRef} material={material} position={[-5, 0, -5]} >
            <boxGeometry args={[2, 2, 2]} />
        </mesh>
    );
};

export default PixelCube