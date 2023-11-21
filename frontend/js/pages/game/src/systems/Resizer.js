const setSize = (container, camera, renderer) => {
	camera.aspect = container.clientWidth / container.clientHeight; // PERSPECTIVE CAMERA
	camera.top = 8 * container.clientHeight / container.clientWidth;
	camera.bottom = -8 * container.clientHeight / container.clientWidth;
	camera.updateProjectionMatrix();

	renderer.setSize(container.clientWidth, container.clientHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
};

class Resizer {
	constructor(container, camera, renderer) {
	// set initial size on load
	setSize(container, camera, renderer);

	this.resizeEvent = window.addEventListener('resize', () => {
		// set the size again if a resize occurs
		setSize(container, camera, renderer);
		// perform any custom actions
		this.onResize();
	});
	}

	onResize() {}

	delete() {
		window.removeEventListener('resize', this.resizeEvent);
	}
}

export { Resizer };
  