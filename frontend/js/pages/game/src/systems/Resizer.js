const setSize = ( container, camera, renderer, composer ) => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.zoom = camera.aspect < 16/9 ? camera.aspect / (16/9) : 1;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);

	composer.setSize( window.innerWidth, window.innerHeight );
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
  