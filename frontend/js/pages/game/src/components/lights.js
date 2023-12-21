import { CameraHelper, DirectionalLight, HemisphereLight } from 'three';

function createLights() {
	const ambientLight = new HemisphereLight(
		'Purple',
		'Fuchsia',
		1,
	);
	ambientLight.position.set( 0, 0, 1 );

	const mainLight = new DirectionalLight('white', 2);
	mainLight.position.set(10, 10, 10);
	mainLight.castShadow = true;
	// mainLight.shadow.bias = -0.00002;
	mainLight.shadow.normalBias = 0.006;
	mainLight.shadow.mapSize.width = 2048; // default is 512
	mainLight.shadow.mapSize.height = 2048; // default is 512

	mainLight.shadow.camera.left = -10;
	mainLight.shadow.camera.right = 10;
	mainLight.shadow.camera.top = 10;
	mainLight.shadow.camera.bottom = -10;
	mainLight.shadow.camera.updateProjectionMatrix();

	// DEBUG
	// World._instance.scene.add( new CameraHelper( mainLight.shadow.camera ) );

	return { ambientLight, mainLight};
}

export { createLights };
