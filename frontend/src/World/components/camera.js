import { PerspectiveCamera, OrthographicCamera } from '../../../node_modules/three/build/three.module.js';

function createCamera() {
	const aspect = window.innerHeight / window.innerWidth;
	const r = 8;

	// const camera = new PerspectiveCamera( 2, 1, 0.1, 1000 );
	// camera.position.set(0, 0, 500);

	const camera = new OrthographicCamera( -r, r, -r * aspect, r * aspect, 0.01, 100 );
	camera.position.set(0, 0, 10);

	return camera;
}

export { createCamera };
