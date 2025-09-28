import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, RenderPass, RenderPixelatedPass, ShaderPass, SobelOperatorShader } from "three-stdlib";

interface PixelArtComposerProps { pixelSize?: number; }

const PixelEffect: React.FC<PixelArtComposerProps> = ({ pixelSize = 6 }) => {
    const composerRef = useRef<EffectComposer | null>(null);
    const { gl, scene, camera, size } = useThree();
    useEffect(() => {
        if (!gl) return;

        const composer = new EffectComposer(gl);
        composer.setSize(size.width, size.height);

        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        const sobelPass = new ShaderPass(SobelOperatorShader);
        sobelPass.uniforms["resolution"].value = new THREE.Vector2(size.width, size.height);
        composer.addPass(sobelPass);

        const pixelPass = new RenderPixelatedPass(
            new THREE.Vector2(size.width, size.height),
            pixelSize, scene, camera
        );
        composer.addPass(pixelPass);

        composerRef.current = composer;
        return () => {
            composer.dispose(); scene.fog = null;
        };

    }, [gl, scene, camera, size, pixelSize]);

    useEffect(() => {
        if (composerRef.current) {
            composerRef.current.setSize(size.width, size.height);
        }
    }, [size]);

    useFrame(() => {
        if (composerRef.current) { composerRef.current.render(); }
    }, 1); return null;

};

export default PixelEffect;