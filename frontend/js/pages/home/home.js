import { fetchUser, fetchMe, loadHTMLPage } from '../../api/fetchData.js';
import { assembleUser } from '../../api/assembler.js';
import { displayUserCard } from '../../components/userCard/userCard.js';
import { matchHistoryComponent } from '../../components/matchHistory/matchHistory.js';
import { displayUser } from './leftColumn.js';
////////
// [TO DO]
// - Ne pas pouvoir avoir 2 connections en même temps sur le même compte
// - Friend Column 
// - Settings Modal [+ système pour changer password, email, nickname, avatar, 2FA]
// - 2FA
// - Trouver facon update en temps reel (socket ?)
////////

export async function showHome() {
    try {
        console.log("SHOW HOME !")
        await loadHTMLPage('./js/pages/home/home.html');
        initPage();

        const friendsBtn = document.getElementById('friendsBtn');
        const everyoneBtn = document.getElementById('everyoneBtn');

        // document.getElementById('middleBtnRight').addEventListener('click', () => {
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



async function displayFriend() {
    const allFriends = await fetchUser('GET', { status: ['OFF'] });
    if (!allFriends || !allFriends.ok)
        // if !allFriends, c'est que le status == 401 et si !allFriends.ok == Aucun Ami
        return;
    await displayUser(allFriends);
}


async function displayEveryone() {
    // Filtrer le user lui même dans le backend pour ne pas qu'il puisse se voir ?
    const onlineUsers = await fetchUser('GET', { status: ['ONL', 'ING'] });
    if (!onlineUsers || !onlineUsers.ok)
        // if !onlineUsers, c'est que le status == 401 et si !onlineUsers.ok == Aucun user Online
        return;
    await displayUser(onlineUsers);
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

async function initPage() {
    const user = await fetchMe('GET');
    if (!user) {
        console.log('Error fetching users');
        return;
    }
    const userAssembled = await assembleUser(user);
    displayUserCard(userAssembled);
    displayEveryone();
    displayMatchHistory(userAssembled);
    // displayUserProfile() // Future component qui est actuellement dans home.html
    // diplayLeaderBoard() // not done
}

///////////////////////////////
//  Event Listener function  //
///////////////////////////////

function everyoneBtnFunc(friendsBtn, everyoneBtn) {
    if (friendsBtn.classList.contains('active')) {
        friendsBtn.classList.remove('active');
    }
    if (!everyoneBtn.classList.contains('active')) {
        everyoneBtn.classList.add('active');
    }
    displayEveryone();
}

function friendsBtnFunc(friendsBtn, everyoneBtn) {
    if (everyoneBtn.classList.contains('active')) {
        everyoneBtn.classList.remove('active');
    }

    if (!friendsBtn.classList.contains('active')) {
        friendsBtn.classList.add('active');
    }
    displayFriend()
}
