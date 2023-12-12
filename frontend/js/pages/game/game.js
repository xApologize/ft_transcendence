import { World } from './src/World.js';
import { loadHTMLPage } from '../../api/fetchData.js';
import { loadFonts } from './src/systems/Fonts.js';
import { loadModel } from './src/systems/Loader.js';

export async function showGame() {
  try {
	await loadFonts();
	await loadModel();
    await loadHTMLPage('./js/pages/game/game.html')

	// Get a reference to the container element
	const container = document.querySelector('#sceneContainer');

	// 1. Create an instance of the World app
	const world = new World(container);

	// start animation loop
	world.start();

	// DESYNC: NEED CUSTOM SOLUTION
	// document.addEventListener( 'visibilitychange', () => {
	// 	if (document.hidden)
	// 		world.stop();
	// 	else
	// 		world.start();
	// });

  } catch (error) {
	  console.error('Error fetching game.html:', error);
  }
}
