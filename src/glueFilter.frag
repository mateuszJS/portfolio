precision lowp float;

varying vec2 vFilterCoord;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D mapSampler;

uniform vec4 filterClamp;

void main(void) {
  vec4 masky =  texture2D(mapSampler, vFilterCoord);
  float strength =  masky.r * masky.r * 2.0;
  vec2 pixelCoord = vTextureCoord + (1.0-strength) * 0.1;
  vec2 clampedCoord = clamp(pixelCoord, filterClamp.xy, filterClamp.zw);
  gl_FragColor = texture2D(uSampler, clampedCoord) * strength;
}