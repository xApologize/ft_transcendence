import { World } from './src/World.js';
import { loadHTMLPage } from '../../api/fetchData.js';

export async function showGame() {
  try {
    await loadHTMLPage('./js/pages/game/game.html')

	// Get a reference to the container element
	const container = document.querySelector('#scene-container');

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
