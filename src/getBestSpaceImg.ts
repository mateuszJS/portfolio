import spaceHorizontal_1080 from './assets/spaceDesktop/spaceHorizontal_1080.jpg'
import spaceHorizontal_1863 from './assets/spaceDesktop/spaceHorizontal_1863.jpg'
import spaceHorizontal_2469 from './assets/spaceDesktop/spaceHorizontal_2469.jpg'
import spaceHorizontal_2969 from './assets/spaceDesktop/spaceHorizontal_2969.jpg'

import spaceVertical_200 from './assets/spaceMobile/spaceVertical_200.jpg'
import spaceVertical_256 from './assets/spaceMobile/spaceVertical_256.jpg'
import spaceVertical_303 from './assets/spaceMobile/spaceVertical_303.jpg'
import spaceVertical_343 from './assets/spaceMobile/spaceVertical_343.jpg'
import spaceVertical_416 from './assets/spaceMobile/spaceVertical_416.jpg'
import spaceVertical_530 from './assets/spaceMobile/spaceVertical_530.jpg'
import spaceVertical_604 from './assets/spaceMobile/spaceVertical_604.jpg'
import spaceVertical_712 from './assets/spaceMobile/spaceVertical_712.jpg'
import spaceVertical_830 from './assets/spaceMobile/spaceVertical_830.jpg'


const desktopResolutions = {
  1080: spaceHorizontal_1080,
  1863: spaceHorizontal_1863,
  2469: spaceHorizontal_2469,
  2969: spaceHorizontal_2969,
}

const mobileReoslutions = {
  200: spaceVertical_200,
  256: spaceVertical_256,
  303: spaceVertical_303,
  343: spaceVertical_343,
  416: spaceVertical_416,
  530: spaceVertical_530,
  604: spaceVertical_604,
  712: spaceVertical_712,
  830: spaceVertical_830,
}

const getBestSpaceImg = () => {
  let resolutiosnGorup;

  if (window.isMobile) {
    resolutiosnGorup = mobileReoslutions
  } else {
    resolutiosnGorup = desktopResolutions
  }
  const keys = Object.keys(resolutiosnGorup)
  const values = Object.values(resolutiosnGorup)
  for (let i = 0; i < keys.length; i++) {
    const res = Number(keys[i])
    const diffToNext = keys[i + 1] ? Number(keys[i + 1]) - res : 0
    if (screen.width < res + diffToNext * 0.3) {
      return values[i]
    }
  }
  return values[values.length - 1]
}

export default getBestSpaceImg
