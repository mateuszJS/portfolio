import { initWebGL } from './webGLInstance'

const canvasNode = document.querySelector('.animation-block') as HTMLCanvasElement
initWebGL(canvasNode);
