import './webGL/setup'
import GluePsyhic from './GluePsyhic'
// import GluePsyhic from './GluePsyhic'
import GlueRender from './GlueRender'
import spaceBackgroundImg from '../assets/space.jpg'
import particleImg from '../assets/circleSM30newInline.png'
import { loadImage, TextureInfo } from './utils/loadImage'
import getWebGLInstance from './webGL/webGLInstance'


const gl = getWebGLInstance()

// initial positon is vertical
const dimensions = {
  width: Math.min(screen.width, screen.height),
  height: Math.max(screen.width, screen.height),
}

let deviceOrientation = Number(window.orientation)
const initialGamma = deviceOrientation
let temp_angle = initialGamma * Math.PI / 180 + Math.PI
let allowCalcPhycis = true

const workBtn = document.createElement('BUTTON') as HTMLButtonElement
workBtn.classList.add('btn')
workBtn.classList.add('btn--float')
workBtn.innerText = 'Works'

document.body.appendChild(workBtn)

workBtn.addEventListener('click', window.floatButtonClickHandler)

let requestAnimationFrameId: number | null = null
let imagesWereLoaded = false

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
  const gluePsyhic = new GluePsyhic(dimensions.width, dimensions.height)
  const glueRender = new GlueRender(textures, dimensions.width, dimensions.height)

  const handleResizeAndOrientation = () => {
    if (deviceOrientation === Number(window.orientation)) return
    deviceOrientation = Number(window.orientation)


    const btnContainerAngle = deviceOrientation  * Math.PI / 180 + Math.PI;
    const x = Math.sin(btnContainerAngle) * (0.7 * dimensions.width / 2);
    const y = -Math.cos(btnContainerAngle) * (0.7 * dimensions.height / 2);
    floatButton.distance = Math.sqrt(x * x + y * y);

    if (deviceOrientation == 0) {
    } else if (deviceOrientation == 90) {
    } else if (deviceOrientation == -90) {
    }
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
    // const absolute = Math.round(event.absolute);
    // const alpha    = Math.round(event.alpha);
    const beta     = Math.round(Number(event.beta))
    const gamma    = Math.round(Number(event.gamma))
    if (window.orientation == 90) {
      temp_angle = 90 - beta; // -(beta * 1.5 + gamma);
    } else if (window.orientation == -90) {
      temp_angle = -(90 - beta); // -(gamma - beta * 1.5);
    } else {
      temp_angle = -gamma;
    }
    temp_angle = temp_angle  * Math.PI / 180 + Math.PI;
    const x = Math.sin(temp_angle) * (0.7 * dimensions.width / 2);
    const y = -Math.cos(temp_angle) * (0.7 * dimensions.height / 2);
    floatButton.distance = Math.sqrt(x * x + y * y);
  }
  window.addEventListener('deviceorientation', handleOrientation);

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

    const angleDiff = animateAngle(floatButton.currRotation, temp_angle + Math.PI);
    const distanceDiff = -floatButton.currDistance + floatButton.distance;
    if (Math.abs(distanceDiff) < 1 && Math.abs(angleDiff) < 0.002) {
      floatButton.currDistance = floatButton.distance;
      floatButton.currRotation = temp_angle + Math.PI;
      const x = Math.sin(floatButton.currRotation - Math.PI) * floatButton.currDistance + dimensions.width / 2;
      const y = -Math.cos(floatButton.currRotation - Math.PI) * floatButton.currDistance + dimensions.height / 2;
      floatButton.node.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${floatButton.currRotation * 180 / Math.PI}deg)`;
    } else {
      floatButton.currDistance += distanceDiff * 0.05;
      floatButton.currRotation -= angleDiff * 0.02;
      const x = Math.sin(floatButton.currRotation - Math.PI) * floatButton.currDistance + dimensions.width / 2;
      const y = -Math.cos(floatButton.currRotation - Math.PI) * floatButton.currDistance + dimensions.height / 2;
      floatButton.node.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${floatButton.currRotation * 180 / Math.PI}deg)`;
    }
  }

  imagesWereLoaded = true

  if (gl.canvas.classList.contains('active')) {
    window.toggleRAF()
  }
}

const promises = images.map(loadImage)
Promise.all(promises).then(setup)
