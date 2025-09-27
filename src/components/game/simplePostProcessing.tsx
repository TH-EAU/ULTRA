import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

interface PostProcessingProps {
    scene: THREE.Scene;
    camera: THREE.Camera;
}

export function SimplePostProcessing({ scene, camera }: PostProcessingProps) {
    const { gl, size } = useThree();
    const composer = useRef<EffectComposer | null>(null);

    useEffect(() => {
        const renderPass = new RenderPass(scene, camera);
        const outputPass = new OutputPass();

        composer.current = new EffectComposer(gl);
        composer.current.addPass(renderPass);
        composer.current.addPass(outputPass);

        return () => {
            if (composer.current) {
                composer.current.dispose();
            }
        };
    }, [gl, scene, camera]);

    useEffect(() => {
        if (composer.current) {
            composer.current.setSize(size.width, size.height);
        }
    }, [size]);

    useFrame(() => {
        if (composer.current) {
            composer.current.render();
        }
    });

    return null;
}