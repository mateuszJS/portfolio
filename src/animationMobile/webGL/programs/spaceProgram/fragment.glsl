precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_particlesTexture;
uniform sampler2D u_spaceTexture;

void main() {
  vec4 particleColor = texture2D(u_particlesTexture, v_texcoord);
  float strength = min(1.0, 2.0 * particleColor.a * particleColor.a);

  if (strength < 0.4) {

    gl_FragColor = vec4(0, 0, 0.2, 1.7 * strength);

  } else if (strength < 0.98) {

    vec2 pixelCoord = vec2(
      v_texcoord.x + (0.5 - particleColor.g) * 0.03,
      v_texcoord.y + (0.5 - particleColor.r) * 0.03
    );
    gl_FragColor = texture2D(u_spaceTexture, pixelCoord) * 2.0;

  } else {

    vec2 pixelCoord = vec2(
      v_texcoord.x + (0.5 - particleColor.g) * 0.03,
      v_texcoord.y + (0.5 - particleColor.r) * 0.03
    );
    gl_FragColor = texture2D(u_spaceTexture, pixelCoord) * strength;

  }
}

// void main() {
//   vec4 particleColor = texture2D(u_particlesTexture, v_texcoord);
//   float strength =  (particleColor.a * particleColor.a);
//   // float strength =  (particleColor.r * particleColor.a);
//   strength *= 2.0;
//   strength = min(1.0, strength);
//   vec2 pixelCoord = v_texcoord - (1.0 - strength) * 0.1;
//   // gl_FragColor = texture2D(u_spaceTexture, v_texcoord);
//   if (strength < 0.4) {
//     gl_FragColor = vec4(0, 0, 0.2, 1.7 * strength);
//     // gl_FragColor = vec4(0, 0, 0, 0);
//     // gl_FragColor = texture2D(u_spaceTexture, pixelCoord) * strength * 1.5;
//     return;
//   } else if (strength < 0.98) {
//     gl_FragColor = texture2D(u_particlesTexture, pixelCoord) * 2.0;
//     return;
//   }
//   gl_FragColor = texture2D(u_particlesTexture, pixelCoord) * strength;
// }

