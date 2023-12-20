import {
    fetchUser,
    fetchFriend,
    fetchMe,
    loadHTMLPage,
} from '../../api/fetchData.js';
import { assembler } from '../../api/assembler.js';
import { displayUserCard } from '../../components/userCard/userCard.js';
import { displayMatchHistory } from '../../components/matchHistory/matchHistory.js';
import { displayUser } from './leftColumn.js';
import { updateSocial } from './social.js';
import { World } from '../game/src/World.js';
import { loadFonts } from '../game/src/systems/Fonts.js';
import { loadModel } from '../game/src/systems/Loader.js';
import interactiveSocket from './socket.js';
////////
// [TO DO]
// - Gérer demande ami
// - Faire tout fonctionner avec socket interactif
////////
// Quand user Update son profil (avatar/nickname) -> Socket call function: not done (update only 1 user)
// Quand trigger un événement relier aux amis -> Socket call function: 
// Other user modal
//
export async function showHome() {
    try {
        await loadHTMLPage('./js/pages/home/home.html');
        initPage();
        new bootstrap.Modal(document.getElementById('otherUserInfo'))

        const friendsBtn = document.getElementById('friendsBtn');
        const everyoneBtn = document.getElementById('everyoneBtn');
        friendsBtn.addEventListener('click', () => {
            friendsBtnFunc(friendsBtn, everyoneBtn);
        });
        everyoneBtn.addEventListener('click', () => {
            everyoneBtnFunc(friendsBtn, everyoneBtn);
        });
        document.getElementById('otherUserInfo').addEventListener('hide.bs.modal', () => {
            document.getElementById('responseFriendQuery').textContent = '';
        });
        responsiveLeftColumn();

        await loadFonts();
        await loadModel();
        const world = new World(document.querySelector('#sceneContainer'));

        const findGameBtn = document.getElementById('findGame');
        findGameBtn.addEventListener('click', () => {
            document.getElementById('ui').classList.add('d-none');
            world.currentGameState = 'lookingForPlayer';
            document.getElementById('lfp').classList.remove('d-none');
            interactiveSocket.sendMessageSocket(
                JSON.stringify({ type: 'Find Match' })
            );
        });

        document
            .getElementById('inviteGameModal')
            .addEventListener('hide.bs.modal', () => {
                console.log('modal game invite closed');
            });
    } catch (error) {
        console.error('Error fetching home.html:', error);
    }
}

/////////////////////////
// Init Page function  //
/////////////////////////

async function displayFriend() {
    const allFriends = await fetchFriend('GET');
    if (!allFriends || !allFriends.ok) {
        // if !allFriends, c'est que le status == 401 et si !allFriends.ok == Aucun Ami
        return;
    }
    await displayUser(allFriends);
}

export async function displayEveryone() {
    const onlineUsers = await fetchUser('GET', { status: ['ONL', 'ING'] });
    if (!onlineUsers || !onlineUsers.ok) {
        // if !onlineUsers, c'est que le status == 401 et si !onlineUsers.ok == Aucun user Online
        return;
    }
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
    updateSocial()

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
        displayFriend();
    }
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
