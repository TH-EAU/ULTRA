import { Environment, MeshTransmissionMaterial } from "@react-three/drei";
import { ElficPortal, LittleHouse, LittleTower, Pillar } from "../components/game/structures/Structures";

import * as THREE from "three"
import PixelCube from "../components/PixelCube";
import Grass from "../components/game/Grass";
import UltraOptimizedGrass from "../grass";
import SimpleGrass from "../SimpleGrass";

function GradientSphere() {
    const data = new Uint8Array([50, 150, 250]) // 0.2, 0.6, 1.0
    const gradientTexture = new THREE.DataTexture(data, 3, 1, THREE.RedFormat)
    gradientTexture.needsUpdate = true
    gradientTexture.minFilter = THREE.NearestFilter
    gradientTexture.magFilter = THREE.NearestFilter

    return (
        <mesh position={[0, 2, 0]} receiveShadow>
            <sphereGeometry args={[1, 64, 64]} />
            <meshToonMaterial
                color="#ff9900"       // teinte orange
                gradientMap={gradientTexture}
            />
        </mesh>
    )
}

function TestScene() {
    return (
        <>
            <Environment preset="forest" />
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
            {/* <hemisphereLight intensity={.2} /> */}

            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[50, 50]} />
                <meshLambertMaterial color="#94cf60" />
            </mesh>

            {/* <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 3, 0]} receiveShadow>
                <planeGeometry args={[50, 50]} />
                <MeshTransmissionMaterial
                    resolution={1024}
                    samples={4}
                    background={new THREE.Color(0xaaeecc)}
                    color="#a7f6ff"
                    attenuationColor="#00836f"
                    temporalDistortion={.2}
                    distortion={.2}
                    distortionScale={.22}
                    ior={.9}
                    thickness={2.5}

                />
            </mesh> */}

            {/* <ElficPortal position={[0, 0, 7]} />

            <LittleHouse position={[7, 0, 7]} /> */}

            {/* <mesh position={[0, 1, 0]} castShadow receiveShadow>
                <boxGeometry args={[2, 2, 2]} />
                <meshLambertMaterial color="#8b7355" />
            </mesh> */}

            {/* <mesh position={[1, 1.5, 2.5]} castShadow receiveShadow>
                <boxGeometry args={[2, 5.5, 2]} />
                <meshLambertMaterial color="#8b7355" />
            </mesh>


            <mesh position={[5, 1, 5]} castShadow receiveShadow>
                <sphereGeometry args={[1, 16, 16]} />
                <meshLambertMaterial color="#c4a484" />
            </mesh> */}
            <pointLight position={[3, 2, 3]} color="blue" intensity={100} castShadow />
            <Pillar position={[-4.5, 0, 3]} />

            {/* <PixelCube /> */}

            <SimpleGrass count={10000} spread={30}
            // alphaMask="/assets/textures/grass_mask.jpg"
            />
            <GradientSphere />
            {/* Sol pour le contexte */}

        </>
    );
}

export default TestScene