import { loadHTMLPage } from '../../api/fetchData.js';
import { World } from '../game/src/World.js';
import GameModal from './gameModal.js';
import { userTemplateComponent } from '../../components/userTemplate/userTemplate.js'


// Faire une fonction dans le backend pour get tout les online user, pour le everyone
export async function showHome() {
  try {
    await loadHTMLPage('./js/pages/home/home.html')
    // Load online user in everyone at the start.
    initPage()

    const friendsBtn = document.getElementById('friendsBtn')
    const everyoneBtn = document.getElementById('everyoneBtn')

    document.getElementById('button-toggle').addEventListener('click', () => {
      toggleLeftColumn()
    })

    friendsBtn.addEventListener('click', () => {
      friendsBtnFunc(friendsBtn, everyoneBtn)
    });

    everyoneBtn.addEventListener('click', async () => {
      everyoneBtnFunc(friendsBtn, everyoneBtn)
    })

  } catch (error) {
    console.error('Error fetching home.html:', error);
  }
}


/////////////////////////
// Init Page function  //
/////////////////////////

function iterateUser(templateUser, userContainer) {
  if (templateUser.length) {
    for (let i = 0; i < templateUser.length; i++) {
      userContainer.appendChild(templateUser[i].cloneNode(true));
      if (i < templateUser.length - 1) {
        userContainer.appendChild(document.createElement('hr'));
      }
    }
  } else {
    userContainer.appendChild(templateUser.cloneNode(true));
  }
}

async function displayUserLeftColumn() {
  let userContainer = document.getElementById('userDisplayEveryone')
  const templateUser = await userTemplateComponent();
  userContainer.innerHTML = ''
  userContainer.appendChild(document.createElement('hr'));
  iterateUser(templateUser, userContainer)
}


function initPage() {
  displayUserLeftColumn()
  // displayUserProfile() // Future component qui est actuellement dans home.html
  // diplayLeaderBoard() // not done
}

///////////////////////////////
//  Event Listener function  //
///////////////////////////////

function toggleLeftColumn() {
  const rightColumn = document.getElementById('right-column')
  const leftColumn = document.getElementById('left-column')
  const ownUserCard = document.getElementById('own-user-card')

  ownUserCard.classList.toggle('d-none')
  leftColumn.classList.toggle('d-none');
  rightColumn.classList.toggle('col-md-10')
  rightColumn.classList.toggle('col-md-12')
}

function everyoneBtnFunc(friendsBtn, everyoneBtn) {
  if (friendsBtn.classList.contains('active')) {
    friendsBtn.classList.remove('active')
  }
  if (!everyoneBtn.classList.contains('active')) {
    everyoneBtn.classList.add('active')
  }
  displayUserLeftColumn()
}

function friendsBtnFunc(friendsBtn, everyoneBtn) {
  if (everyoneBtn.classList.contains('active')) {
    everyoneBtn.classList.remove('active')
  }

  if (!friendsBtn.classList.contains('active')) {
    friendsBtn.classList.add('active')
  }
  let userContainer = document.getElementById('userDisplayEveryone')
  userContainer.innerHTML = ''
}

// async function testShowGame(gameModal) {
//     gameModal.setTitle('Game')
//     gameModal.openModal();
//     gameModal.launchWorld()
// }




