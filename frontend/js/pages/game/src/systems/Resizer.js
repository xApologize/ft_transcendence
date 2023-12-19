const setSize = ( container, camera, renderer, composer ) => {
	// PERSPECTIVE CAMERA
	// aspect based on terrain sizes
	camera.aspect = container.clientWidth / container.clientHeight;
	camera.zoom = camera.aspect < 16/9 ? camera.aspect / (16/9) : 1;

	camera.top = 8 * container.clientHeight / container.clientWidth;
	camera.bottom = -8 * container.clientHeight / container.clientWidth;
	camera.updateProjectionMatrix();

	renderer.setSize(container.clientWidth, container.clientHeight);
	renderer.setPixelRatio(window.devicePixelRatio);

	composer.setSize( container.clientWidth, container.clientHeight );
};

class Resizer {
	constructor( container, camera, renderer, composer ) {
	// set initial size on load
	setSize( container, camera, renderer, composer );

	this.resizeEvent = window.addEventListener('resize', () => {
		// set the size again if a resize occurs
		setSize( container, camera, renderer, composer );
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
  