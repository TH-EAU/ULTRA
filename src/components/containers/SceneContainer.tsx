import { Canvas } from "@react-three/fiber"
import PixelEffect from "../postprocessing/PixelEffect"
import { OrbitControls } from "@react-three/drei"

const SceneContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <Canvas
            shadows
            dpr={0.6}
            camera={{ position: [10, 10, 10], fov: 75 }}
            gl={{ antialias: false }}
            style={{ width: "100vw", height: "100vh", imageRendering: "pixelated" }}
        >
            <OrbitControls />
            <PixelEffect pixelSize={1} />
            {children}
        </Canvas>
    )
}

export default SceneContainer