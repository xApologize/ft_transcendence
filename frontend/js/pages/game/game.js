import { World } from './src/World.js';
import { loadHTMLPage } from '../../api/fetchData.js';
import { loadFonts } from './src/systems/Fonts.js';
import { loadModel } from './src/systems/Loader.js';
import interactiveSocket from '../home/socket.js';

export async function showGame() {
  try {
	await loadFonts();
	await loadModel();
    await loadHTMLPage('./js/pages/game/game.html')

	const world = new World( document.querySelector('#sceneContainer') );

	const startBtn = document.getElementById('startBtn');
	startBtn.addEventListener('click', () => {
		world.currentGameState = "lookingForPlayer";
		interactiveSocket.sendMessageSocket(JSON.stringify({"type": "Find Match"}));
		startBtn.classList.add("d-none");
		document.getElementById('lfp').classList.remove("d-none");
	});


  } catch (error) {
	  console.error('Error fetching game.html:', error);
  }
}
