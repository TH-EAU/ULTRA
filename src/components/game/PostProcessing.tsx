import React, { useRef, useMemo, useEffect } from 'react';
import { useThree, useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPixelatedPass } from '../../postProcessing/renderPixelatedPass';

extend({ EffectComposer, RenderPass, OutputPass });

interface PostProcessingProps {
    scene: THREE.Scene;
    camera: THREE.Camera;
}

export function PostProcessing({ scene, camera }: PostProcessingProps) {
    const { gl, size } = useThree();
    const composer = useRef<EffectComposer | null>(null);

    const [renderTarget, pixelPass] = useMemo(() => {
        const renderTarget = new THREE.WebGLRenderTarget(size.width, size.height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false
        });
        const pixelPass = new RenderPixelatedPass(
            new THREE.Vector2(size.width, size.height),
            scene,
            camera,
            {
                pixelSize: 8,
                normalEdgeStrength: 0.3,
            }
        );
        return [renderTarget, pixelPass];
    }, [scene, camera, size]);

    useEffect(() => {
        const renderPass = new RenderPass(scene, camera);
        const outputPass = new OutputPass();

        composer.current = new EffectComposer(gl, renderTarget);
        composer.current.addPass(renderPass);
        composer.current.addPass(pixelPass);
        composer.current.addPass(outputPass);

        return () => {
            if (composer.current) {
                composer.current.dispose();
            }
            renderTarget.dispose();
        };
    }, [gl, scene, camera, renderTarget, pixelPass]);

    useEffect(() => {
        if (!composer.current) return;
        composer.current.setSize(size.width, size.height);
        pixelPass.setSize(size.width, size.height);
    }, [size, pixelPass]);

    useFrame(() => {
        if (composer.current) {
            composer.current.render();
        }
    });

    return null;
}