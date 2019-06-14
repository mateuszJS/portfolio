import './webGL/setup'
import GluePsyhic from './GluePsyhic'
import GlueRender from './GlueRender'
import getBestSpaceImg from '../getBestSpaceImg'
import particleImg from '../assets/particle256.png'
import { loadImage, TextureInfo } from './utils/loadImage'
import showInfoSvg from '../showSvgInfo';
import loadScriptToFetchPreviews from '../loadScriptToFetchPreviews';

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

  window.turnOnRAF = () => {
    if (!requestAnimationFrameId) {
      loop()
    }
  }

  window.turnOffRAF = () => {
    if (requestAnimationFrameId) {
      window.cancelAnimationFrame(requestAnimationFrameId)
      requestAnimationFrameId = null
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

  if (window.location.pathname === '/') {
    window.turnOnRAF()
    showInfoSvg()
  }

}

const promises = images.map(loadImage)
Promise.all(promises).then(setup)

loadScriptToFetchPreviews()
