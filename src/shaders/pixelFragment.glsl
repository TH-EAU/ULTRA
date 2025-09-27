uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform float pixelSize;
uniform float normalEdgeStrength;
uniform float depthEdgeStrength;
varying vec2 vUv;

void main() {
  vec2 dxy = pixelSize / resolution;
  vec2 coord = dxy * floor(vUv / dxy);
  
  vec4 color = texture2D(tDiffuse, coord);
  
  vec2 texelSize = 1.0 / resolution;
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
  
  gl_FragColor = color;
}