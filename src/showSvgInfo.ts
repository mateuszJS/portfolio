import tryToRotateDeviceImg from './assets/tryToRotateTheDevice.svg';
import visitWebsiteOnMobileImg from './assets/visitWebsiteOnMobile.svg';

const showInfoSvg = (src: string, callback?: VoidFunction) => {
  const node = document.createElement('IMG') as HTMLImageElement
  node.src = src
  if (window.isMobile) {
    node.classList.add('info-svg')
  } else {
    node.classList.add('info-svg info-svg--desktop')
  }
  document.body.appendChild(node)
  window.getComputedStyle(node).opacity
  node.classList.add('info-svg--animation')

  setTimeout(() => {
    node.classList.remove('info-svg--animation')
    node.classList.add('info-svg--animation-end')
    if (callback) {
      callback();
    }
  }, 5000)
  setTimeout(() => {
    document.body.removeChild(node)
  }, 7000)
}

const initShowUpInfoSvg = (callback?: VoidFunction) => {
  const img = new Image();
  let src: string;
  if (window.isMobile) {
    src = tryToRotateDeviceImg
  } else {
    src = visitWebsiteOnMobileImg
  }
  img.onload = function() {
    showInfoSvg(src, callback);
  };
  img.src = src
}

export default initShowUpInfoSvg