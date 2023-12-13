import { World } from './src/World.js';
import { loadHTMLPage } from '../../api/fetchData.js';
import { loadFonts } from './src/systems/Fonts.js';
import { loadModel } from './src/systems/Loader.js';

export async function showGame() {
  try {
	await loadFonts();
	await loadModel();
    await loadHTMLPage('./js/pages/game/game.html')

	const world = new World( document.querySelector('#sceneContainer') );

  } catch (error) {
	  console.error('Error fetching game.html:', error);
  }
}
