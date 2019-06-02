precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_particlesTexture;
uniform sampler2D u_spaceTexture;

void main() {
  vec4 particleColor =  texture2D(u_particlesTexture, v_texcoord);
  float strength =  particleColor.a * particleColor.a * 1.5;
  vec2 pixelCoord = v_texcoord + (1.0-strength) * 0.1;
  float horizontal = (0.5 - particleColor.r) / 30.0;
  float vertical = (0.5 - particleColor.g) / 30.0;
  vec2 pixelCoordMapped = vec2(pixelCoord.x + horizontal, pixelCoord.y + vertical);
  vec4 original = texture2D(u_spaceTexture, pixelCoordMapped);
  original *= strength;
  gl_FragColor =  vec4(original.rgb + (particleColor.r - particleColor.g), original.a);
}
