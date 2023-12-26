import { GLTFLoader } from '/public/three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from '/public/three/examples/jsm/loaders/FontLoader.js';
import { RepeatWrapping, TextureLoader } from 'three';

let airHockeyTable;
let floorDiffuse;
let floorNormal;
let digitalFont;

const loaderGLTF = new GLTFLoader();
const loaderTexture = new TextureLoader();
const loaderFont = new FontLoader();

async function loadAll() {
	await loadFile( loaderGLTF, '/public/model/model.glb' ).then( (res) => airHockeyTable = res );
	await loadFile( loaderTexture, '/public/three/examples/textures/floors/FloorsCheckerboard_S_Diffuse.jpg' ).then( (res) => floorDiffuse = res );
	floorDiffuse.wrapS = RepeatWrapping;
	floorDiffuse.wrapT = RepeatWrapping;
	floorDiffuse.repeat.set( 16, 16 );
	await loadFile( loaderTexture, '/public/three/examples/textures/floors/FloorsCheckerboard_S_Normal.jpg' ).then( (res) => floorNormal = res );
	floorNormal.wrapS = RepeatWrapping;
	floorNormal.wrapT = RepeatWrapping;
	floorNormal.repeat.set( 16, 16 );
	await loadFile( loaderFont, '/public/fonts/DSEG.json' ).then( (res) => digitalFont = res );
}

function loadFile( loader, filePath ) {
	return new Promise( resolve => {
		loader.load(
			filePath,
			function ( gltf ) { resolve( gltf ); },
			undefined,
			function ( error ) { console.error( error ); }
		);

	}, 2000)
}

export { loadAll, airHockeyTable, floorDiffuse, floorNormal, digitalFont };