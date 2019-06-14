import './webGL/setup'
import GluePsyhic from './GluePsyhic'
import GlueRender from './GlueRender'
import getBestSpaceImg from '../getBestSpaceImg'
import particleImg from '../assets/circleSM30newInlineRed.png'
import { loadImage, TextureInfo } from './utils/loadImage'
import showInfoSvg from '../showSvgInfo';
import loadScriptToFetchPreviews from '../loadScriptToFetchPreviews';


// initial positon is vertical
const dimensions = {
  width: Math.min(screen.width, screen.height),
  height: Math.max(screen.width, screen.height),
}

const getDeviceOrientstion = () => {
  return Number(window.orientation || 0)
}

let deviceOrientation = getDeviceOrientstion()
const initialGamma = deviceOrientation
let temp_angle = initialGamma * Math.PI / 180 + Math.PI
let allowCalcPhycis = true

const workBtn = document.createElement('BUTTON') as HTMLButtonElement
workBtn.classList.add('btn')
workBtn.classList.add('btn-float')
workBtn.classList.add('btn-float--hidden')
workBtn.innerText = 'Works'

const btnWrapper = document.querySelector('.btn-float-container') as HTMLDivElement

btnWrapper.appendChild(workBtn)

if (window.floatButtonClickHandler) { // if main bundle was loaded first
  workBtn.addEventListener('click', window.floatButtonClickHandler as VoidFunction)
} else {
  window.floatButtonClickHandler = workBtn // if not, then assign button node and add listener in main bundle
}

let imagesWereLoaded = false
const spaceBackgroundImg = getBestSpaceImg()
const images: string[] = [
  spaceBackgroundImg,
  particleImg,
]


const floatButton = {
  node: workBtn,
  distance: dimensions.height * 0.2,
  currDistance: dimensions.height * 0.2,
  currRotation: 0,
}

const setup = (textures: TextureInfo[]) => {
  window.isMobileAnimationLoaded = true
  const gluePsyhic = new GluePsyhic(dimensions.width, dimensions.height)
  const glueRender = new GlueRender(textures, dimensions.width, dimensions.height)

  const handleResizeAndOrientation = () => {
    if (deviceOrientation === getDeviceOrientstion()) return

    const diff = deviceOrientation - getDeviceOrientstion()
    floatButton.currRotation += diff * Math.PI / 180

    deviceOrientation = getDeviceOrientstion()
  }

  window.addEventListener('resize', () => {
    handleResizeAndOrientation();
  });

  window.addEventListener('orientationchange', () => {
    allowCalcPhycis = false
    setTimeout(() => allowCalcPhycis = true, 500);
    handleResizeAndOrientation(); // avoid unnecessary call
  });

  handleResizeAndOrientation();

  function handleOrientation(event: DeviceOrientationEvent) {
    const beta = Math.round(Number(event.beta || 0))
    const gamma = Math.round(Number(event.gamma || 0))
    if (getDeviceOrientstion() == 90) {
      temp_angle = 90 - beta;
    } else if (getDeviceOrientstion() == -90) {
      temp_angle = -(90 - beta);
    } else {
      temp_angle = -gamma;
    }

    temp_angle = temp_angle * Math.PI / 180 + Math.PI
    const horizontalLandscape = getDeviceOrientstion() === 90 || getDeviceOrientstion() === -90
    const radiusFactorX = horizontalLandscape ? 0.1 : 0.4
    const radiusFactorY = horizontalLandscape ? 0.3 : 0.25
    const x = Math.sin(temp_angle) * window.innerWidth * radiusFactorX
    const y = -Math.cos(temp_angle) * window.innerHeight * radiusFactorY
    floatButton.distance = Math.hypot(x, y)
  }
  window.addEventListener('deviceorientation', handleOrientation);

  let requestAnimationFrameId: number | null = null

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
    if (imagesWereLoaded && allowCalcPhycis) {
      play()
    }
  }

  const animateAngle = (curr: number, end: number) => {
    const d = Math.abs(curr - end) % (Math.PI * 2); 
    const r = d > Math.PI ? (Math.PI * 2) - d : d;
    //calculate sign 
    const sign = (curr - end >= 0 && curr - end <= Math.PI) || (curr - end <=-Math.PI && curr - end>= -(Math.PI * 2)) ? 1 : -1; 
    return r * sign;
  }

  const play = () => {
    gluePsyhic.update(Math.PI - temp_angle)
    glueRender.draw(gluePsyhic.circles, deviceOrientation)

    const angleDiff = animateAngle(floatButton.currRotation, temp_angle + Math.PI - (deviceOrientation * Math.PI / 180));
    const distanceDiff = -floatButton.currDistance + floatButton.distance;
    if (Math.abs(distanceDiff) < 1 && Math.abs(angleDiff) < 0.002) {
      floatButton.currDistance = floatButton.distance;
      floatButton.currRotation = temp_angle + Math.PI - (deviceOrientation * Math.PI / 180);
      const x = Math.sin(floatButton.currRotation - Math.PI) * floatButton.currDistance;
      const y = -Math.cos(floatButton.currRotation - Math.PI) * floatButton.currDistance;
      floatButton.node.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${floatButton.currRotation * 180 / Math.PI}deg)`;
    } else {
      floatButton.currDistance += distanceDiff * 0.05;
      floatButton.currRotation -= angleDiff * 0.02;
      const x = Math.sin(floatButton.currRotation - Math.PI) * floatButton.currDistance;
      const y = -Math.cos(floatButton.currRotation - Math.PI) * floatButton.currDistance;
      floatButton.node.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${floatButton.currRotation * 180 / Math.PI}deg)`;
    }
  }

  imagesWereLoaded = true
  // when user iso n main page AND rotuer is already laoded (if not, toggleRGA will be called on handlerMainPage())
  if (window.location.pathname === '/') {
    window.turnOnRAF()
    showInfoSvg(() => workBtn.classList.remove('btn-float--hidden'))
  } else {
    workBtn.classList.remove('btn-float--hidden')
  }
}

const promises = images.map(loadImage)
Promise.all(promises).then(setup)

loadScriptToFetchPreviews()
