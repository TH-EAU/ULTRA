import * as THREE from "three";
import { Environment, MeshTransmissionMaterial } from "@react-three/drei";

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

            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[50, 50]} />
                <meshLambertMaterial color="#1a1a1aff" />
            </mesh>

            {/* <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1, 0]} castShadow receiveShadow>
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

            <mesh position={[0, 1, 0]} castShadow receiveShadow>
                <boxGeometry args={[2, 2, 2]} />
                <meshLambertMaterial color="#8b7355" />
            </mesh>

            <mesh position={[1, 1.5, 2.5]} castShadow receiveShadow>
                <boxGeometry args={[2, 5.5, 2]} />
                <meshLambertMaterial color="#8b7355" />
            </mesh>


            <mesh position={[5, 1, 5]} castShadow receiveShadow>
                <sphereGeometry args={[1, 16, 16]} />
                <meshLambertMaterial color="#c4a484" />
            </mesh>
        </>
    );
}

export default TestScene