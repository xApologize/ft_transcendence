import { World } from './src/World.js';
import { loadHTMLPage } from '../../api/fetchData.js';

export async function showGame() {
	try {
	  await loadHTMLPage('./js/pages/game/game.html');

	  const container = document.querySelector('#scene-container');
	  var world = new World(container);
	  world.start();
  
	  console.log('add !')
	  window.addEventListener('popstate', unloadGame);

	  function unloadGame(event) {
		event.preventDefault()
		console.log('remove !')
		world.stop();
		world = null
		window.removeEventListener('popstate', unloadGame);
	  }
  } catch (error) {
	  console.error('Error fetching game.html:', error);
  }
}
