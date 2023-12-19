import { fetchUser, fetchFriend, fetchMe, loadHTMLPage, fetchFriendChange } from '../../api/fetchData.js';
import { assembler } from '../../api/assembler.js';
import { displayUserCard } from '../../components/userCard/userCard.js';
import { displayMatchHistory } from '../../components/matchHistory/matchHistory.js';
import { displayUser, updateFriendRequest } from './leftColumn.js';
import { World } from '../game/src/World.js';
import { loadFonts } from '../game/src/systems/Fonts.js';
import { loadModel } from '../game/src/systems/Loader.js';
import interactiveSocket from './socket.js';
////////
// [TO DO]
// - Gérer demande ami
// - Faire tout fonctionner avec socket interactif
// - Gérer les status (off when socket close, on when socket open, ing when in game)
// - Ne pas pouvoir avoir 2 connections en même temps sur le même compte
////////
// To update w socket when friend update (unfriend, cancel,  accepted, refused):
// Friends column
// Other user modal
//
let otherUserModal;
export async function showHome() {
    try {
        await loadHTMLPage('./js/pages/home/home.html');
        initPage();
        otherUserModal = new bootstrap.Modal(document.getElementById('otherUserInfo'))

        const friendsBtn = document.getElementById('friendsBtn');
        const everyoneBtn = document.getElementById('everyoneBtn');

        friendsBtn.addEventListener('click', () => {
            friendsBtnFunc(friendsBtn, everyoneBtn);
        });
        everyoneBtn.addEventListener('click', () => {
            everyoneBtnFunc(friendsBtn, everyoneBtn);
        });

        document.getElementById('addFriendBtn').addEventListener('click', handleFriendAction);
        document.getElementById('deleteFriendBtn').addEventListener('click', handleFriendAction);
        responsiveLeftColumn()
    } catch (error) {
        console.error('Error fetching home.html:', error);
    }
}

/////////////////////////
// Init Page function  //
/////////////////////////

async function displayFriend() {
    const allFriends = await fetchFriend('GET');
    if (!allFriends || !allFriends.ok)
        // if !allFriends, c'est que le status == 401 et si !allFriends.ok == Aucun Ami
        return;
    await displayUser(allFriends);
}

export async function displayEveryone() {
    const onlineUsers = await fetchUser('GET', { status: ['ONL', 'ING'] });
    if (!onlineUsers || !onlineUsers.ok)
        // if !onlineUsers, c'est que le status == 401 et si !onlineUsers.ok == Aucun user Online
        return;

    await displayUser(onlineUsers);
}

async function initPage() {
    const user = await fetchMe('GET');
    if (!user) {
        console.log('Error fetching users');
        return;
    }
    interactiveSocket.initSocket()
    const userAssembled = await assembler(user);
    if (!userAssembled || typeof userAssembled !== 'object') {
        console.log('Error assembling user');
        return;
    }
    displayUserCard(userAssembled);
    displayMatchHistory(userAssembled);
    displayEveryone();
    updateFriendRequest()

}

///////////////////////////////
//  Event Listener function  //
///////////////////////////////


function everyoneBtnFunc(friendsBtn, everyoneBtn) {
    if (friendsBtn.classList.contains('active-dark')) {
        friendsBtn.classList.remove('active-dark');
        everyoneBtn.classList.add('active-dark');
        displayEveryone();
    }
}

function friendsBtnFunc(friendsBtn, everyoneBtn) {
    if (everyoneBtn.classList.contains('active-dark')) {
        everyoneBtn.classList.remove('active-dark');
        friendsBtn.classList.add('active-dark');
        displayFriend()
    }
}

async function handleFriendAction(event) {
    const actionToMethod = {
        'add': 'POST',
        'cancel': 'DELETE',
        'accept': 'POST',
        'refuse': 'DELETE',
        'unfriend': 'DELETE',
    };

    const button = event.target.dataset;
    const action = button.action;

    if (!action || !actionToMethod.hasOwnProperty(action)) {
        console.error('Unknown action:', action);
        return;
    }

    const otherUserID = getOtherUserID();
    if (!otherUserID) {
        console.error('Other user ID not found');
        return;
    }

    const apiParam = { id: otherUserID, action: action };
    const method = actionToMethod[action];
    const response = await fetchFriendChange(method, apiParam);
    if (!response) {
        return;
    }
    const assemble = await assembler(response);
    console.log(assemble);
}

function getOtherUserID() {
    const otherUserModal = document.getElementById('otherUserInfo');
    const otherUserContentElement = otherUserModal.querySelector('.modal-content');
    return otherUserContentElement.id;
}
/////

function responsiveLeftColumn() {
    const userCol = document.getElementById('left-column');
    const gameCol = document.getElementById('right-column');
    const buttonToggle = document.getElementById('userBtn');
    const iconStyle = document.getElementById('icon');
    buttonToggle.addEventListener('click', () => {
        if (iconStyle.classList.contains('fa-user')) {
            iconStyle.classList.add('fa-gamepad');
            iconStyle.classList.remove('fa-user');
        } else {
            iconStyle.classList.remove('fa-gamepad');
            iconStyle.classList.add('fa-user');
        }
        userCol.classList.toggle('show');
        gameCol.classList.toggle('hide');
    });
}