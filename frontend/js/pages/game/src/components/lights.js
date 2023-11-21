import { DirectionalLight, HemisphereLight } from 'three';

function createLights() {
	const ambientLight = new HemisphereLight(
		'Purple',
		'Fuchsia',
		1,
	);
	ambientLight.position.set( 0, 0, 1 );

  const mainLight = new DirectionalLight('white', 1);
  mainLight.position.set(10, 10, 10);

  return { ambientLight, mainLight};
}

export { createLights };
