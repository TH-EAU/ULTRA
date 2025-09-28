import * as THREE from "three";

export const PixelSnapShader = {
    uniforms: {
        tDiffuse: { value: null },
        resolution: { value: new THREE.Vector2(1, 1) },
        pixelSize: { value: 6 },
    },

    vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,

    fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float pixelSize;
    varying vec2 vUv;

    void main() {
      vec2 d = pixelSize / resolution;
      vec2 snappedUV = floor(vUv / d) * d + d * 0.5;
      gl_FragColor = texture2D(tDiffuse, snappedUV);
    }
  `,
};
