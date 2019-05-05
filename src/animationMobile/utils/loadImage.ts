import getWebGLInstance from "../webGL/webGLInstance"
// import { isPowerOf2 } from "./isPowerOf2"

export type TextureInfo = {
  width: number
  height: number
  texture: WebGLTexture
}

const gl = getWebGLInstance()

// gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)

export const loadImage = (url: string) => {
  const image = new Image()
  return new Promise<TextureInfo>((resolve) => {
    image.addEventListener('load', () => {
      const texture = gl.createTexture() as WebGLTexture
      const textureInfo = {
        width: image.width,
        height: image.height,
        texture,
      }

      gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      
      // if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      //   // Yes, it's a power of 2. Generate mips.
      //   gl.generateMipmap(gl.TEXTURE_2D)
      // } else {
        // No, it's not a power of 2. Turn of mips and set wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      // }

      resolve(textureInfo)
    })

    image.src = url
  })
}
