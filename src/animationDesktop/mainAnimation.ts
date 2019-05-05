import './webGL/setup'
import GluePsyhic from './GluePsyhic'
import GlueRender from './GlueRender'
import spaceBackgroundImg from '../assets/space.jpg'
import particleImg from '../assets/particle.png'
import { loadImage, TextureInfo } from './utils/loadImage'
import getWebGLInstance from './webGL/webGLInstance';

const gl = getWebGLInstance()

let requestAnimationFrameId: number | null = null;
let imagesWereLoaded = false

const images: string[] = [
  spaceBackgroundImg,
  particleImg,
]

const setup = (textures: TextureInfo[]) => {
  const gluePsyhic = new GluePsyhic()
  const glueRender = new GlueRender(textures)

  window.toggleRAF = () => {
    if (requestAnimationFrameId) {
      window.cancelAnimationFrame(requestAnimationFrameId)
      requestAnimationFrameId = null
    } else {
      loop()
    }
  }

  const loop = () => {
    requestAnimationFrameId = requestAnimationFrame(loop);
    if (imagesWereLoaded) {
      play()
    }
  }

  const play = () => {
    gluePsyhic.update()
    glueRender.draw(gluePsyhic.glueGroups)
  }

  imagesWereLoaded = true

  if (gl.canvas.classList.contains('active')) {
    window.toggleRAF()
  }
}

const promises = images.map(loadImage)
Promise.all(promises).then(setup)
