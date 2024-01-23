import { fetchFriendChange, fetchGameInvite } from '../../api/fetchData.js';
import { userRequestCardComponent } from '../../components/userRequestCard/userRequestCard.js';
import { assembler } from '../../api/assembler.js';
import { handleFriendAction } from './utils.js';
import interactiveSocket from './socket.js';

export async function updateSocial(typeToUpdate) {
    const userRequestTemplate = await userRequestCardComponent();
    if (!userRequestTemplate) return;

    const handleFriendUpdate = async () => {
        const response = await fetchFriendChange('GET', {}, 'get/');
        if (!response) return false;
        const data = await assembler(response);
        const allPendingRequests = data.friend_requests;
        await updateSocialFriend(userRequestTemplate, allPendingRequests);
    };

    const handleInviteUpdate = async () => {
        await updateSocialInvite(userRequestTemplate);
    };

    if (typeToUpdate === 'friend') {
        await handleFriendUpdate();
    } else if (typeToUpdate === 'gameInvite') {
        await handleInviteUpdate();
    } else {
        await handleFriendUpdate();
        await handleInviteUpdate();
    }
    updateSocialBadge();
}


async function updateSocialInvite(userRequestTemplate) {
    const response = await fetchGameInvite('GET');
    if (!response) return;
    const data = await assembler(response);
    const allPendingInvites = data.invites;
    
    const inviteGameContainer = document.getElementById('inviteGameReceived');
    if (!inviteGameContainer) return;
    inviteGameContainer.innerHTML = '';
    allPendingInvites.forEach(invite => {
        const inviteNode = userRequestTemplate.cloneNode(true);
        const userNode = fillRequestTemplate(inviteNode, invite);
        updateSocialInviteBtn(userNode, invite);
        inviteGameContainer.appendChild(userNode);
    });
}

function updateSocialInviteBtn(userNode, invite) {
    const button1 = userNode.querySelector('#button1');
    const button2 = userNode.querySelector('#button2');
    setupSocialInviteButton(button1, 'Accept', {'id': invite.id}, 'accept');
    setupSocialInviteButton(button2, 'Refuse', {'id': invite.id}, 'refuse');
}

function setupSocialInviteButton(button, text, request, action) {
    if (button) {
        button.textContent = text;
        button.dataset.id = request.id;
        button.dataset.action = action;
        button.addEventListener('click', getSocialInviteReqID);
        button.removeAttribute('id');
    }
}

function getSocialInviteReqID(event) {
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
    handleSocialInvInterac(action, userID);
}

function handleSocialInvInterac(action, id) {
    const actionType = action === 'accept' ? 'acceptGameInvite' : 'refuseGameInvite';

    interactiveSocket.sendMessageSocket(JSON.stringify({"type": "Social", "rType": actionType, "other_user_id": id}));
}


async function updateSocialFriend(userRequestTemplate, allPendingRequests) {
    function clearContainer(container) {
        if (container)
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
        setupSocialFriendBtn(button1, 'Accept', request, 'accept');
        setupSocialFriendBtn(button2, 'Refuse', request, 'refuse');
    } else if (request.role === 'receiver') {
        button1?.remove();
        button2.dataset.action = 'cancel'
        setupSocialFriendBtn(button2, 'Cancel Request', request, 'cancel');
    }
}

function setupSocialFriendBtn(button, text, request, action) {
    if (button) {
        button.textContent = text;
        button.dataset.id = request.id;
        button.dataset.action = action;
        button.addEventListener('click', getSocialFriendReqID);
        button.removeAttribute('id');
    }
}

function fillRequestTemplate(requestNode, request) {
    requestNode.dataset.id = request.id;
    const img = requestNode.querySelector('#userRequestCardImg');
    img.src = request.avatar || '';
    img.alt = request.nickname + "'s avatar";

    const nickname = requestNode.querySelector('#userRequestCardNickname');
    nickname.textContent = request.nickname;

    return requestNode;
}

function updateSocialBadge() {
    let receivedRequestCount = document.getElementById('receivedRequest')
    if (!receivedRequestCount) return;
    receivedRequestCount = receivedRequestCount.childElementCount;
    const inviteGameCount = document.getElementById('inviteGameReceived').childElementCount;
    const socialBadge = document.getElementById('socialBadge');
    socialBadge.textContent = receivedRequestCount + inviteGameCount;
}

function getSocialFriendReqID(event) {
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
