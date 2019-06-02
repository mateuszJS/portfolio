const fixVhUnit = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
const addVHUnitsFix = () => {
  window.addEventListener('resize', fixVhUnit);
  fixVhUnit();
}

export default addVHUnitsFix;
