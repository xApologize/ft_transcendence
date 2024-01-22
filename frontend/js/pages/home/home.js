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
import { loadAll } from '../game/src/systems/Loader.js';
import interactiveSocket from './socket.js';
import { closeInviteRequest } from './inviteGame.js';
import { initGameMenu } from './gameMenu.js';
import { checkModal } from '../../router.js';
import { redirectToHome } from '../../api/fetchData.js';

export async function showHome() {
    try {
        await loadHTMLPage('./js/pages/home/home.html');
        checkModal();
        const loadingModal = new bootstrap.Modal(
            document.getElementById('loadingModal')
        );
        loadingModal.show();
        setupHomeModal();
        setUpTooltip();


        const result = await initPage();
        if (result === false) {
            console.error('Error with user. Redirecting to home.');
            return redirectToHome();
        }

        leftColumnListener();
        listenerTeamDisplay();
        await loadGame();
        loadingModal.hide();
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
        return;
    }
    const container = document.getElementById('friendDisplay');
    await displayUser(allFriends, container);
}

export async function displayEveryone() {
    const onlineUsers = await fetchUser('GET', { status: ['ONL', 'ING'] });
    if (!onlineUsers || !onlineUsers.ok) {
        return;
    }
    const container = document.getElementById('userDisplay');
    await displayUser(onlineUsers, container);
}

async function initPage() {
    const user = await fetchMe('GET');
    if (!user) return false;
    const userAssembled = await assembler(user);
    if (!userAssembled || typeof userAssembled !== 'object') return false;
    displayUserCard(userAssembled);
    displayMatchHistory(userAssembled);
    interactiveSocket.initSocket(); // <- this is calling displayEveryone.
    displayFriend();
    updateSocial();

    responsiveLeftColumn();
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
    }
}

function friendsBtnFunc(friendsBtn, everyoneBtn) {
    if (everyoneBtn.classList.contains('active-dark')) {
        document.getElementById('friendDisplay').classList.remove('d-none');
        document.getElementById('userDisplay').classList.add('d-none');

        everyoneBtn.classList.remove('active-dark');
        friendsBtn.classList.add('active-dark');
    }
}

function leftColumnListener() {
    const friendsBtn = document.getElementById('friendsBtn');
    const everyoneBtn = document.getElementById('everyoneBtn');
    friendsBtn.addEventListener('click', () => {
        friendsBtnFunc(friendsBtn, everyoneBtn);
    });
    everyoneBtn.addEventListener('click', () => {
        everyoneBtnFunc(friendsBtn, everyoneBtn);
    });
}

function setupHomeModal() {
    // Game Menu Modal
    new bootstrap.Modal(document.getElementById('gameMenuModal'));
    new bootstrap.Modal(document.getElementById('lobbyTournamentModal'));
    new bootstrap.Modal(document.getElementById('joinTournamentModal'));
    new bootstrap.Modal(document.getElementById('tournamentInfoModal'));

    // Invite + other user modal
    new bootstrap.Modal(document.getElementById('otherUserInfo'));
    new bootstrap.Modal(document.getElementById('inviteGameModal'));

    document
        .getElementById('otherUserInfo')
        .addEventListener('hide.bs.modal', () => {
            document.getElementById('responseFriendQuery').textContent = '';
        });

    document
        .getElementById('inviteGameModal')
        .addEventListener('hide.bs.modal', closeInviteRequest);
}

function setUpTooltip() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
}

//////////

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

async function loadGame() {
    await loadAll();
    const gameContainer = document.querySelector('#sceneContainer');
    if (!gameContainer) {
        return;
    }
    const world = new World(gameContainer);
    initGameMenu(world);
}

function listenerTeamDisplay() {
    daveBox();
    jacobBox();
    florianBox();
    jeanbenoitBox();
}

function daveBox() {
    const box = document.getElementById('ddemers-box');
    document.getElementById('ddemers').addEventListener('mouseover', () => {
        hideOtherBox();
        box.classList.remove('hide');
        box.addEventListener('mouseleave', () => {
            box.classList.add('hide');
        });
    });
}

function jacobBox() {
    const box = document.getElementById('jalevesq-box');
    document.getElementById('jalevesq').addEventListener('mouseover', () => {
        hideOtherBox();
        box.classList.remove('hide');
        box.addEventListener('mouseleave', () => {
            box.classList.add('hide');
        });
    });
}

function florianBox() {
    const box = document.getElementById('fgeslin-box');
    document.getElementById('fgeslin').addEventListener('mouseover', () => {
        hideOtherBox();
        box.classList.remove('hide');
        box.addEventListener('mouseleave', () => {
            box.classList.add('hide');
        });
    });
}

function jeanbenoitBox() {
    const box = document.getElementById('jrossign-box');
    document.getElementById('jrossign').addEventListener('mouseover', () => {
        hideOtherBox();
        box.classList.remove('hide');
        box.addEventListener('mouseleave', () => {
            box.classList.add('hide');
        });
    });
}

function hideOtherBox() {
    const boxes = document.getElementsByClassName('about-box');
    Array.prototype.forEach.call(boxes, function (box) {
        if (!box.classList.contains('hide')) {
            box.classList.add('hide');
        }
    });
}
