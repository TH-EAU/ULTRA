import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'

// Constantes réduites pour débugger
const GRASS_BLADES = 1000; // Moins pour débugger
const GRASS_BLADE_VERTICES = 10;

// Vertex shader optimisé avec hash pour rotation
const grassVertexShader = `
  uniform float uTime;
  uniform float uWindStrength;
  uniform vec3 uCameraPosition;
  
  // Attributs d'instance personnalisés
  attribute vec3 position_offset;
  attribute float scale_factor;
  attribute vec3 blade_color;
  
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vHeight;
  varying vec3 vColor;
  varying float vDistance;
  
  // Hash function pour générer rotation pseudo-aléatoire (comme dans la vidéo)
  float hash21(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  // Matrice de rotation Y
  mat3 rotationY(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
  }
  
  void main() {
    vUv = uv;
    vHeight = uv.y;
    vColor = blade_color;
    
    // Calcul de la rotation basé sur la position (comme dans la vidéo)
    float perBladeRotation = hash21(position_offset.xz) * 6.28318; // 2π
    float randomAngle = perBladeRotation * 2.0 * 3.14159;
    
    // Appliquer rotation procédurale et échelle
    vec3 rotatedPos = rotationY(randomAngle) * (position * scale_factor);
    
    // Position finale avec offset d'instance
    vec3 worldPos = rotatedPos + position_offset;
    
    // Animation du vent plus réaliste
    float windPhase = uTime * 1.5 + worldPos.x * 0.1 + worldPos.z * 0.1;
    float windNoise = sin(windPhase) * cos(windPhase * 0.7);
    float windEffect = uWindStrength * windNoise * vHeight * vHeight;
    
    worldPos.x += windEffect;
    worldPos.z += windEffect * 0.3;
    
    // Courbure naturelle
    worldPos.x += vHeight * vHeight * 0.02 * scale_factor;
    
    vPosition = worldPos;
    vDistance = length(uCameraPosition - worldPos);
    vNormal = normalize(normalMatrix * rotationY(randomAngle) * normal);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
  }
`;

// Fragment shader avec variations de couleur
const grassFragmentShader = `
  uniform vec3 uColorTop;
  uniform vec3 uColorBottom;
  uniform float uTime;
  uniform float uFadeDistance;
  
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vHeight;
  varying vec3 vColor;
  varying float vDistance;
  
  void main() {
    // LOD : discard si trop loin
    float fadeAlpha = 1.0 - smoothstep(uFadeDistance * 0.8, uFadeDistance, vDistance);
    if (fadeAlpha < 0.01) discard;
    
    // Couleur de base avec gradient + variation d'instance
    vec3 grassColor = mix(uColorBottom, uColorTop, vHeight);
    grassColor = mix(grassColor, vColor, 0.3);
    
    // Éclairage simple mais efficace
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
    float NdotL = max(dot(vNormal, lightDir), 0.0);
    float ambient = mix(0.4, 0.7, vHeight);
    float lighting = ambient + NdotL * 0.5;
    
    // Subsurface scattering fake
    float backlight = max(dot(vNormal, -lightDir), 0.0) * 0.3 * (1.0 - vHeight);
    lighting += backlight;
    
    grassColor *= lighting;
    
    gl_FragColor = vec4(grassColor, fadeAlpha);
  }
`;

// Fonction pour créer la géométrie de brin d'herbe (simplifiée et fonctionnelle)
function createBladeGeometry(): THREE.BufferGeometry {
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    // Créer un brin d'herbe simple mais efficace
    const width = 0.02;
    const height = 0.5;
    const segments = 4; // Plus simple pour débugger

    for (let i = 0; i <= segments; i++) {
        const v = i / segments;
        const y = v * height;

        // Effilement : plus mince vers le haut
        const currentWidth = width * (1.0 - v * 0.7);

        // Deux vertices par segment (gauche et droite)
        vertices.push(-currentWidth, y, 0); // Gauche
        vertices.push(currentWidth, y, 0);  // Droite

        // UVs
        uvs.push(0, v); // Gauche
        uvs.push(1, v); // Droite

        // Créer les triangles entre segments
        if (i < segments) {
            const base = i * 2;

            // Triangle 1
            indices.push(base, base + 2, base + 1);
            // Triangle 2
            indices.push(base + 1, base + 2, base + 3);
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
}

// Composant d'herbe ultra-optimisé
function UltraOptimizedGrass() {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    // Création de la géométrie instancée (comme dans la vidéo)
    const { geometry, instancedGeometry } = useMemo(() => {
        // Géométrie de base d'un brin
        const bladeGeometry = createBladeGeometry();

        // Création de la géométrie instancée
        const instancedGeo = new THREE.InstancedBufferGeometry();

        // Copie manuelle des attributs pour éviter l'erreur TypeScript
        instancedGeo.setIndex(bladeGeometry.index);
        instancedGeo.setAttribute('position', bladeGeometry.getAttribute('position'));
        instancedGeo.setAttribute('uv', bladeGeometry.getAttribute('uv'));
        instancedGeo.setAttribute('normal', bladeGeometry.getAttribute('normal'));

        instancedGeo.instanceCount = GRASS_BLADES;

        // Génération des données d'offset comme dans la vidéo
        const offsets: number[] = [];
        const scales: number[] = [];
        const colors: number[] = [];

        const GRASS_PATCH_SIZE = 4; // Plus petit pour voir l'herbe

        for (let i = 0; i < GRASS_BLADES; i++) {
            // Position aléatoire dans la zone
            const x = (Math.random() - 0.5) * GRASS_PATCH_SIZE;
            const z = (Math.random() - 0.5) * GRASS_PATCH_SIZE;
            offsets.push(x, 0, z);

            // Échelle avec variation
            scales.push(0.8 + Math.random() * 0.4);

            // Variation de couleur
            const colorVar = 0.8 + Math.random() * 0.4;
            colors.push(
                0.3 * colorVar,
                0.7 * colorVar,
                0.1 * colorVar
            );
        }

        // Créer les attributs d'instance (rotation calculée dans le shader)
        const offsetsData = new Float32Array(offsets);
        const scalesData = new Float32Array(scales);
        const colorsData = new Float32Array(colors);

        console.log('Grass data:', {
            blades: GRASS_BLADES,
            offsetsLength: offsetsData.length,
            scalesLength: scalesData.length
        });

        instancedGeo.setAttribute('position_offset', new THREE.InstancedBufferAttribute(offsetsData, 3));
        instancedGeo.setAttribute('scale_factor', new THREE.InstancedBufferAttribute(scalesData, 1));
        instancedGeo.setAttribute('blade_color', new THREE.InstancedBufferAttribute(colorsData, 3));

        return { geometry: bladeGeometry, instancedGeometry: instancedGeo };
    }, []);

    // Animation
    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
            materialRef.current.uniforms.uCameraPosition.value.copy(state.camera.position);
        }
    });

    return (
        <mesh ref={meshRef} geometry={instancedGeometry} frustumCulled={false}>
            <shaderMaterial
                ref={materialRef}
                vertexShader={grassVertexShader}
                fragmentShader={grassFragmentShader}
                uniforms={{
                    uTime: { value: 0 },
                    uWindStrength: { value: 0.2 },
                    uCameraPosition: { value: new THREE.Vector3() },
                    uFadeDistance: { value: 25 },
                    uColorTop: { value: new THREE.Color('#8bc34a') },
                    uColorBottom: { value: new THREE.Color('#2e7d32') },
                }}
                side={THREE.DoubleSide}
                transparent={true}
                alphaTest={0.1}
            />
        </mesh>
    );
}

export default UltraOptimizedGrass