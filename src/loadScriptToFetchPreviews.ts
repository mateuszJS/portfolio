export default () => {
  const scriptNode = document.createElement('script')
  scriptNode.src = '/prefetchImages.bundle.js';
  document.head.appendChild(scriptNode);
}