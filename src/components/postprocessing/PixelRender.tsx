import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

interface PixelRenderProps {
    pixelWidth?: number;
    pixelHeight?: number;
}

const PixelRender: React.FC<PixelRenderProps> = ({
    pixelWidth = 320,
    pixelHeight = 180,
}) => {
    const { gl, scene, camera: mainCamera, size } = useThree();
    const renderTargetRef = useRef<THREE.WebGLRenderTarget>(null);
    const screenSceneRef = useRef<THREE.Scene>(null);
    const screenCameraRef = useRef<THREE.OrthographicCamera>(null);

    useEffect(() => {
        if (!gl) return;

        // 1️⃣ RenderTarget basse résolution
        const rt = new THREE.WebGLRenderTarget(pixelWidth, pixelHeight, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            depthBuffer: true,
        });
        renderTargetRef.current = rt;

        // 2️⃣ Quad full-screen
        const screenScene = new THREE.Scene();
        screenSceneRef.current = screenScene;

        const screenCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        screenCameraRef.current = screenCamera;

        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.MeshBasicMaterial({ map: rt.texture });
        const quad = new THREE.Mesh(geometry, material);
        screenScene.add(quad);

        return () => {
            rt.dispose();
            material.dispose();
            geometry.dispose();
        };
    }, [gl, pixelWidth, pixelHeight]);

    // 3️⃣ Render loop
    useFrame(() => {
        if (!renderTargetRef.current || !screenSceneRef.current || !screenCameraRef.current)
            return;

        // Rendu de la scène principale dans le renderTarget
        gl.setRenderTarget(renderTargetRef.current);
        gl.clear();
        gl.render(scene, mainCamera);

        // Rendu du quad full-screen vers l'écran
        gl.setRenderTarget(null);
        gl.render(screenSceneRef.current, screenCameraRef.current);
    }, 1);

    return null;
};

export default PixelRender;
