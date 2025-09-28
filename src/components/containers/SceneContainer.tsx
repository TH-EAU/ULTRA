import { Canvas } from "@react-three/fiber";
import type { ReactNode } from "react";
import PixelEffect from "../postprocessing/PixelEffect";
import { OrbitControls } from "@react-three/drei";
import { SkyComponent } from "../game/SkyComponent";

interface SceneContainerProps {
    children: ReactNode;
}

export default function SceneContainer({ children }: SceneContainerProps) {
    return (
        <Canvas
            gl={{ antialias: false, powerPreference: "high-performance" }}
            shadows
            style={{ width: "100vw", height: "100vh", backgroundColor: "black", imageRendering: "pixelated" }}
            orthographic
            camera={{ position: [20, 20, 20], zoom: 30, near: 0.1, far: 100 }}
        >
            <OrbitControls />
            <SkyComponent sunElevation={2} />
            {children}
            <PixelEffect pixelSize={2} />
        </Canvas>
    );
}