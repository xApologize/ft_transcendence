import { fetchUser, fetchFriend,fetchMe, loadHTMLPage } from '../../api/fetchData.js';
import { assembleUser } from '../../api/assembler.js';
import { displayUserCard } from '../../components/userCard/userCard.js';
import { displayMatchHistory } from '../../components/matchHistory/matchHistory.js';
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
        // everyoneBtn.classList.add('active');


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
    const allFriends = await fetchFriend('GET');
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
