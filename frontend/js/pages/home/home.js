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
import { navigateTo } from '../../router.js';
import { displayToast } from './toastNotif.js';
import { newUser } from './utils.js';
////////
// Quand user Update son profil (avatar/nickname) -> Socket call function: not done (update only 1 user)
export async function showHome() {
    try {
        await loadHTMLPage('./js/pages/home/home.html');
        // await initPage()
        const result = await initPage()
        if (result === false) {
            console.error("Error loading home page")
            navigateTo('/')
            return;
        }

        // document.getElementById('displayNotification').addEventListener('click', displayToast);
        new bootstrap.Modal(document.getElementById('otherUserInfo'));
        new bootstrap.Modal(document.getElementById('inviteGameModal'));

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
        const gameContainer = document.querySelector('#sceneContainer')
        if (!gameContainer) {
            console.error('No game container, please refresh page.');
            return
        }
        const world = new World(gameContainer);

        const findGameBtn = document.getElementById('findGame');
        findGameBtn.addEventListener('click', () => {
            document.getElementById('toastContainer').classList.add('d-none')
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

export async function displayFriend() {
    const allFriends = await fetchFriend('GET');
    if (!allFriends || !allFriends.ok) {
        // if !allFriends, c'est que le status == 401 et si !allFriends.ok == Aucun Ami
        return false;
    }
    console.log("DISPLAY FRIEND")
    const container = document.getElementById('friendDisplay')
    await displayUser(allFriends, container);
}

export async function displayEveryone() {
    const onlineUsers = await fetchUser('GET', { status: ['ONL', 'ING'] });
    if (!onlineUsers || !onlineUsers.ok) {
        // if !onlineUsers, c'est que le status == 401 et si !onlineUsers.ok == Aucun user Online
        return false;
    }
    const container = document.getElementById('userDisplay')
    await displayUser(onlineUsers, container);
}

async function initPage() {
    const user = await fetchMe('GET');
    if (!user)
        return;
    const userAssembled = await assembler(user);
    if (!userAssembled || typeof userAssembled !== 'object') {
        console.log('Error assembling user');
        return false;
    }
    displayUserCard(userAssembled);
    displayMatchHistory(userAssembled);
    interactiveSocket.initSocket()
    //displayEveryone();
    displayFriend();
    updateSocial();
}

///////////////////////////////
//  Event Listener function  //
///////////////////////////////

function everyoneBtnFunc(friendsBtn, everyoneBtn) {
    if (friendsBtn.classList.contains('active-dark')) {
        document.getElementById('userDisplay').classList.remove('d-none');
        document.getElementById('friendDisplay').classList.add('d-none');

        friendsBtn.classList.remove('active-dark');
        everyoneBtn.classList.add('active-dark');
        // displayEveryone();
    }
}

function friendsBtnFunc(friendsBtn, everyoneBtn) {
    if (everyoneBtn.classList.contains('active-dark')) {
        document.getElementById('friendDisplay').classList.remove('d-none');
        document.getElementById('userDisplay').classList.add('d-none');

        everyoneBtn.classList.remove('active-dark');
        friendsBtn.classList.add('active-dark');
        // displayFriend();
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
// 

// async function displayToast() {
//     console.log('display TOoast !')
//     const toastNotif = await toastComponent();
//     document.getElementById('toastContainer').append(toastNotif);
//     var toast = new bootstrap.Toast(toastNotif);
//     toastNotif.addEventListener('shown.bs.toast', () => {
//         const startTime = Date.now();
//         const timeSinceToastElement = toastNotif.querySelector('#timeSinceToast');

//         // Update the time every second
//         const intervalId = setInterval(() => {
//             const secondsPassed = Math.floor((Date.now() - startTime) / 1000);
//             timeSinceToastElement.textContent = `${secondsPassed} seconds ago`;
//         }, 1000);

//         // When the toast is hidden, clear the interval
//         toastNotif.addEventListener('hidden.bs.toast', () => {
//             console.log("hide toast")
//             toastNotif.remove();
//         });
//     });
//     toast.show();
// }

