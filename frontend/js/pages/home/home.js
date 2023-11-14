import { loadHTMLComponent, loadHTMLPage } from '../../api/fetchData.js';
import { World } from '../game/src/World.js';
import GameModal from './gameModal.js';

export async function showHome() {
  try {
    await loadHTMLPage('./js/pages/home/home.html')
    // document.getElementById('button_test').addEventListener('click', () => {
    //   startLookingForPlayers()
    // });
    document.getElementById('button_test').addEventListener('click', () => {
      testShowGame()
    });
  } catch (error) {
    console.error('Error fetching home.html:', error);
  }
}

async function testShowGame() {
  const gameModal = new GameModal('gameModal');
  gameModal.setBackdrop('static');

  var modalBody = document.getElementById('gameModalBody');
  const game = await loadHTMLComponent('./js/pages/game/game.html')
  
  modalBody.appendChild(game)
  const container = document.querySelector('#scene-container');

	// 1. Create an instance of the World app
	const world = new World(container);

	// start animation loop
	world.start();
  gameModal.show();
	// document.addEventListener( 'visibilitychange', () => {
	// 	if (document.hidden)
	// 		world.stop();
	// 	else
	// 		world.start();
	// });
}

async function startLookingForPlayers() {
  const gameModal = new GameModal('gameModal');
  gameModal.setBackdrop('static');

  gameModal.showTitle()
  gameModal.showCloseButton()
  updateModalContent('Looking for other players...', 'Searching...');
  gameModal.show();

  setTimeout(() => {
    gameModal.hideCloseButton();
    updateModalContent('Game is starting!', 'Match Found');
  }, 10000);
  
  setTimeout(() => {
    gameModal.hideTitle();
    showGame(gameModal);
  }, 15000);

  setTimeout(() => {
    gameModal.hide()
  }, 20000)
}

function showGame() {
  var modalBody = document.getElementById('gameModalBody');
  modalBody.innerHTML = '<div class="text-center"><img src="https://i.imgur.com/hiarmpU.png" alt="Your Image Alt Text"></div>';
}

function updateModalContent(content, title) {
  var modalBody = document.getElementById('gameModalBody');
  var modalTitle = document.getElementById('gameModalTitle');

  console.log(content)
  if (content !== null && content !== undefined) {
    modalBody.innerHTML = content;
  }

  if (title !== null && title !== undefined) {
    modalTitle.innerHTML = title;
  }
}

