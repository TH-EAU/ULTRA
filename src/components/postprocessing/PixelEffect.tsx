import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, RenderPixelatedPass, OutlineEffect } from "three-stdlib";


interface PixelArtComposerProps {
    pixelSize?: number;
    outlineThickness?: number;
}

const PixelEffect: React.FC<PixelArtComposerProps> = ({ pixelSize = 6, outlineThickness = 0.01 }) => {
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

export default PixelEffect;