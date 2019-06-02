import tryToRotateDeviceImg from './assets/tryToRotateTheDevice.svg';
import visitWebsiteOnMobileImg from './assets/visitWebsiteOnMobile.svg';

const showInfoSvg = (src: string, callback?: VoidFunction) => {
  const node = document.createElement('IMG') as HTMLImageElement
  node.src = src
  if (window.isMobile) {
    node.classList.add('info-svg')
  } else {
    node.classList.add('info-svg')
    node.classList.add('info-svg--desktop')
  }
  document.body.appendChild(node)
  window.getComputedStyle(node).opacity
  node.classList.add('info-svg--animation')

  window.removeSvgInfo = function() {
    if (!window.removeSvgInfo) {
      return;
    }
    window.removeSvgInfo = undefined;
    node.classList.remove('info-svg--animation')
    node.classList.add('info-svg--animation-end')
    setTimeout(() => {
      document.body.removeChild(node)
    }, 2000)
    if (callback) {
      callback();
    }
  }
  setTimeout(window.removeSvgInfo, 5000)
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