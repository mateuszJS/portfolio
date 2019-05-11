import { IParticle } from "./GluePsyhic"
import getWebGLInstance from "./webGL/webGLInstance"
import * as m4 from './utils/m4'
import glueProgram from './webGL/programs/glueProgram/program'
import spaceProgram from './webGL/programs/spaceProgram/program'
import { TextureInfo } from "./utils/loadImage";

const gl = getWebGLInstance()

export default class glueRender {
  private frameBuffer: WebGLFramebuffer
  private targetTextureWidth: number
  private targetTextureHeight: number
  private targetTexture: WebGLTexture
  private spaceTexture: TextureInfo
  private particleTexture: TextureInfo

  constructor(textures: TextureInfo[], width: number, height: number) {
    this.spaceTexture = textures[0]
    this.particleTexture = textures[1]

    this.targetTextureWidth = 256
    this.targetTextureHeight = 256
    this.targetTexture = gl.createTexture() as WebGLTexture
    gl.bindTexture(gl.TEXTURE_2D, this.targetTexture)


    // define size and format of level 0
    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const data = null;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
      this.targetTextureWidth, this.targetTextureHeight, border,
                  format, type, data);

    // set the filtering so we don't need mips
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


    // Create and bind the framebuffer
    this.frameBuffer = gl.createFramebuffer() as WebGLFramebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer)
    
    // attach the texture as the first color attachment
    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, this.targetTexture, level);
    
    gl.canvas.width = width
    gl.canvas.height = height
  }

  private drawSingleParticle(
    tex: WebGLTexture,
    texWidth: number,
    texHeight: number,
    dstX: number,
    dstY: number,
    dstWidth: number,
    dstHeight: number,
    reversAspectRatio: boolean,
    tint: vec3,
  ) {
    
    const width = reversAspectRatio ? gl.canvas.height : gl.canvas.width; 
    const height = reversAspectRatio ? gl.canvas.width : gl.canvas.height; 
    let matrix = m4.orthographic(0, width, height, 0, -1, 1);

    matrix = m4.translate(matrix, dstX - dstWidth / 2, dstY - dstHeight / 2, 0);
    matrix = m4.scale(matrix, dstWidth, dstHeight, 1);
    glueProgram.u_matrix = matrix
    // Tell the shader to get the texture from texture unit 0
    glueProgram.u_texture = 0
    glueProgram.u_tint = tint;
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }

  private drawParticles(particles: IParticle[], rotation: number) {
    // render to our targetTexture by binding the framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer)
  
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, this.targetTextureWidth, this.targetTextureHeight)
    
    // Clear the canvas AND the depth buffer.
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    
    gl.disable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
    
    glueProgram.useProgram()
    glueProgram.bind_texture(this.particleTexture.texture, gl.TEXTURE0)
    glueProgram.bind_a_position()
    glueProgram.bind_a_texcoord()

  
    particles.forEach(particle => {
      // const dstWidth  = this.particleTexture.width
      // const dstHeight = this.particleTexture.height

      this.drawSingleParticle(
        this.particleTexture.texture,
        this.particleTexture.width,
        this.particleTexture.height,
        particle.x,
        particle.y,
        100,
        100,
        rotation === 90 || rotation === -90,
        particle.tint,
      )
    })
  }

  private resize() {
    const width = window.innerWidth
    const height = window.innerHeight
    if (gl.canvas.width != width || gl.canvas.height != height) {
      gl.canvas.width = width
      gl.canvas.height = height
    }
  }

  private drawSpace(rotation: number) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // drawingBufferWidth - GPU has limit of texture to render
    // in mso cases is next power of 2, if monitor has size 1280x1024,
    // GPU size limit is probably 2048, drawingBuffer is that limit
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)

    // Clear the canvas AND the depth buffer.
    gl.clearColor(0, 0, 0, 0);   // clear to white
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    spaceProgram.useProgram()
    spaceProgram.bind_a_position()
    spaceProgram.bind_a_texcoord()

    let matrix = m4.orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);
    // this.angle += 0.002
    // matrix = m4.translate(matrix, -this.width * 0.5, -this.height * 0.5, 0);
    if (rotation === 90) {
      matrix = m4.translate(matrix, 0, gl.canvas.height, 0);
      matrix = m4.zRotate(matrix, -90 * Math.PI / 180)
      matrix = m4.scale(matrix, gl.canvas.height , gl.canvas.width, 1);
      // matrix = m4.scale(matrix, this.width, this.height, 1);
    } else if (rotation === -90) {
      matrix = m4.translate(matrix, gl.canvas.width, 0, 0);
      matrix = m4.zRotate(matrix, 90 * Math.PI / 180)
      matrix = m4.scale(matrix, gl.canvas.height , gl.canvas.width, 1);
    } else { 
      matrix = m4.scale(matrix, gl.canvas.width, gl.canvas.height, 1);
    }

    spaceProgram.u_matrix = matrix

    // TODO: remember, bindTexture doesn't work as activeTexture(TEXTUE0) and bindTexture
    // SO if you are binding mroe than one texture, remember about set activeTexture
    spaceProgram.bind_texture(this.targetTexture, gl.TEXTURE0)
    spaceProgram.bind_texture(this.spaceTexture.texture, gl.TEXTURE1)

    spaceProgram.u_particlesTexture = 0
    spaceProgram.u_spaceTexture = 1

    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }

  public draw(particles: IParticle[], rotation: number) {
    this.resize()
    this.drawParticles(particles, rotation)
    this.drawSpace(rotation)
  }
}
// non-pre-multipled alpha
// DestinationColor.rgb = (SourceColor.rgb * SourceColor.a) + (DestinationColor.rgb * (1 - SourceColor.a));

// pre-multipled alpha
// OutputTexture.rgb = InputTexture.rgb * InputTexture.a; OutputTexture.a = InputTexture.a;
// DestinationColor.rgb = ((SourceColor.rgb * SourceColor.a) * One) + (DestinationColor.rgb * (1 - SourceColor.a));


// The 3 most common blend functions are

// source is not premultiplied alpha
// gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

// source IS premultiplied
// gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

// additive with src alpha (usually used for effects like particles, explosions, magic)
// gl.blendFunc(gl.SRC_ALPHA gl.ONE);
