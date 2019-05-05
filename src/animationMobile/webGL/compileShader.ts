import getWebGLInstance from './webGLInstance'

type IType = 'FRAGMENT_SHADER' | 'VERTEX_SHADER'

const gl = getWebGLInstance()

const compileShader = (type: IType, source: string) => {
  const shader = gl.createShader(gl[type]) as WebGLShader
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw gl.getShaderInfoLog(shader)
  }

  return shader
}

export default compileShader
