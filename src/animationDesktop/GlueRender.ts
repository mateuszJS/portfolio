import { IGlueGroup } from "./GluePsyhic"
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
  // private angle: number

  constructor(textures: TextureInfo[]) {
    // this.angle = 0
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
    
  }

  private drawSingleParticle(
    tex: WebGLTexture,
    texWidth: number,
    texHeight: number,
    dstX: number,
    dstY: number,
    dstWidth: number,
    dstHeight: number,
    alpha: number,
  ) {
  
    let matrix = m4.orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);
    matrix = m4.translate(matrix, dstX - dstWidth / 2, dstY - dstHeight / 2, 0);
    matrix = m4.scale(matrix, dstWidth, dstHeight, 1);
    glueProgram.u_matrix = matrix
    // Tell the shader to get the texture from texture unit 0
    glueProgram.u_texture = 0
    glueProgram.u_alpha = alpha
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }


  private resize() {
    const width = gl.canvas.clientWidth
    const height = gl.canvas.clientHeight
    if (gl.canvas.width != width || gl.canvas.height != height) {
      gl.canvas.width = width
      gl.canvas.height = height
    }
  }

  private drawParticles(glueGroups: IGlueGroup[]) {
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

    glueGroups.forEach(({ particles }) => {
      particles.forEach(particle => {
        if (particle.lifeTime < 0) return
        const dstX = particle.x
        const dstY = particle.y
        const dstWidth  = this.particleTexture.width * particle.scale
        const dstHeight = this.particleTexture.height * particle.scale
  
        this.drawSingleParticle(
          this.particleTexture.texture,
          this.particleTexture.width,
          this.particleTexture.height,
          dstX, dstY, dstWidth, dstHeight,
          particle.alpha)
      })
    })
  }

  private drawSpace() {
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
    // matrix = m4.zRotate(matrix, this.angle)
    matrix = m4.translate(matrix, 0, 0, 0);
    matrix = m4.scale(matrix, window.innerWidth, window.innerHeight, 1);
    spaceProgram.u_matrix = matrix

    // TODO: remember, bindTexture doesn't work as activeTexture(TEXTUE0) and bindTexture
    // SO if you are binding mroe than one texture, remember about set activeTexture
    spaceProgram.bind_texture(this.targetTexture, gl.TEXTURE0)
    spaceProgram.bind_texture(this.spaceTexture.texture, gl.TEXTURE1)

    spaceProgram.u_particlesTexture = 0
    spaceProgram.u_spaceTexture = 1

    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }

  public draw(glueGroups: IGlueGroup[]) {
    this.resize()
    this.drawParticles(glueGroups)
    this.drawSpace()
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
