import { fetchFriendChange } from '../../api/fetchData.js';
import { userRequestCardComponent } from '../../components/userRequestCard/userRequestCard.js';
import { assembler } from '../../api/assembler.js';

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

    document.getElementById('addFriendBtn').addEventListener('click', handleFriendAction);
    document.getElementById('deleteFriendBtn').addEventListener('click', handleFriendAction);

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

export async function handleFriendAction(event) {
    const actionToMethod = {
        'add': 'POST',
        'cancel': 'DELETE',
        'accept': 'POST',
        'refuse': 'DELETE',
        'unfriend': 'DELETE',
    };

    function getOtherUserID() {
        const otherUserModal = document.getElementById('otherUserInfo');
        const otherUserContentElement = otherUserModal.querySelector('.modal-content');
        return otherUserContentElement.id;
    }

    const button = event.target.dataset;
    const action = button.action;

    if (!action || !actionToMethod.hasOwnProperty(action)) {
        console.error('Unknown action:', action);
        return;
    }

    const otherUserID = getOtherUserID();
    if (!otherUserID) {
        console.error('Other user ID not found');
        return;
    }

    const apiParam = { id: otherUserID, action: action };
    const method = actionToMethod[action];
    const response = await fetchFriendChange(method, apiParam);
    if (!response) {
        return;
    }
    const assemble = await assembler(response);
    console.log(assemble);
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