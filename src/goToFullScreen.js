const docEl = window.document.documentElement;
const requestFullScreen =
	docEl.requestFullscreen ||
	docEl.mozRequestFullScreen ||
	docEl.webkitRequestFullScreen ||
	docEl.msRequestFullscreen;

const cancelFullScreen =
	docEl.exitFullscreen ||
	docEl.mozCancelFullScreen |
	docEl.webkitExitFullscreen ||
	docEl.msExitFullscreen;

export const goToFullScreen = () => {
	if (requestFullScreen) {
		requestFullScreen.call(docEl);
	}
}

export const leftFullScreen = () => {
	if (cancelFullScreen) {
		cancelFullScreen.call(docEl);
	}
}
