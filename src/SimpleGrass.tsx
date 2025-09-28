import React, { useRef, useMemo, useEffect } from "react"
import * as THREE from "three"

interface StylizedGrassProps {
    count?: number
    spread?: number
    alphaMask?: string
}

const StylizedGrass: React.FC<StylizedGrassProps> = ({
    count = 200,
    spread = 6,
    alphaMask
}) => {
    const meshRef = useRef<THREE.InstancedMesh>(null)

    const geometry = useMemo(() => new THREE.PlaneGeometry(.2, 2, 1, 1), [])

    const material = useMemo(() => {
        // Gradient lissé : 8 niveaux de gris pour le toon shading
        const levels = [225, 250]
        const data = new Uint8Array(levels)
        const gradientTexture = new THREE.DataTexture(data, levels.length, 1, THREE.RedFormat)
        gradientTexture.needsUpdate = true
        gradientTexture.minFilter = THREE.LinearFilter
        gradientTexture.magFilter = THREE.LinearFilter

        const matOptions: THREE.MeshToonMaterialParameters = {
            color: "#79d378",
            gradientMap: gradientTexture,
            side: THREE.DoubleSide
        }

        const mat = new THREE.MeshToonMaterial(matOptions)

        if (alphaMask) {
            const loader = new THREE.TextureLoader()
            loader.load(alphaMask, (texture) => {
                texture.minFilter = THREE.LinearFilter
                texture.magFilter = THREE.LinearFilter
                texture.generateMipmaps = false
                mat.alphaMap = texture
                mat.transparent = true
                mat.alphaTest = 0.05
                mat.needsUpdate = true
            })
        }

        return mat
    }, [alphaMask])

    // Placement des instances avec taille aléatoire
    useEffect(() => {
        if (!meshRef.current) return
        const mesh = meshRef.current
        const matrix = new THREE.Matrix4()
        const pos = new THREE.Vector3()
        const rot = new THREE.Euler()
        const scale = new THREE.Vector3()

        for (let i = 0; i < count; i++) {
            pos.set(
                (Math.random() - 0.5) * spread,
                0,
                (Math.random() - 0.5) * spread
            )
            rot.set(0, Math.random() * Math.PI * 2, 0)

            scale.set(
                0.5 + Math.random() * 0.5,
                0.5 + Math.random() * 1.0,
                1
            )

            matrix.compose(pos, new THREE.Quaternion().setFromEuler(rot), scale)
            mesh.setMatrixAt(i, matrix)
        }
        mesh.instanceMatrix.needsUpdate = true
    }, [count, spread])

    return (
        <instancedMesh
            ref={meshRef}
            args={[geometry, material, count]}
            position={[0, 1, 0]}
            // castShadow
            receiveShadow
        />
    )
}

export default StylizedGrass
