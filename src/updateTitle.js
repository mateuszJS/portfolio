const getEventName = () => {
  if (typeof document.hidden !== 'undefined') {
    return ['hidden', 'visibilitychange'];
  } else if (typeof document.msHidden !== 'undefined') {
    return ['msHidden', 'msvisibilitychange'];
  } else if (typeof document.webkitHidden !== 'undefined') {
    return ['webkitHidden', 'webkitvisibilitychange'];
  }
  return [];
};
const [hiddenProp, eventName] = getEventName();
const defaultTitle = 'Mateusz Portoflio 🍾';
const titles = [
  'Hey! What are you doing?',
  'HEY!',
  'Come back here!',
  'Please?',
  'I\'m still waiting.',
  'One sheep, two sheep...',
  'Z...',
  'Zz...',
  'Zzz...',
];
const intervalTime = 1800;
let currentIndex = 0;

const updateTitle = (setDefault) => {
  if (setDefault) {
    document.title = defaultTitle;
    currentIndex = 0;
  } else {
    document.title = titles[currentIndex];
    currentIndex = (currentIndex + 1) % titles.length;
  }
}

let updateInterval;
const handleVisibilityChange = () => {
  if (document[hiddenProp]) {
    updateInterval = setInterval(updateTitle, intervalTime);
  } else {
    clearInterval(updateInterval);
    updateTitle(true);
  }
}
export default () => {
  if (hiddenProp) {
    document.addEventListener(eventName, handleVisibilityChange, false);
  }
};
