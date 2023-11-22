import { World } from './src/World.js';
import { loadHTMLPage } from '../../api/fetchData.js';
import { loadFonts } from './src/systems/Fonts.js';

export async function showGame() {
  try {
    await loadHTMLPage('./js/pages/game/game.html')
	await loadFonts();

	// Get a reference to the container element
	const container = document.querySelector('#sceneContainer');

	// 1. Create an instance of the World app
	const world = new World(container);

	// start animation loop
	world.start();

	document.addEventListener( 'visibilitychange', () => {
		if (document.hidden)
			world.stop();
		else
			world.start();
	});

  } catch (error) {
    console.error('Error fetching game.html:', error);
  }
}
