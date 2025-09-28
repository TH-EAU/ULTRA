import * as THREE from "three";

export const TemporalBlendShader = {
    uniforms: {
        tCurrent: { value: null },
        tPrevious: { value: null },
        blendFactor: { value: 0.85 }, // 0 = aucun blur, 1 = max blur
    },

    vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,

    fragmentShader: /* glsl */ `
    uniform sampler2D tCurrent;
    uniform sampler2D tPrevious;
    uniform float blendFactor;
    varying vec2 vUv;

    void main() {
      vec4 current = texture2D(tCurrent, vUv);
      vec4 previous = texture2D(tPrevious, vUv);
      gl_FragColor = mix(current, previous, blendFactor);
    }
  `,
};
