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

export function updateSocialFriendCard(userID, action, responseStatus, assemble) {
    const socialDiv = document.getElementById('friendRequestModal')
    const userToRemove = socialDiv.querySelector(`div[data-id="${userID}"]`);

    if (!userToRemove) {
        console.error('cannot find user to remove')
        return
    }
    
    console.log(userToRemove)
    console.log(responseStatus)

    let container = null
    if (action === 'accept' || action == 'refuse') {
        container = document.getElementById('response-requests-received-info')
    } else if (action == 'cancel') {
        container = document.getElementById('response-requests-sent-info')
    }

    if (!container) {
        console.error('cannot find container for response')
        return
    }

    if (responseStatus >= 200 && responseStatus < 300) {
        container.classList.add('text-success')
        container.classList.remove('text-success')
    } else {
        container.classList.add('text-danger')
        container.classList.remove('text-success')
    }

    container.textContent = assemble.message
    userToRemove.remove()
}