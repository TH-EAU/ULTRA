import { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, RenderPass, ShaderPass, SobelOperatorShader } from "three-stdlib";

interface PixelEffectRTProps {
    pixelWidth?: number; // largeur du buffer pixelisé
    pixelHeight?: number; // hauteur du buffer pixelisé
    pixelSize?: number; // taille en pixels du snap
}

const PixelEffectRT: React.FC<PixelEffectRTProps> = ({
    pixelWidth = 320,
    pixelHeight = 180,
    pixelSize = 6,
}) => {
    const { gl, scene, camera, size } = useThree();
    const renderTargetRef = useRef<THREE.WebGLRenderTarget>(null);
    const composerRef = useRef<EffectComposer>(null);
    const screenSceneRef = useRef(new THREE.Scene());
    const screenCameraRef = useRef(new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1));
    const quadRef = useRef<THREE.Mesh>(null);

    // Init render target + quad full-screen
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
        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.MeshBasicMaterial({ map: rt.texture });
        const quad = new THREE.Mesh(geometry, material);
        quadRef.current = quad;
        screenSceneRef.current.add(quad);

        return () => {
            rt.dispose();
            material.dispose();
            geometry.dispose();
        };
    }, [gl, pixelWidth, pixelHeight]);

    // 3️⃣ Composer interne pour le render target
    useEffect(() => {
        if (!gl || !renderTargetRef.current) return;

        const composer = new EffectComposer(gl, renderTargetRef.current);
        composer.setSize(pixelWidth, pixelHeight);

        // RenderPass normal
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        // Sobel edges
        const sobelPass = new ShaderPass(SobelOperatorShader);
        sobelPass.uniforms["resolution"].value = new THREE.Vector2(pixelWidth, pixelHeight);
        composer.addPass(sobelPass);

        composerRef.current = composer;

        return () => {
            composer.dispose();
        };
    }, [gl, scene, camera, pixelWidth, pixelHeight]);

    // 4️⃣ Render loop
    useFrame(() => {
        if (!composerRef.current || !renderTargetRef.current) return;

        // Rendu de la scène dans le render target
        composerRef.current.render();

        // Rendu du quad full-screen vers l’écran
        gl.setRenderTarget(null);
        if (quadRef.current) {
            gl.render(screenSceneRef.current, screenCameraRef.current);
        }
    }, 1);

    return null;
};

export default PixelEffectRT;
