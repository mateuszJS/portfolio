export default (min, value, max) => {
  return Math.min(Math.max(value, min), max);
};