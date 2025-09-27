import * as THREE from 'three';

import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';

interface PixelatedPassOptions {
  pixelSize?: number;
  normalEdgeStrength?: number;
  depthEdgeStrength?: number;
}

const pixelVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const pixelFragmentShader = `
  uniform sampler2D tDiffuse;
  uniform vec2 resolution;
  uniform float pixelSize;
  uniform float normalEdgeStrength;
  varying vec2 vUv;

  void main() {
    vec2 dxy = pixelSize / resolution;
    vec2 coord = dxy * floor(vUv / dxy);
    
    vec4 color = texture2D(tDiffuse, coord);
    
    if (normalEdgeStrength > 0.0) {
      vec2 texelSize = pixelSize / resolution;
      vec4 c1 = texture2D(tDiffuse, coord + vec2(-texelSize.x, -texelSize.y));
      vec4 c2 = texture2D(tDiffuse, coord + vec2(0.0, -texelSize.y));
      vec4 c3 = texture2D(tDiffuse, coord + vec2(texelSize.x, -texelSize.y));
      vec4 c4 = texture2D(tDiffuse, coord + vec2(-texelSize.x, 0.0));
      vec4 c6 = texture2D(tDiffuse, coord + vec2(texelSize.x, 0.0));
      vec4 c7 = texture2D(tDiffuse, coord + vec2(-texelSize.x, texelSize.y));
      vec4 c8 = texture2D(tDiffuse, coord + vec2(0.0, texelSize.y));
      vec4 c9 = texture2D(tDiffuse, coord + vec2(texelSize.x, texelSize.y));
      
      vec4 sobelX = c1 * -1.0 + c3 * 1.0 + c4 * -2.0 + c6 * 2.0 + c7 * -1.0 + c9 * 1.0;
      vec4 sobelY = c1 * -1.0 + c2 * -2.0 + c3 * -1.0 + c7 * 1.0 + c8 * 2.0 + c9 * 1.0;
      
      vec4 sobel = sqrt(sobelX * sobelX + sobelY * sobelY);
      float edge = max(max(sobel.r, sobel.g), sobel.b);
      
      color = mix(color, vec4(0.0, 0.0, 0.0, 1.0), edge * normalEdgeStrength);
    }
    
    gl_FragColor = color;
  }
`;

export class RenderPixelatedPass extends Pass {
  resolution: THREE.Vector2;
  fsQuad: FullScreenQuad;
  material: THREE.ShaderMaterial;

  constructor(resolution: THREE.Vector2, scene: THREE.Scene, camera: THREE.Camera, options: PixelatedPassOptions = {}) {
    super();

    this.resolution = resolution;

    const uniforms = {
      tDiffuse: { value: null },
      resolution: { value: resolution.clone() },
      pixelSize: { value: options.pixelSize || 8 },
      normalEdgeStrength: { value: options.normalEdgeStrength || 0.3 },
    };

    this.material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: pixelVertexShader,
      fragmentShader: pixelFragmentShader
    });

    this.fsQuad = new FullScreenQuad(this.material);
  }

  render(renderer: THREE.WebGLRenderer, writeBuffer: THREE.WebGLRenderTarget | null, readBuffer: THREE.WebGLRenderTarget): void {
    this.material.uniforms.tDiffuse.value = readBuffer.texture;

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
    } else {
      renderer.setRenderTarget(writeBuffer);
    }

    this.fsQuad.render(renderer);
  }

  setSize(width: number, height: number): void {
    this.material.uniforms.resolution.value.set(width, height);
  }

  dispose(): void {
    this.material.dispose();
    this.fsQuad.dispose();
  }
}