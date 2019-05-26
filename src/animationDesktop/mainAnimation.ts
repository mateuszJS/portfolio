import './webGL/setup'
import GluePsyhic from './GluePsyhic'
import GlueRender from './GlueRender'
import getBestSpaceImg from '../getBestSpaceImg'
import particleImg from '../assets/particle256.png'
// import particleImg from '../assets/particle.png'
import { loadImage, TextureInfo } from './utils/loadImage'
import getWebGLInstance from './webGL/webGLInstance';
import showInfoSvg from '../showSvgInfo';

const gl = getWebGLInstance()

let requestAnimationFrameId: number | null = null;
let imagesWereLoaded = false
const spaceBackgroundImg = getBestSpaceImg()
const images: string[] = [
  spaceBackgroundImg,
  particleImg,
]

const setup = (textures: TextureInfo[]) => {
  const gluePsyhic = new GluePsyhic()
  const glueRender = new GlueRender(textures)

  window.toggleRFA = () => {
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
    glueRender.draw(gluePsyhic.particles)
  }

  imagesWereLoaded = true

  if (gl.canvas.classList.contains('active')) {
    window.toggleRFA()
    showInfoSvg()
  }

}

const promises = images.map(loadImage)
Promise.all(promises).then(setup)
