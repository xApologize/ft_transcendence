import { fetchUser, loadHTMLPage } from '../../api/fetchData.js';
import { World } from '../game/src/World.js';
import GameModal from './gameModal.js';
import { userTemplateComponent } from '../../components/userTemplate/userTemplate.js'
import { assembleUser } from '../../api/assembler.js';

// Gérer BACK quand model open.
// CHAQUE fois que la page s'ouvre, se login pour qu'il y ai au moins un push history ?

export async function showHome() {
  try {
    await loadHTMLPage('./js/pages/home/home.html')
    var playModalClass = initModal()
    initPage()

    const friendsBtn = document.getElementById('friendsBtn')
    const everyoneBtn = document.getElementById('everyoneBtn')

    document.getElementById('middleBtnRight').addEventListener('click', () => {
      gameChoice(playModalClass)
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

async function displayOnlineUser(userContainer) {
  const allUsers = await fetchUser("GET", {'status':'ONL'});
  if (!allUsers.ok)
    return ; // Display a msg that no one is online?
  const objectAllUsers = await assembleUser(allUsers)
  const templateUser = await userTemplateComponent();

  if (objectAllUsers) {
    objectAllUsers.forEach(user => {
      console.log(user)
      userContainer.appendChild(document.createElement('hr'));

      const clonedUserTemplate = templateUser.cloneNode(true);

      const avatarElement = clonedUserTemplate.querySelector('#user-avatar');
      const nameElement = clonedUserTemplate.querySelector('#user-name');
      const statusElement = clonedUserTemplate.querySelector('#user-status');

      avatarElement.src = user.avatar;
      nameElement.textContent = user.nickname;
      statusElement.textContent = user.status;

      userContainer.appendChild(clonedUserTemplate);
    });
  }
}

async function displayUserLeftColumn() {
  let userContainer = document.getElementById('userDisplayEveryone');
  userContainer.innerHTML = '';

  await displayOnlineUser(userContainer)
}

function initModal() {
  var playModalId = document.getElementById("playModal");
  var playModalClass = new bootstrap.Modal(playModalId, {
    backdrop: 'static',  // Set to 'static' for a static backdrop
    keyboard: false       // Set to false to disable keyboard events
  });

  return playModalClass
}


function initPage() {
  displayUserLeftColumn()
  // displayUserProfile() // Future component qui est actuellement dans home.html
  // diplayLeaderBoard() // not done
}

///////////////////////////////
//  Event Listener function  //
///////////////////////////////

function gameChoice(playModalClass) {
    // Get the modal by its ID

    playModalClass.show()
    // Open the modal programmatically
    // playModal.classList.add("show");
    // playModal.style.display = "block";
    // document.body.classList.add("modal-open");
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





