
import { fetchUser, fetchFriendChange } from '../../api/fetchData.js';
import { otherMatchHistoryComponent } from '../../components/otherMatchHistory/otherMatchHistory.js';
import { handleFriendAction } from './utils.js';

// TO DO: ERROR HANDLING
export async function displayOtherUserProfile(event) {

    let ancestor = event.currentTarget;
    while (ancestor && !ancestor.hasAttribute('data-userid-flag')) {
        ancestor = ancestor.parentNode;
    }
    if (!ancestor || !ancestor.dataset.id) {
        console.error('User ID not found');
        return;
    }
    const userID = ancestor.dataset.id;

    const modalElement = document.getElementById('otherUserInfo')
    const otherUserModal = bootstrap.Modal.getInstance(modalElement);
    if (!otherUserModal) {
        console.error('Other user modal instance not found')
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

async function updateOtherModal(currentUserInfo) {
    updateWinrateAndClass(currentUserInfo)

    const response = await fetchFriendChange('GET', { id: currentUserInfo.id });
    if (!response || response.status !== 200) return;

    const friendState = await response.json();
    updateOtherFriendButton(friendState.state)
}

function displayInfo(currentUserInfo) {
    displayBasicInfo(currentUserInfo)
    displayOtherMatchHistory(currentUserInfo)
}

// TO DO: ERROR HANDLING FOR RESPONSE
export async function updateOtherFriendButton(state) {
    const addFriendBtn = document.getElementById('addFriendBtn');
    const deleteFriendBtn = document.getElementById('deleteFriendBtn');

    addFriendBtn.removeEventListener('click', updateProfileAction);
    deleteFriendBtn.removeEventListener('click', updateProfileAction);

    addFriendBtn.addEventListener('click', updateProfileAction);
    deleteFriendBtn.addEventListener('click', updateProfileAction);

    function updateButtons(addText, addAction, deleteText, deleteAction, showAdd, showDelete) {
        addFriendBtn.textContent = addText;
        addFriendBtn.dataset.action = addAction;
        addFriendBtn.classList.toggle('d-none', !showAdd);
        deleteFriendBtn.textContent = deleteText;
        deleteFriendBtn.dataset.action = deleteAction;
        deleteFriendBtn.classList.toggle('d-none', !showDelete);
    }

    switch (state) {
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
        default:
            console.error('Unknown friend state:', state);
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
    modalContent.dataset.id = currentUserInfo.id
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

function updateProfileAction(event) {
    function getOtherUserID() {
        const otherUserModal = document.getElementById('otherUserInfo');
        const otherUserContentElement = otherUserModal.querySelector('.modal-content');
        return otherUserContentElement.dataset.id;
    }
    const otherUserID = getOtherUserID();
    if (!otherUserID) {
        console.error('Other user ID not found');
        return;
    }

    const button = event.target.dataset;
    const action = button.action;

    const actionObj = {
        'action': action,
        'id': otherUserID,
        'modal': 'otherProfile',
    }
    handleFriendAction(actionObj)
}

let timer;
export function updateStatusMsg(assemble, status) {
    const msgElement = document.getElementById('responseFriendQuery');
    if (status >= 400) {
        msgElement.classList.add('text-danger');
        msgElement.classList.remove('text-success');
    } else {
        msgElement.classList.add('text-success');
        msgElement.classList.remove('text-danger');
    }
    msgElement.textContent = assemble.message;

    clearTimeout(timer);
    timer = setTimeout(() => {
        msgElement.textContent = '';
    }, 5000);
}