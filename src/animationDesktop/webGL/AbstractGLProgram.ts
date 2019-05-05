import getWebGLInstance from './webGLInstance'
import compileShader from './compileShader';

const gl = getWebGLInstance()

interface ILocationBase {
  [key: string]: WebGLUniformLocation
}

interface IAttribLocation {
  [key: string]: number
}

abstract class AbstractGLProgram {
  public program: WebGLProgram
  public uniformsLocation: ILocationBase 
  public attributesLocation: IAttribLocation

  constructor (vertexShaderCode: string, fragmentShaderCode: string) {

    const vertexShader = compileShader('VERTEX_SHADER', vertexShaderCode)
    const fragmentShader = compileShader('FRAGMENT_SHADER', fragmentShaderCode)

    this.program = gl.createProgram() as WebGLProgram
    
    gl.attachShader(this.program, vertexShader)
    gl.attachShader(this.program, fragmentShader)
    gl.linkProgram(this.program)
    
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.program)
    }
    
    this.uniformsLocation = {}
    const uniformsCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS)
    for (let i = 0; i < uniformsCount; i++) {
      const { name } = gl.getActiveUniform(this.program, i) as WebGLActiveInfo
      this.uniformsLocation[name] = gl.getUniformLocation(this.program, name) as WebGLUniformLocation
    }
    
    this.attributesLocation = {}
    const attributesCount = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < attributesCount; i++) {
      const { name } = gl.getActiveAttrib(this.program, i) as WebGLActiveInfo
      this.attributesLocation[name] = gl.getAttribLocation(this.program, name)
    }
  }

  useProgram () {
    gl.useProgram(this.program)
  }
}

export default AbstractGLProgram
