import { userTemplateComponent } from '../../components/userTemplate/userTemplate.js';
import { assembleUser } from '../../api/assembler.js';
import { fetchUser } from '../../api/fetchData.js';
import { otherMatchHistoryComponent } from '../../components/otherMatchHistory/otherMatchHistory.js';

export async function displayUser(allUsers) {
    let userContainer = document.getElementById('userDisplay');
    userContainer.innerHTML = '';
    let currentUser;
    const objectAllUsers = await assembleUser(allUsers);
    if (typeof objectAllUsers !== 'object' && objectAllUsers !== null) {
        return;
    }
    objectAllUsers.sort((a, b) => {
        // Custom sorting logic: Online users come before Offline users.
        if ((a.status === 'ONL' && b.status !== 'ONL') || (a.status === 'ING' && b.status !== 'ING')) {
            return -1;
        } else if ((a.status !== 'ONL' && b.status === 'ONL') || (a.status !== 'ING' && b.status === 'ING')) {
            return 1;
        } else {
            return 0;
        }
    });

    try {
        currentUser = document.getElementById('nickname').innerText
    } catch {
        currentUser = null
    }
    
    if (!objectAllUsers) { return }
    await loopDisplayUser(objectAllUsers, currentUser, userContainer)
}

async function loopDisplayUser(objectAllUsers, currentUser, userContainer) {
    const templateUser = await userTemplateComponent();
    const currentUserIndex = objectAllUsers.findIndex(user => user.nickname === currentUser);
    if (currentUserIndex !== -1) {
        const currentUserObject = objectAllUsers.splice(currentUserIndex, 1)[0];
        objectAllUsers.unshift(currentUserObject);
    }
    objectAllUsers.forEach((user) => {
        userContainer.appendChild(document.createElement('hr'));

        const clonedUserTemplate = templateUser.cloneNode(true);
        
        const seeProfileBtn = clonedUserTemplate.querySelector('#seeProfileBtn');
        seeProfileBtn.addEventListener('click', displayOtherUserProfile)

        const filledTemplate = fillOtherUserInfo(clonedUserTemplate, user)
        userContainer.appendChild(filledTemplate);

    });
}



function fillOtherUserInfo(clonedUserTemplate, user) {
    const otherUserID = clonedUserTemplate.querySelector('#otherUserID')
    otherUserID.id = user.id

    const avatarElement = clonedUserTemplate.querySelector('#user-avatar');
    const nameElement = clonedUserTemplate.querySelector('#user-name');
    const statusBadge = clonedUserTemplate.querySelector('#badge');
    statusBadge.style.backgroundColor = setStatus(user.status);
    avatarElement.src = user.avatar;
    nameElement.textContent = user.nickname;
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
    return clonedUserTemplate
}

async function displayOtherUserProfile(event) {
    const button = event.currentTarget
    const iconElement = button.querySelector('i');
    const userID = iconElement ? iconElement.id : NULL;

    const modalElement = document.getElementById('otherUserInfo')
    const otherUserModal = bootstrap.Modal.getInstance(modalElement);
    if (!otherUserModal) { 
        console.log("no modal")
        return 
    }

    const response = await fetchUser('GET', {id: userID })
    if (!response) { return }
    if (response.status != 200) // User not found
        return

    const userInfo = await response.json()
    const currentUserInfo = userInfo.users[0]
    updateOtherModal(currentUserInfo)
    displayBasicInfo(currentUserInfo)
    displayOtherMatchHistory(currentUserInfo)    

    otherUserModal.show()
}


function updateOtherModal(currentUserInfo) {
    const dialog = document.getElementById('otherUserInfoDialog')
    const ratio = document.getElementById('winrate')
    if (currentUserInfo.played_matches.length > 0) {
        dialog.classList.add('modal-lg')
        ratio.classList.remove('d-none')
        document.getElementById('otherMatchHistory').classList.remove('d-none')
    } else {
        dialog.classList.remove('modal-lg')
        ratio.classList.add('d-none')
        document.getElementById('otherMatchHistory').classList.add('d-none')
    }
}

function displayBasicInfo(currentUserInfo) {

    const nickname = document.getElementById('userNickname')
    nickname.textContent = currentUserInfo.nickname

    const avatar = document.getElementById('userAvatar')
    avatar.src = currentUserInfo.avatar

    const winCount = document.getElementById('userWins')
    winCount.textContent = currentUserInfo.won_matches.length;

    const lossesCount = document.getElementById('userLosses')
    lossesCount.textContent = currentUserInfo.lost_matches.length;

    const matchesPlayed = document.getElementById('userMatchesPlayed')
    matchesPlayed.textContent = currentUserInfo.played_matches.length;

    const ratio = document.getElementById('userWinrate')
    if (winCount.textContent == 0) {
        ratio.textContent = 0 + "%"
    } else {
        const winCountNumber = parseInt(winCount.textContent, 10);
        const matchesPlayedNumber = parseInt(matchesPlayed.textContent, 10);
        
        const winRatio = (winCountNumber / matchesPlayedNumber) * 100;
        ratio.textContent = winRatio.toFixed(2) + "%";
    }
}

async function displayOtherMatchHistory(currentUserInfo) {
    const matchHistoryContainer = document.getElementById('matchHistoryContainer');
    matchHistoryContainer.innerHTML = '';
    const otherMatchHistoryTemplate = await otherMatchHistoryComponent()
    
    currentUserInfo.played_matches.forEach(match => {
        const matchEntry = otherMatchHistoryTemplate.cloneNode(true);
        
        matchEntry.querySelector('#otherDateOfMatch').textContent = match.date_of_match;
        matchEntry.querySelector('#otherWinnerUsername').textContent = match.winner_username;
        matchEntry.querySelector('#otherWinnerScore').textContent = match.winner_score;
        matchEntry.querySelector('#otherLoserUsername').textContent = match.loser_username;
        matchEntry.querySelector('#otherLoserScore').textContent = match.loser_score;
        
        matchEntry.querySelector('#otherDateOfMatch').id = '';
        matchEntry.querySelector('#otherWinnerUsername').id = '';
        matchEntry.querySelector('#otherWinnerScore').id = '';
        matchEntry.querySelector('#otherLoserUsername').id = '';
        matchEntry.querySelector('#otherLoserScore').id = '';
    
        matchHistoryContainer.appendChild(matchEntry);
    });
}


