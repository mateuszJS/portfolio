precision lowp float;

varying vec2 vFilterCoord;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D mapSampler;

uniform vec4 filterClamp;

void main(void) {
  vec4 masky =  texture2D(mapSampler, vFilterCoord);
  float strength =  masky.a * masky.a;//<0, 1>
  strength *= 3.5;//<0, 1.5>
  strength = min(1.0, strength);//<0, 1>
  vec2 pixelCoord = vTextureCoord + (1.0-strength) * 0.1;//(1.0-strength) * 0.1 <0, 0.1>
  vec2 clampedCoord = clamp(pixelCoord, filterClamp.xy, filterClamp.zw);

  vec4 original =  texture2D(uSampler, clampedCoord);
  original *= strength;
  //original.rgb *= original.rgb * original.rgb * original.rgb;
  gl_FragColor =  original;
}