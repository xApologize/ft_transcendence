import { loadHTMLComponent, loadHTMLPage } from '../../api/fetchData.js';
import { World } from '../game/src/World.js';
import GameModal from './gameModal.js';

//////////////
// [GAME]
// - Gérer event listener quand popup est close & page reload pour le modal ET le world.
// - Gérer les ressources world (Faire une fonction qui permet de bien tout stop)
// - 
//
//////////////

export async function showHome() {
  try {
    await loadHTMLPage('./js/pages/home/home.html')
    
    document.getElementById('game').addEventListener('click', () => {
      const gameModal = new GameModal('gameModal');
      testShowGame(gameModal)
    });

    document.getElementById('fake_matchmaking').addEventListener('click', () => {
      const gameModal = new GameModal('gameModal');
      startLookingForPlayers(gameModal)
    });
  } catch (error) {
    console.error('Error fetching home.html:', error);
  }
}

// Handle when page is refresh ? Local Storage ?
async function testShowGame(gameModal) {
    gameModal.openModal();
    gameModal.modalToggleFullscreen(true)
    gameModal.modal._element.classList.add('show')

    showGame(gameModal)
}

async function startLookingForPlayers(gameModal) {
    gameModal.openModal();
    gameModal.modalToggleFullscreen(false)
    gameModal.showHeader()
    gameModal.updateModalContent('Looking for other players...', 'Searching...');

    const firstTimeout = setTimeout(() => {
      if (!gameModal.isModalShown()) {
        gameModal.clearTimeouts();
        return ;
      }
      gameModal.hideCloseButton();
      gameModal.updateModalContent('Game is starting!', 'Match Found');
    }, 5000);
    
    const secondTimeout = setTimeout(() => {
      if (!gameModal.isModalShown()) {
        gameModal.clearTimeouts();
        return ;
      }
      gameModal.updateModalContent('', 'Game')
      gameModal.showCloseButton()
      gameModal.modalToggleFullscreen(true)
      showGame(gameModal)
    }, 10000);

    gameModal.setTimeoutIds(firstTimeout, secondTimeout)
}

function showGame(gameModal) {
  gameModal.setTitle('Game')
  gameModal.launchWorld()
  // const container = document.querySelector('#gameModalBody');
	// const world = new World(container);

	// world.start();
  // gameModal.modal._element.addEventListener('hidden.bs.modal', () => {
  //   console.log('stop');
  //   world.stop();
  //   gameModal.modalToggleFullscreen(false)
  //   gameModal.removeCanvas()
  // });
}


