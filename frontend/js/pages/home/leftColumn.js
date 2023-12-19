import { userTemplateComponent } from '../../components/userTemplate/userTemplate.js';
import { assembler } from '../../api/assembler.js';
import { fetchUser } from '../../api/fetchData.js';
import { otherMatchHistoryComponent } from '../../components/otherMatchHistory/otherMatchHistory.js';
import { fetchFriendChange } from '../../api/fetchData.js';
import { userRequestCardComponent } from '../../components/userRequestCard/userRequestCard.js';

export async function displayUser(allUsers) {
    let userContainer = document.getElementById('userDisplay');
    userContainer.innerHTML = '';
    let currentUser;
    const objectAllUsers = await assembler(allUsers);
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

// TO DO: ERROR HANDLING
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

    const response = await fetchUser('GET', { id: userID })
    if (!response) { return }
    if (response.status != 200) // User not found
        return

    const userInfo = await response.json()
    const currentUserInfo = userInfo.users[0]
    updateOtherModal(currentUserInfo)
    displayInfo(currentUserInfo)

    otherUserModal.show()
}

function updateOtherModal(currentUserInfo) {
    updateWinrateAndClass(currentUserInfo)
    updateFriendButton(currentUserInfo)
}

function displayInfo(currentUserInfo) {
    displayBasicInfo(currentUserInfo)
    displayOtherMatchHistory(currentUserInfo)
}

// TO DO: ERROR HANDLING FOR RESPONSE
async function updateFriendButton(currentUserInfo) {
    const response = await fetchFriendChange('GET', { id: currentUserInfo.id });
    if (!response || response.status !== 200) return;

    const friendState = await response.json();
    const addFriendBtn = document.getElementById('addFriendBtn');
    const deleteFriendBtn = document.getElementById('deleteFriendBtn');

    function updateButtons(addText, addAction, deleteText, deleteAction, showAdd, showDelete) {
        addFriendBtn.textContent = addText;
        addFriendBtn.dataset.action = addAction;
        addFriendBtn.classList.toggle('d-none', !showAdd);
        deleteFriendBtn.textContent = deleteText;
        deleteFriendBtn.dataset.action = deleteAction;
        deleteFriendBtn.classList.toggle('d-none', !showDelete);
    }

    switch (friendState.state) {
        case 'none':
            updateButtons('Add Friend', 'add', '', '', true, false);
            break;
        case 'friend':
            updateButtons('', '', 'Unfriend', 'unfriend', false, true);
            break;
        case 'receivedRequest':
            updateButtons('Accept', 'accept', 'Refuse', 'refuse', true, true);
            break;
        case 'sentRequest':
            updateButtons('', '', 'Cancel Request', 'cancel', false, true);
            break;
    }
}

function updateWinrateAndClass(currentUserInfo) {
    const modalDialog = document.getElementById('otherUserInfoDialog')
    const modalContent = modalDialog.querySelector('.modal-content')
    const ratio = document.getElementById('winrate')
    if (currentUserInfo.played_matches.length > 0) {
        modalDialog.classList.add('modal-lg')
        ratio.classList.remove('d-none')
        document.getElementById('otherMatchHistory').classList.remove('d-none')
    } else {
        modalDialog.classList.remove('modal-lg')
        ratio.classList.add('d-none')
        document.getElementById('otherMatchHistory').classList.add('d-none')
    }
    modalContent.id = currentUserInfo.id
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


export async function updateSocial() {

    const userRequestTemplate = await userRequestCardComponent();
    if (!userRequestTemplate) { return }
    
    const response = await fetchFriendChange('GET', {}, 'get/');
    if (!response) { return }
    const data = await assembler(response)
    const allPendingRequests = data.friend_requests;
    console.log(allPendingRequests)
    updateSocialSent(userRequestTemplate, allPendingRequests);
    // updateSocialInvite(clonedNode);
    // updateSocialReceived(clonedNode);

    updateSocialBadge();
}

async function updateSocialSent(userRequestTemplate, allPendingRequests) {
    const sentRequestContainer = document.getElementById('sentRequest');   
    sentRequestContainer.innerHTML = '';

    allPendingRequests.forEach(request => {
        if (request.role === 'receiver') {
            const requestNode = userRequestTemplate.cloneNode(true);

            const img = requestNode.querySelector('#userRequestCardImg');
            img.src = request.avatar || '';
            img.alt = request.nickname + "'s avatar";
            img.id = '';

            const nickname = requestNode.querySelector('#userRequestCardNickname');
            nickname.textContent = request.nickname;
            nickname.id = '';

            const button1 = requestNode.querySelector('#button1');
            const button2 = requestNode.querySelector('#button2');

            if (button1) {
                button1.remove();
            }

            button2.textContent = 'Cancel Request';
            button2.dataset.id = request.id;
            button2.id = '';

            sentRequestContainer.appendChild(requestNode);
        }
    });
}

function updateSocialBadge() {
    const socialBadge = document.getElementById('socialBadge');
}