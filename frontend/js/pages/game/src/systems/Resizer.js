const setSize = ( container, camera, renderer, composer, resolutionScale ) => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.zoom = camera.aspect < 16/9 ? camera.aspect / (16/9) : 1;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio * resolutionScale );

	composer.setSize( window.innerWidth, window.innerHeight );
};

class Resizer {
	constructor( container, camera, renderer, composer ) {
		this.resolutionScale = 1;
		setSize( container, camera, renderer, composer, this.resolutionScale );

		this.resizeEvent = () => {
			setSize( container, camera, renderer, composer, this.resolutionScale )
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
  