const setSize = ( container, camera, renderer, composer ) => {
	camera.aspect = container.clientWidth / container.clientHeight;
	camera.zoom = camera.aspect < 16/9 ? camera.aspect / (16/9) : 1;
	camera.updateProjectionMatrix();

	renderer.setSize(container.clientWidth, container.clientHeight);
	renderer.setPixelRatio(window.devicePixelRatio);

	composer.setSize( container.clientWidth, container.clientHeight );
};

class Resizer {
	constructor( container, camera, renderer, composer ) {
		setSize( container, camera, renderer, composer );

		this.resizeEvent = () => {
			setSize( container, camera, renderer, composer )
			this.onResize();
		};
		window.addEventListener( 'resize', this.resizeEvent );
	}

	onResize() {}

	delete() {
		window.removeEventListener('resize', this.resizeEvent);
	}
}

export { Resizer };
  