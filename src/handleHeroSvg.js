const blueColor = '#6ccef3'
const purpleColor = '#2b1554'
const startX = 140//300
const startY = 238//40.5//405
const domeCircleHeight = 81
const domeWidth = 103
const namespace = 'http://www.w3.org/2000/svg'
const $svg = document.querySelector('#Warstwa_1')
const $dome = $svg.querySelector('#observator-dome')

const $rightCircle = $svg.querySelector('#dome-right-circle');
const $centerRect = $svg.querySelector('#dome-center-rect');
const $leftCircle = $svg.querySelector('#dome-left-circle');

const $leftLight = $svg.querySelector('#left-light');
const $centerLight = $svg.querySelector('#center-light');
const $rightLight = $svg.querySelector('#right-light');

const calcOffsetA = x => -4.04568 * x * x - 2.92994 * x + 37.9878
//https://www.wolframalpha.com/input/?i=quadratic+fit+%7B0,+38%7D,+%7B0.33,+36+%7D,+%7B0.67,+32%7D,+%7B1,+26%7D

const calcOffsetB = x => -4.52284 * x * x - 4.45887 * x + 26.9909
// https://www.wolframalpha.com/input/?i=quadratic+fit+%7B0,+27%7D,+%7B0.33,+25+%7D,+%7B0.67,+22%7D,+%7B1,+18%7D

const calcHeightA = x => 23.5685 * x * x - 27.3369 * x + 82.8842
// https://www.wolframalpha.com/input/?i=quadratic+fit+%7B0,+81%7D,+%7B0.33,+73+%7D,+%7B0.67,+69%7D,+%7B1,+67%7D

const calcWidthA = x => 20.3528 * x * x + 44.0251 * x - 0.188957
//https://www.wolframalpha.com/input/?i=quadratic+fit+%7B0,+0%7D,+%7B0.33,+16+%7D,+%7B0.67,+39%7D,+%7B1,+64%7D

const calcWidthB = x => 29.3985 * x * x + 46.9551 * x - 0.176766
// https://www.wolframalpha.com/input/?i=quadratic+fit+%7B0,+0%7D,+%7B0.33,+18+%7D,+%7B0.67,+45%7D,+%7B1,+76%7D

const updateDome = (progress) => {
  const absoluteValue = Math.abs(progress)
  const offsetA = calcOffsetA(absoluteValue)
  const offsetB = calcOffsetB(absoluteValue)
  const widthA = Math.max(0, calcWidthA(absoluteValue)) / 2
  const heightA = calcHeightA(absoluteValue) / 2
  const widthB = Math.max(0, calcWidthB(absoluteValue)) / 2

  $leftCircle.setAttribute('rx', widthA)
  $leftCircle.setAttribute('ry', heightA)
  $rightCircle.setAttribute('rx', widthB)
  $rightCircle.setAttribute('ry', domeCircleHeight / 2)
  $centerRect.setAttribute('width', offsetB)

  if (progress > 0) {
    $rightCircle.setAttribute('cx', startX + offsetA + offsetB)
    $centerRect.setAttribute('x', startX + offsetA)
    $leftCircle.setAttribute('cx', startX + offsetA)
    return startX + (offsetA + widthA + offsetA + offsetB + widthB ) / 2
  } else {
    $leftCircle.setAttribute('cx', startX + domeWidth - offsetA)
    $centerRect.setAttribute('x', startX + domeWidth - offsetA - offsetB) // 178
    $rightCircle.setAttribute('cx', startX + domeWidth - (offsetA + offsetB))
    return startX + ( (domeWidth - (offsetA + offsetB + widthA)) + (domeWidth - (offsetA + widthB)) ) / 2
  }
}



const $eye = $svg.querySelector('#observator-eye')
const eyeSize = 44.5
const maxDistance = 60
const pipeOffsetX = 17;
const pipeOffsetY = -22;

const updateEye = (progressX, progressY, domeCenterX) => {
  const angle = Math.atan2((1 - progressY), -progressX) - Math.PI / 2
  const normalDistanceToMouse = Math.hypot(progressX, (1 - progressY)) // <0, √2>
  const normalDistance = Math.min(1, normalDistanceToMouse) // <0, 1> to avoid square effect, make it rounded

  const x = Math.sin(angle) * normalDistance * maxDistance
  const y = -Math.cos(angle) * normalDistance * maxDistance

  const scaleX = Math.pow((1 - Math.abs(progressX)), 1.1) * 0.35 + 0.65;
  const scaleY = Math.pow(progressY, 1.1) * 0.35 + 0.65;
  
  const maxSkewX = 35 * normalDistance
  const skewX = Math.sin(angle * 2) * maxSkewX
  // Math.sin(angle * 2) - sin works fine, but other functions also can do it
  
  const offsetSkewX = Math.tan(skewX * Math.PI / 180) * eyeSize / 2;
  // https://vimeo.com/98137613 17min

  const offsetX = -pipeOffsetX * progressX;
  const translateX = domeCenterX + x + offsetX - eyeSize / 2 - offsetSkewX
  const translateY = startY + pipeOffsetY + y - eyeSize / 2
  const matrixE = eyeSize / 2 - scaleX * eyeSize / 2
  const matrixF = eyeSize / 2 - scaleY * eyeSize / 2
  $eye.setAttribute('transform', `translate(${translateX}, ${translateY}), skewX(${skewX}), matrix(${scaleX}, 0, 0, ${scaleY}, ${matrixE}, ${matrixF})`)

  return { normalDistance, angle }
}



const pipeWidth = 43
const pipeHeight = 55
const $pipe = $svg.querySelector('#observator-pipe');

const updatePipe = (progressX, domeCenterX, normalDistance, angle) => {
  // transform="matrix(sx, 0, 0, sy, cx-sx*cx, cy-sy*cy)"
  // sx, sy - scaling factor
  // cx, cy - origin point
  const scaleY = normalDistance * (maxDistance / pipeHeight)
  const originX = pipeWidth / 2
  const originY = pipeHeight
  const offsetX = -pipeOffsetX * progressX;
  const translateX = domeCenterX + offsetX - pipeWidth / 2
  const translateY = startY + pipeOffsetY - pipeHeight
  const angleInDeg = angle * 180 / Math.PI
  const matrixE = originX - 1 * originX
  const matrixF = originY - scaleY * originY
  $pipe.setAttribute('transform', `translate(${translateX}, ${translateY}), rotate(${angleInDeg}, ${originX}, ${originY}), matrix(1, 0, 0, ${scaleY}, ${matrixE}, ${matrixF})`)
  // TODO: pipe should be rounded in origin!
  // but this rounded end shouldn't be part of pipe, it another element (to avoid scaling)
  // end on pipe should be only rotated
}

const lights = [
  { node: $leftLight, progress: 1.8 },
  { node: $centerLight, progress: 1.6 },
  { node: $rightLight, progress: 0.2 },
]
const updateLights = (progressX) => {
  const convertedProgress = progressX + 1;
  lights.forEach(light => {
    const diff = (2 - Math.abs(convertedProgress - light.progress)) / 2;
    light.node.style.opacity = diff * diff;
  });
}


const updateMousePosition = (event) => {
  const halfWidth = innerWidth / 2
  const progressX = (event.clientX - halfWidth) / halfWidth
  const progressY = event.clientY / window.innerHeight
  const domeCenterX = updateDome(progressX)
  const { normalDistance, angle } = updateEye(progressX, progressY, domeCenterX)
  updatePipe(progressX, domeCenterX, normalDistance, angle)
  updateLights(progressX);
}

document.addEventListener('mousemove', updateMousePosition)