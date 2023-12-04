import { fetchUser, fetchMe, loadHTMLPage } from '../../api/fetchData.js';
import { World } from '../game/src/World.js';
import GameModal from './gameModal.js';
import { userTemplateComponent } from '../../components/userTemplate/userTemplate.js';
import { assembleUser } from '../../api/assembler.js';
import {
    userCardComponent,
    userCardListener,
} from '../../components/userCard/userCard.js';
import { matchHistoryComponent } from '../../components/matchHistory/matchHistory.js';

////////
// [TO DO]
// - Rediriger vers login quand 401
// - Ne pas pouvoir se connecter a 2 comptes en meme temps (sessionStorage.clear() ?)
// - Bouton logout [Delete cookie quand logout ?]
// - Rediriger vers home quand login
// - Rediriger vers home quand signup
// - Trouver facon update en temps reel
//
////////

export async function showHome() {
    try {
        await loadHTMLPage('./js/pages/home/home.html');
        // var playModalClass = initModal()
        initPage();

        const friendsBtn = document.getElementById('friendsBtn');
        const everyoneBtn = document.getElementById('everyoneBtn');

        // document.getElementById('middleBtnRight').addEventListener('click', () => {
        //   gameChoice(playModalClass)
        // })

        friendsBtn.addEventListener('click', () => {
            friendsBtnFunc(friendsBtn, everyoneBtn);
        });

        everyoneBtn.addEventListener('click', async () => {
            everyoneBtnFunc(friendsBtn, everyoneBtn);
        });
        // window.addEventListener('resize', () => {
        //     const rightPartCol = document.getElementById('rightPart');
        //     const matchHistoryContainer = document.getElementById('userCol');
        //     console.log(rightPartCol);
        //     if (window.innerWidth < 400) {
        //         rightPartCol.classList.remove('row');
        //         matchHistoryContainer.classList.add('hide');
        //     } else {
        //         rightPartCol.classList.add('row');
        //         matchHistoryContainer.classList.remove('hide');
        //     }
        // });
    } catch (error) {
        console.error('Error fetching home.html:', error);
    }
}

/////////////////////////
// Init Page function  //
/////////////////////////

async function displayOnlineUser(userContainer) {
    // Filtrer le user lui même dans le backend pour ne pas qu'il puisse se voir ?
    const allUsers = await fetchUser('GET', { status: ['ONL', 'ING'] });
    if (!allUsers || !allUsers.ok)
        // if !allUsers, c'est que le status == 401 et si !AllUsers.ok == Aucun user Online
        return;

    const objectAllUsers = await assembleUser(allUsers);
    const templateUser = await userTemplateComponent();

    if (objectAllUsers) {
        objectAllUsers.forEach((user) => {
            userContainer.appendChild(document.createElement('hr'));

            const clonedUserTemplate = templateUser.cloneNode(true);

            const avatarElement =
                clonedUserTemplate.querySelector('#user-avatar');
            const nameElement = clonedUserTemplate.querySelector('#user-name');
            const statusElement =
                clonedUserTemplate.querySelector('#user-status');
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
}

async function displayUserLeftColumn() {
    let userContainer = document.getElementById('userDisplayEveryone');
    userContainer.innerHTML = '';

    await displayOnlineUser(userContainer);
}

async function displayUserCard(meUser) {
    let userContainer = document.getElementById('own-user-card');

    let userCard = await userCardComponent();
    userContainer.appendChild(userCard);
    userCardListener(); // enable js on the userCard
    updateUserCard(meUser);
}

async function displayMatchHistory(userStatJson) {
    let matchHistoryContainer = document.getElementById('matchHistory');
    let matchHistory = await matchHistoryComponent();
    matchHistoryContainer.appendChild(matchHistory);

    let matchHistoryWinner = document.getElementById('winnerUsername');
    let matchHistoryLoser = document.getElementById('loserUsername');
    let matchHistoryWinScore = document.getElementById('winnerScore');
    let matchHistoryLoseScore = document.getElementById('loserScore');

    userStatJson.played_matches.forEach((game) => {
        const listElement = document.createElement('li');
        listElement.classList.add('list-group-item');
        listElement.classList.add('border-0');
        listElement.innerHTML = game.winner_username;
        matchHistoryWinner.appendChild(listElement);
    });
    userStatJson.played_matches.forEach((game) => {
        const listElement = document.createElement('li');
        listElement.classList.add('list-group-item');
        listElement.classList.add('border-0');
        listElement.innerHTML = game.winner_score;
        matchHistoryWinScore.appendChild(listElement);
    });
    userStatJson.played_matches.forEach((game) => {
        const listElement = document.createElement('li');
        listElement.classList.add('list-group-item');
        listElement.classList.add('border-0');
        listElement.innerHTML = game.loser_username;
        matchHistoryLoser.appendChild(listElement);
    });
    userStatJson.played_matches.forEach((game) => {
        const listElement = document.createElement('li');
        listElement.classList.add('list-group-item');
        listElement.classList.add('border-0');
        listElement.innerHTML = game.loser_score;
        matchHistoryLoseScore.appendChild(listElement);
    });
}

function updateUserCard(userObject) {
    const profilePicture = document.getElementById('avatar-img');
    profilePicture.src = userObject.avatar;

    const nicknameElement = document.getElementById('nickname');
    nicknameElement.querySelector('h5').innerText = userObject.nickname;

    const winsElement = document.getElementById('wins');
    const lossesElement = document.getElementById('losses');
    const gamesPlayedElement = document.getElementById('game-played');

    winsElement.innerText = userObject.won_matches.length;
    lossesElement.innerText = userObject.lost_matches.length;
    gamesPlayedElement.innerText = userObject.played_matches.length;

    // const wonMatchesList = document.getElementById('won-matches-list');
    // wonMatchesList.innerHTML = '';

    // userObject.won_matches.forEach((match) => {
    //   const matchItem = document.createElement('li');
    //   matchItem.innerText = `Winner Score: ${match.winner_score}, Loser Score: ${match.loser_score}, Date: ${match.date_of_match}`;
    //   wonMatchesList.appendChild(matchItem);
    // });
}

function initModal() {
    var playModalId = document.getElementById('playModal');
    var playModalClass = new bootstrap.Modal(playModalId, {
        backdrop: 'static', // Set to 'static' for a static backdrop
        keyboard: false, // Set to false to disable keyboard events
    });

    return playModalClass;
}

async function initPage() {
    const user = await fetchMe('GET');
    if (!user) {
        console.log('Error fetching users');
        return;
    }
    const userAssembled = await assembleUser(user);
    displayUserCard(userAssembled);
    displayUserLeftColumn();
    displayMatchHistory(userAssembled);
    // displayUserProfile() // Future component qui est actuellement dans home.html
    // diplayLeaderBoard() // not done
}

///////////////////////////////
//  Event Listener function  //
///////////////////////////////

function gameChoice(playModalClass) {
    // Get the modal by its ID

    playModalClass.show();
    // Open the modal programmatically
    // playModal.classList.add("show");
    // playModal.style.display = "block";
    // document.body.classList.add("modal-open");
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
