import { loadHTMLPage } from '../../api/fetchData.js';
import { World } from '../game/src/World.js';
import GameModal from './gameModal.js';
import { userTemplateComponent } from '../../components/userTemplate/userTemplate.js'


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

async function displayUser(userContainer) {
  const templateUser = await userTemplateComponent();
  userContainer.innerHTML = ''
  userContainer.appendChild(document.createElement('hr'));
  iterateUser(templateUser, userContainer)
}


// Faire une fonction dans le backend pour get tout les online user, pour le everyone
export async function showHome() {
  try {
    await loadHTMLPage('./js/pages/home/home.html')
    initPage()

    const friendsBtn = document.getElementById('friendsBtn')
    const everyoneBtn = document.getElementById('everyoneBtn')

    // Load online user in everyone at the start.
    document.getElementById('button-toggle').addEventListener('click', () => {
      toggleLeftColumn()
    })

    friendsBtn.addEventListener('click', () => {
      friendsBtnFunc(friendsBtn, everyoneBtn, userContainer)
    });

    everyoneBtn.addEventListener('click', async () => {
      everyoneBtnFunc(friendsBtn, everyoneBtn, userContainer)
    })

  } catch (error) {
    console.error('Error fetching home.html:', error);
  }
}

function initPage() {
  var userContainer = document.getElementById('userDisplayEveryone')
  displayUser(userContainer)
}

function toggleLeftColumn() {
  const rightColumn = document.getElementById('right-column')
  const leftColumn = document.getElementById('left-column')
  leftColumn.classList.toggle('d-none');
  rightColumn.classList.toggle('col-md-10')
  rightColumn.classList.toggle('col-md-12')
}

function everyoneBtnFunc(friendsBtn, everyoneBtn, userContainer) {
  if (friendsBtn.classList.contains('active')) {
    friendsBtn.classList.remove('active')
  }
  if (!everyoneBtn.classList.contains('active')) {
    everyoneBtn.classList.add('active')
  }
  displayUser(userContainer)
}

function friendsBtnFunc(friendsBtn, everyoneBtn, userContainer) {
  if (everyoneBtn.classList.contains('active')) {
    everyoneBtn.classList.remove('active')
  }

  if (!friendsBtn.classList.contains('active')) {
    friendsBtn.classList.add('active')
  }
  userContainer.innerHTML = ''
}

// async function testShowGame(gameModal) {
//     gameModal.setTitle('Game')
//     gameModal.openModal();
//     gameModal.launchWorld()
// }




