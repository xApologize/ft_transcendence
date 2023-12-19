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
    console.log(allPendingRequests)
    updateSocialFriend(userRequestTemplate, allPendingRequests);
    // updateSocialInvite(clonedNode);
    updateSocialBadge();

}

async function updateSocialFriend(userRequestTemplate, allPendingRequests) {
    const sentRequestContainer = document.getElementById('sentRequest');
    const receiveRequestContainer = document.getElementById('receivedRequest');
    sentRequestContainer.innerHTML = '';
    receiveRequestContainer.innerHTML = '';

    allPendingRequests.forEach(request => {
        const requestNode = userRequestTemplate.cloneNode(true);
        const userNode = fillRequestTemplate(requestNode, request)
        handleSocialFriendBtn(userNode, request);
        if (request.role === 'receiver') {
            sentRequestContainer.appendChild(requestNode);
        } else if (request.role === 'sender') {
            receiveRequestContainer.appendChild(requestNode);
        }
    });
}


function handleSocialFriendBtn(userNode, request) {
    const button1 = userNode.querySelector('#button1');
    const button2 = userNode.querySelector('#button2');
    if (request.role == 'sender') {
        button1.textContent = 'Accept';
        button1.dataset.id = request.id
        button1.dataset.action = 'accept'
        button1.addEventListener('click', handleFriendAction);
        button1.id = '';

        button2.textContent = 'Refuse';
        button2.dataset.id = request.id
        button2.dataset.action = 'refuse'
        button2.addEventListener('click', handleFriendAction);
        button2.id = '';
    } else if (request.role == 'receiver') {
        if (button1) {
            button1.remove();
        }
        button2.addEventListener('click', handleFriendAction);
        button2.textContent = 'Cancel Request';
        button2.dataset.id = request.id;
        button2.dataset.action = 'cancel'
        button2.id = '';
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