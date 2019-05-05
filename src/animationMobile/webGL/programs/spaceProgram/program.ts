import AbstractGLProgram from '../../AbstractGLProgram'
import getWebGLInstance from '../../webGLInstance'
import vertexShaderCode from './vertex.glsl'
import fragmentShaderCode from './fragment.glsl'

const gl = getWebGLInstance()

class GLProgram extends AbstractGLProgram {
  private positionBuffer: WebGLBuffer
  private texcoordBuffer: WebGLBuffer

  constructor () {
    super(vertexShaderCode, fragmentShaderCode)

    this.positionBuffer = gl.createBuffer() as WebGLBuffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
    const positions = [
      0, 0,
      0, 1,
      1, 0,
      1, 0,
      0, 1,
      1, 1,
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    this.texcoordBuffer = gl.createBuffer() as WebGLBuffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer)
    const texcoords = [
      0, 0,
      0, 1,
      1, 0,
      1, 0,
      0, 1,
      1, 1,
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW)
  }

  public bind_a_texcoord () {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
    gl.enableVertexAttribArray(this.attributesLocation.a_texcoord);
    gl.vertexAttribPointer(this.attributesLocation.a_texcoord, 2, gl.FLOAT, false, 0, 0);
  }

  public bind_a_position () {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
    gl.enableVertexAttribArray(this.attributesLocation.a_position)
    gl.vertexAttribPointer(this.attributesLocation.a_position, 2, gl.FLOAT, false, 0, 0)
  }

  public bind_texture (texture: WebGLTexture, textureNumber: GLenum) {
    gl.activeTexture(textureNumber);
    gl.bindTexture(gl.TEXTURE_2D, texture);
  }

  set u_spaceTexture (value: number) {
    gl.uniform1i(this.uniformsLocation.u_spaceTexture, value);
  }

  set u_particlesTexture (value: number) {
    gl.uniform1i(this.uniformsLocation.u_particlesTexture, value);
  }

  set u_matrix (value: Float32Array) {
    gl.uniformMatrix4fv(this.uniformsLocation.u_matrix, false, value);
  }
}

export default new GLProgram()
