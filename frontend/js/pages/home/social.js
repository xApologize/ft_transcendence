import { fetchFriend, fetchFriendChange } from '../../api/fetchData.js';
import { userRequestCardComponent } from '../../components/userRequestCard/userRequestCard.js';
import { assembler } from '../../api/assembler.js';
import { handleFriendAction } from './utils.js';
import { displayFriend } from './home.js';

export async function updateSocial() {

    const userRequestTemplate = await userRequestCardComponent();
    if (!userRequestTemplate) 
        return

    const response = await fetchFriendChange('GET', {}, 'get/');
    if (!response)
        return false
    const data = await assembler(response)
    const allPendingRequests = data.friend_requests;
    updateSocialFriend(userRequestTemplate, allPendingRequests);
    // updateSocialInvite(clonedNode);
    updateSocialBadge();
}

async function updateSocialFriend(userRequestTemplate, allPendingRequests) {
    function clearContainer(container) {
        container.innerHTML = '';
    }
    const sentRequestContainer = document.getElementById('sentRequest');
    const receiveRequestContainer = document.getElementById('receivedRequest');
    clearContainer(sentRequestContainer);
    clearContainer(receiveRequestContainer);

    allPendingRequests.forEach(request => {
        const requestNode = userRequestTemplate.cloneNode(true);
        const userNode = fillRequestTemplate(requestNode, request);
        updateSocialFriendBtn(userNode, request);

        const container = request.role === 'receiver' ? sentRequestContainer : receiveRequestContainer;
        container.appendChild(requestNode);
    });
}

function updateSocialFriendBtn(userNode, request) {
    const button1 = userNode.querySelector('#button1');
    const button2 = userNode.querySelector('#button2');

    if (request.role === 'sender') {
        button1.dataset.action = 'accept'
        button2.dataset.action = 'refuse'
        setupButton(button1, 'Accept', request, 'accept');
        setupButton(button2, 'Refuse', request, 'refuse');
    } else if (request.role === 'receiver') {
        button1?.remove();
        button2.dataset.action = 'cancel'
        setupButton(button2, 'Cancel Request', request, 'cancel');
    }
}

function setupButton(button, text, request, action) {
    if (button) {
        button.textContent = text;
        button.dataset.id = request.id;
        button.dataset.action = action;
        button.addEventListener('click', getSocialUserID);
        button.removeAttribute('id');
    }
}

function fillRequestTemplate(requestNode, request) {
    requestNode.dataset.id = request.id;
    const img = requestNode.querySelector('#userRequestCardImg');
    img.src = request.avatar || '';
    img.alt = request.nickname + "'s avatar";
    // img.id = '';

    const nickname = requestNode.querySelector('#userRequestCardNickname');
    nickname.textContent = request.nickname;
    // nickname.id = '';

    return requestNode;
}

function updateSocialBadge() {
    const receivedRequestCount = document.getElementById('receivedRequest').childElementCount;
    // const sentRequestCount = document.getElementById('sentRequest').childElementCount;
    const sentRequestCount = 0;
    const inviteGameCount = document.getElementById('inviteGameReceived').childElementCount;

    const socialBadge = document.getElementById('socialBadge');
    socialBadge.textContent = receivedRequestCount + sentRequestCount + inviteGameCount;
}

function getSocialUserID(event) {
    let ancestor = event.currentTarget;
    while (ancestor && !ancestor.hasAttribute('data-userid-flag')) {
        ancestor = ancestor.parentNode;
    }
    if (!ancestor || !ancestor.dataset.id) {
        console.error('User ID not found');
        return;
    }
    const userID = ancestor.dataset.id;
    const action = event.currentTarget.dataset.action;

    const actionObj = {
        'action': action,
        'id': userID,
        'modal': 'social',
    }
    handleFriendAction(actionObj);
}

function updateContainerClasses(container, isSuccess) {
    if (isSuccess) {
        container.classList.add('text-success');
        container.classList.remove('text-danger');
    } else {
        container.classList.add('text-danger');
        container.classList.remove('text-success');
    }
}

function getResponseContainer(action) {
    if (action === 'accept' || action === 'refuse') {
        return document.getElementById('response-requests-received-info');
    } else if (action === 'cancel') {
        return document.getElementById('response-requests-sent-info');
    } else {
        console.error('Unknown action');
        return null;
    }
}

let messageTimer;
export function updateSocialFriendCard(userID, action, responseStatus, assemble) {
    const socialDiv = document.getElementById('socialModal');
    const userToRemove = socialDiv.querySelector(`div[data-id="${userID}"]`);

    if (!userToRemove) {
        console.error('Cannot find user to remove');
        return;
    }

    const container = getResponseContainer(action);
    if (!container) {
        console.error('Cannot find container for response');
        return;
    }

    const isSuccess = responseStatus >= 200 && responseStatus < 300;
    updateContainerClasses(container, isSuccess);

    container.textContent = assemble.message;
    userToRemove.remove();
    updateSocialBadge();

    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => container.textContent = '', 5000);
}
