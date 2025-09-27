import React, { useEffect, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, RenderPixelatedPass, OutlineEffect } from "three-stdlib";

function SceneContent() {
    return (
        <>
            <ambientLight intensity={0.7} />
            <directionalLight
                position={[10, 15, 10]}
                intensity={3}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-near={0.5}
                shadow-camera-far={50}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
            />

            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[50, 50]} />
                <meshLambertMaterial color="#1a1a1aff" />
            </mesh>

            <mesh position={[0, 1, 0]} castShadow receiveShadow>
                <boxGeometry args={[2, 2, 2]} />
                <meshLambertMaterial color="#8b7355" />
            </mesh>

            <mesh position={[1, 1.5, 2.5]} castShadow receiveShadow>
                <boxGeometry args={[2, 5.5, 2]} />
                <meshLambertMaterial color="#8b7355" />
            </mesh>

            <mesh position={[5, 1, 5]} castShadow receiveShadow>
                <sphereGeometry args={[1, 16, 16]} />
                <meshLambertMaterial color="#c4a484" />
            </mesh>
        </>
    );
}

interface PixelArtComposerProps {
    pixelSize?: number;
    outlineThickness?: number;
}

const PixelArtComposer: React.FC<PixelArtComposerProps> = ({ pixelSize = 6, outlineThickness = 0.01 }) => {
    const composerRef = useRef<EffectComposer>(null);
    const outlineRef = useRef<OutlineEffect>(null);
    const { gl, scene, camera, size } = useThree();

    useEffect(() => {
        // OutlineEffect : contour de tous les meshes
        outlineRef.current = new OutlineEffect(gl, {
            defaultAlpha: 1,
            defaultThickness: 1,
            defaultKeepAlive: true,
            defaultColor: [0, 0, 0]
        });

        // Pixelation via RenderPixelatedPass
        composerRef.current = new EffectComposer(gl);
        composerRef.current.addPass(new RenderPixelatedPass(
            new THREE.Vector2(size.width, size.height),
            pixelSize,
            scene,
            camera
        ));
    }, [gl, scene, camera, pixelSize, size]);

    useFrame(() => {
        if (outlineRef.current && composerRef.current) {
            // On applique d’abord les contours puis la pixelation
            outlineRef.current.render(scene, camera);
            composerRef.current.render();
        }
    }, 1);

    return null;
};

export const PixelArtScene: React.FC = () => {
    return (
        <Canvas
            shadows
            dpr={0.6}
            camera={{ position: [10, 10, 10], fov: 75 }}
            gl={{ antialias: false }}
            style={{ width: "100vw", height: "100vh", imageRendering: "pixelated" }}
        >
            <OrbitControls />
            <SceneContent />
            <PixelArtComposer pixelSize={2} />
        </Canvas>
    );
};
