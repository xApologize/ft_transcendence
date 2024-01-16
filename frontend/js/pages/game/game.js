import { World } from './src/World.js';
import { loadHTMLPage } from '../../api/fetchData.js';
import { loadAll } from './src/systems/Loader.js';
import interactiveSocket from '../home/socket.js';
import { GameState } from './src/systems/GameStates.js';

export async function showGame() {
	try {
		await loadAll();
		await loadHTMLPage('./js/pages/game/game.html')

		const world = new World( document.querySelector('#sceneContainer') );

		const startBtn = document.getElementById('startBtn');
		startBtn.addEventListener('click', () => {
			world.currentGameState = GameState.LookingForPlayer;
			interactiveSocket.sendMessageSocket(JSON.stringify({"type": "Find Match"}));
			// interactiveSocket.sendMessageSocket(JSON.stringify({"type": "Tournament", "action": "Leave", "owner_id": 69}));
			startBtn.classList.add("d-none");
			document.getElementById('lfp').classList.remove("d-none");
		});


	} catch (error) {
		console.error('Error fetching game.html:', error);
	}
}
