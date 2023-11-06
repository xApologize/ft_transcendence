import { DirectionalLight, HemisphereLight } from '../../../node_modules/three/build/three.module.js';

function createLights() {
	const ambientLight = new HemisphereLight(
		'white',
		'darkslategray',
		10,
	);

  const mainLight = new DirectionalLight('white', 8);
  mainLight.position.set(10, 10, 10);

  return { ambientLight, mainLight};
}

export { createLights };
