const params: WebGLContextAttributes = {
  premultipliedAlpha: true,
  depth: false,
  stencil: false,
  antialias: false,
  preserveDrawingBuffer: false
}

let webGL: WebGLRenderingContext | null = null
export const initWebGL = (canvas: HTMLCanvasElement) => {
  webGL = canvas.getContext('webgl', params)
}

const getWebGLInstance = () => {
  if (!webGL) {
    console.error("Instance of WebGL wasn't provided! Firsty call initWebGL to getInstance.")
  }
  return webGL as WebGLRenderingContext
}

export default getWebGLInstance
