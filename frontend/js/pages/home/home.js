import { loadHTMLComponent, loadHTMLPage } from '../../api/fetchData.js';
import { World } from '../game/src/World.js';
import GameModal from './gameModal.js';

//////////////
// [GAME]
// - Page reload -> Mettre un message d'avertissement le prévenant qu'il va leave
// - Backward -> Mettre un message avertissement aussi.
// - Frontward -> Bloqué ? Delete tout ce qui est frontward dans le history ?
//
//////////////
// [GENERAL]
// - Tout remove quand changement de page: nav menu, browser forward/backward (comment détecter reload? trigger popstate event on DomLoaded ?)
// - Remove: event listener, GameModal & World class to null.
//////////////


export async function showHome() {
  try {
    await loadHTMLPage('./js/pages/home/home.html')
    const gameModal = new GameModal('gameModal');
    
    localStorage.setItem("myCat", "Tom");
    console.log(localStorage.getItem("myCat"))
  
    document.getElementById('game').addEventListener('click', () => {
      testShowGame(gameModal)
    });

  } catch (error) {
    console.error('Error fetching home.html:', error);
  }
}

// Handle when page is refresh ? Local Storage ?
async function testShowGame(gameModal) {
    gameModal.openModal();
    gameModal.setTitle('Game')
    gameModal.launchWorld()
    showGame(gameModal)
}




