import { fetchUser, loadHTMLPage } from '../../api/fetchData.js';
import { World } from '../game/src/World.js';
import GameModal from './gameModal.js';
import { userTemplateComponent } from '../../components/userTemplate/userTemplate.js';
import { assembleUser } from '../../api/assembler.js';

//////////
//TO DO
//set page to hidden when the screen size is smaller than 320 px
//////////

// Faire une fonction dans le backend pour get tout les online user, pour le everyone
export async function showHome() {
    try {
        await loadHTMLPage('./js/pages/home/home.html');
        // Load online user in everyone at the start.
        initPage();

        const friendsBtn = document.getElementById('friendsBtn');
        const everyoneBtn = document.getElementById('everyoneBtn');

        friendsBtn.addEventListener('click', () => {
            friendsBtnFunc(friendsBtn, everyoneBtn);
        });

        everyoneBtn.addEventListener('click', async () => {
            everyoneBtnFunc(friendsBtn, everyoneBtn);
        });
    } catch (error) {
        console.error('Error fetching home.html:', error);
    }
}

/////////////////////////
// Init Page function  //
/////////////////////////

async function displayOnlineUser(userContainer) {
    const allUsers = await fetchUser('GET', { status: 'ONL' });
    const objectAllUsers = await assembleUser(allUsers);
    const templateUser = await userTemplateComponent();

    objectAllUsers.forEach((user) => {
        // console.log(user);
        userContainer.appendChild(document.createElement('hr'));

        const clonedUserTemplate = templateUser.cloneNode(true);

        const avatarElement = clonedUserTemplate.querySelector('#user-avatar');
        const nameElement = clonedUserTemplate.querySelector('#user-name');
        const statusElement = clonedUserTemplate.querySelector('#user-status');
        const statusBadge = clonedUserTemplate.querySelector('#badge');
        statusBadge.style.backgroundColor = setStatus(user.status);
        avatarElement.src = user.avatar;
        nameElement.textContent = user.nickname;
        statusElement.textContent = user.status;

        userContainer.appendChild(clonedUserTemplate);
    });

    function setStatus(user) {
        switch (user) {
            case 'ONL':
                return 'green';
            case 'BUS':
                return 'red';
            case 'ING':
                return 'yellow';
            case 'OFF':
                return 'gray';
        }
    }
}

async function displayUserLeftColumn() {
    let userContainer = document.getElementById('userDisplayEveryone');
    userContainer.innerHTML = '';

    await displayOnlineUser(userContainer);
}

function initPage() {
    displayUserLeftColumn();
    // displayUserProfile() // Future component qui est actuellement dans home.html
    // diplayLeaderBoard() // not done
}

///////////////////////////////
//  Event Listener function  //
///////////////////////////////

function toggleLeftColumn() {
    const rightColumn = document.getElementById('right-column');
    const leftColumn = document.getElementById('left-column');
    const ownUserCard = document.getElementById('own-user-card');

    ownUserCard.classList.toggle('d-none');
    leftColumn.classList.toggle('d-none');
    rightColumn.classList.toggle('col-md-8');
    rightColumn.classList.toggle('col-md-12');
}

function everyoneBtnFunc(friendsBtn, everyoneBtn) {
    if (friendsBtn.classList.contains('active')) {
        friendsBtn.classList.remove('active');
    }
    if (!everyoneBtn.classList.contains('active')) {
        everyoneBtn.classList.add('active');
    }
    displayUserLeftColumn();
}

function friendsBtnFunc(friendsBtn, everyoneBtn) {
    if (everyoneBtn.classList.contains('active')) {
        everyoneBtn.classList.remove('active');
    }

    if (!friendsBtn.classList.contains('active')) {
        friendsBtn.classList.add('active');
    }
    let userContainer = document.getElementById('userDisplayEveryone');
    userContainer.innerHTML = '';
}

// async function testShowGame(gameModal) {
//     gameModal.setTitle('Game')
//     gameModal.openModal();
//     gameModal.launchWorld()
// }
