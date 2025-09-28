import * as THREE from "three";

export const PixelSnapVertexMaterial = new THREE.ShaderMaterial({
    uniforms: {
        pixelSize: { value: 6 },
        resolution: { value: new THREE.Vector2(320, 180) },
    },
    vertexShader: /* glsl */ `
    uniform float pixelSize;
    uniform vec2 resolution;

    void main() {
      vec4 projected = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

      // Snap sur la grille pixelisée
      vec2 grid = resolution / pixelSize;
      projected.xy = floor(projected.xy * 0.5 * grid) / grid * 2.0;

      gl_Position = projected;
    }
  `,
    fragmentShader: /* glsl */ `
    varying vec3 vColor;
    void main() {
      gl_FragColor = vec4(1.0); // juste placeholder, le material réel sera remplacé
    }
  `,
    depthTest: true,
    depthWrite: true,
});
