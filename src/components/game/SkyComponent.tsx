import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

interface SkyComponentProps {
    turbidity?: number;
    rayleigh?: number;
    mieCoefficient?: number;
    mieDirectionalG?: number;
    sunElevation?: number;
    sunAzimuth?: number;
    scale?: number;
    syncDirectionalLight?: boolean;
    syncFog?: boolean;
    syncAmbientLight?: boolean;
    fogNear?: number;
    fogFar?: number;
    nightLighting?: boolean;
}

export function SkyComponent({
    turbidity = 10,
    rayleigh = 2,
    mieCoefficient = 0.005,
    mieDirectionalG = 0.8,
    sunElevation = 10,
    sunAzimuth = 180,
    scale = 450000,
    syncDirectionalLight = true,
    syncFog = true,
    syncAmbientLight = true,
    fogNear = 20,
    fogFar = 80,
    nightLighting = true
}: SkyComponentProps) {
    const { scene } = useThree();
    const skyRef = useRef<Sky>(null);

    useEffect(() => {
        const sky = new Sky();
        sky.scale.setScalar(scale);

        const uniforms = sky.material.uniforms;
        uniforms['turbidity'].value = turbidity;
        uniforms['rayleigh'].value = rayleigh;
        uniforms['mieCoefficient'].value = mieCoefficient;
        uniforms['mieDirectionalG'].value = mieDirectionalG;

        const phi = THREE.MathUtils.degToRad(90 - sunElevation);
        const theta = THREE.MathUtils.degToRad(sunAzimuth);
        const sunPosition = new THREE.Vector3().setFromSphericalCoords(1, phi, theta);
        uniforms['sunPosition'].value = sunPosition;

        // Variables pour les couleurs et intensités selon l'heure
        let fogColor: THREE.Color;
        let ambientColor: THREE.Color;
        let ambientIntensity: number;
        let isNight = sunElevation < 0;

        if (sunElevation > 20) {
            // Jour - couleurs chaudes
            fogColor = new THREE.Color(0.5, 0.7, 0.9);
            ambientColor = new THREE.Color(0.6, 0.7, 0.9);
            ambientIntensity = 0.3;
        } else if (sunElevation > 0 && sunElevation < 180) {
            // Coucher/lever de soleil - transition
            const t = sunElevation / 20;
            const dayFog = new THREE.Color(0.5, 0.7, 0.9);
            const sunsetFog = new THREE.Color(0.9, 0.6, 0.4);
            const dayAmbient = new THREE.Color(0.6, 0.7, 0.9);
            const sunsetAmbient = new THREE.Color(0.9, 0.5, 0.3);

            fogColor = dayFog.lerp(sunsetFog, 1 - t);
            ambientColor = dayAmbient.lerp(sunsetAmbient, 1 - t);
            ambientIntensity = 0.15 + (t * 0.15);
        } else {
            // Nuit - couleurs bleues froides
            fogColor = new THREE.Color(0.1, 0.1, 0.3);
            ambientColor = new THREE.Color(0.1, 0.2, 0.4);
            ambientIntensity = 0.05;
        }

        // Synchronisation de la directional light
        if (syncDirectionalLight) {
            const directionalLight = scene.children.find(child => child.type === 'DirectionalLight') as THREE.DirectionalLight;
            if (directionalLight) {
                if (isNight && nightLighting) {
                    // Mode nuit : lumière bleutée faible depuis la lune (opposé du soleil)
                    const moonPosition = sunPosition.clone().multiplyScalar(-1);
                    const lightDistance = 50;
                    const lightPosition = moonPosition.clone().multiplyScalar(lightDistance);
                    directionalLight.position.copy(lightPosition);
                    directionalLight.intensity = 0.1;
                    directionalLight.color.setHex(0x6699ff);
                } else {
                    // Mode jour : lumière normale du soleil
                    const lightDistance = 50;
                    const lightPosition = sunPosition.clone().multiplyScalar(lightDistance);
                    directionalLight.position.copy(lightPosition);
                    directionalLight.intensity = Math.max(0.1, sunElevation / 90);
                    directionalLight.color.setHex(0xffffff);
                }

                directionalLight.target.position.set(0, 0, 0);

                // Mise à jour de la caméra d'ombres
                if (directionalLight.shadow && directionalLight.shadow.camera) {
                    const shadowCamera = directionalLight.shadow.camera as THREE.OrthographicCamera;

                    shadowCamera.position.copy(directionalLight.position);
                    shadowCamera.lookAt(0, 0, 0);

                    const shadowSize = Math.max(20, 40 / Math.sin(Math.max(0.1, phi)));
                    shadowCamera.left = -shadowSize;
                    shadowCamera.right = shadowSize;
                    shadowCamera.top = shadowSize;
                    shadowCamera.bottom = -shadowSize;
                    shadowCamera.near = 1;
                    shadowCamera.far = 100;

                    shadowCamera.updateProjectionMatrix();
                    directionalLight.shadow.needsUpdate = true;
                }

                directionalLight.updateMatrixWorld();
            }
        }

        // Synchronisation du fog avec la couleur du ciel
        // if (syncFog) {
        //     if (scene.fog) {
        //         (scene.fog as THREE.Fog).color = fogColor;
        //     } else {
        //         scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
        //     }
        // }

        // Synchronisation de l'ambient light
        if (syncAmbientLight) {
            const ambientLight = scene.children.find(child => child.type === 'AmbientLight') as THREE.AmbientLight;
            if (ambientLight) {
                ambientLight.color = ambientColor;
                ambientLight.intensity = ambientIntensity;
            }
        }

        scene.add(sky);
        skyRef.current = sky;

        return () => {
            scene.remove(sky);
        };
    }, [scene, turbidity, rayleigh, mieCoefficient, mieDirectionalG, sunElevation, sunAzimuth, scale, syncDirectionalLight, syncFog, syncAmbientLight, fogNear, fogFar, nightLighting]);

    return null;
}