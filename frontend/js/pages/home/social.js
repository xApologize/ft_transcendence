import { fetchFriendChange } from '../../api/fetchData.js';
import { userRequestCardComponent } from '../../components/userRequestCard/userRequestCard.js';
import { assembler } from '../../api/assembler.js';
import { handleFriendAction } from './utils.js';

export async function updateSocial() {

    const userRequestTemplate = await userRequestCardComponent();
    if (!userRequestTemplate) { return }

    const response = await fetchFriendChange('GET', {}, 'get/');
    if (!response) { return }
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
        setupButton(button1, 'Accept', request, 'accept');
        setupButton(button2, 'Refuse', request, 'refuse');
    } else if (request.role === 'receiver') {
        button1?.remove();
        setupButton(button2, 'Cancel Request', request, 'cancel');
    }
}

function setupButton(button, text, request, action) {
    if (button) {
        button.textContent = text;
        button.dataset.id = request.id;
        button.dataset.action = action;
        button.addEventListener('click', handleFriendAction);
        button.removeAttribute('id');
    }
}

function fillRequestTemplate(requestNode, request) {
    const img = requestNode.querySelector('#userRequestCardImg');
    img.src = request.avatar || '';
    img.alt = request.nickname + "'s avatar";
    img.id = '';

    const nickname = requestNode.querySelector('#userRequestCardNickname');
    nickname.textContent = request.nickname;
    nickname.id = '';

    return requestNode;
}

function updateSocialBadge() {
    const receivedRequestCount = document.getElementById('receivedRequest').childElementCount;
    const sentRequestCount = document.getElementById('sentRequest').childElementCount;
    const inviteGameCount = document.getElementById('inviteGameReceived').childElementCount;

    const socialBadge = document.getElementById('socialBadge');
    socialBadge.textContent = receivedRequestCount + sentRequestCount + inviteGameCount;
}
