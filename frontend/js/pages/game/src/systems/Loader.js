import { GLTFLoader } from '/public/three/examples/jsm/loaders/GLTFLoader.js';

let airHockeyTable;
const loader = new GLTFLoader();

function loadModel() {
	return new Promise(resolve => {
		loader.load(
			'/public/model/model.glb',
			
			function ( gltf ) {
				airHockeyTable = gltf;
				// console.log( "Model Loaded" );
				// console.log( airHockeyTable );
				resolve("resolved");
			},

			undefined,

			function ( error ) {
				console.error( error );
			}
		);

	}, 2000)
}

export { loadModel, airHockeyTable };