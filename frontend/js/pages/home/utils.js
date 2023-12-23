import { fetchFriendChange, fetchUser } from '../../api/fetchData.js';
import { assembler } from '../../api/assembler.js';
import { updateOtherFriendButton, updateStatusMsg } from './otherUserProfile.js';
import { updateSocialFriendCard } from './social.js';
import { userTemplateComponent } from '../../components/userTemplate/userTemplate.js';
import { fillOtherUserInfo } from './leftColumn.js';

export async function handleFriendAction(actionObj) {
    const actionToMethod = {
        'add': 'POST',
        'cancel': 'DELETE',
        'accept': 'POST',
        'refuse': 'DELETE',
        'unfriend': 'DELETE',
    };

    if (!actionObj) {
        console.error('No actionObj');
        return;
    }

    const { id: userID, action, modal } = actionObj;
    if (!action || !actionToMethod[action]) {
        console.error(`Unknown action: ${action}`);
        return;
    }

    const apiParam = { id: userID, action };
    const method = actionToMethod[action];
    const response = await fetchFriendChange(method, apiParam);
    if (!response) {
        return;
    }
    
    const assemble = await assembler(response);
    const responseStatus = response.status;
    switch (modal) {
        case 'otherProfile':
            updateStatusMsg(assemble, responseStatus);
            if (assemble.status) {
                updateOtherFriendButton(assemble.status);
            }
            break;
        case 'social':
            updateSocialFriendCard(userID, action, responseStatus, assemble);
            break;
        default:
            console.error(`Unknown modal type: ${modal}`);
    }
}

async function addNewUser(user) {
    const everyoneContainer = document.getElementById('userDisplay');
    const friendContainer = document.getElementById('friendDisplay');
    const templateUser = await getTemplateUser(user);

    if (!templateUser) return;

    appendToContainer(everyoneContainer, templateUser, user.id);
    if (await checkIfFriend(user)) {
        await changeFriendStatus(user.id, friendContainer, templateUser);
    }
}

async function changeFriendStatus(userID, container, templateUser) {
    const friendCard = container.querySelector(`div[data-id="${userID}"]`);

    if (friendCard) {
        updateBadgeColor(friendCard, container);
    } else {
        prependToContainer(container, templateUser.cloneNode(true), userID);
    }
}

function updateBadgeColor(friendCard, container) {
    const statusBadge = friendCard.querySelector('#badge');
    if (statusBadge) {
        statusBadge.style.backgroundColor = setStatus('ONL');
        container.removeChild(friendCard);
        container.insertBefore(friendCard, container.firstChild);
    }
}

function appendToContainer(container, element, userID) {
    if (!container.querySelector(`div[data-id="${userID}"]`)) {
        element.setAttribute('data-id', userID); // Set the unique data-id attribute
        container.appendChild(element);
    } else {
        console.log(`User with ID ${userID} already exists in the container.`);
    }
}

function prependToContainer(container, element, userID) {
    element.setAttribute('data-id', userID); // Ensure each element has a unique data-id
    container.insertBefore(element, container.firstChild);
}

async function getTemplateUser(user) {
    const templateUser = await userTemplateComponent();
    if (!templateUser) {
        console.error('Cannot find templateUser');
        return null;
    }
    return fillOtherUserInfo(templateUser, user);
}

async function checkIfFriend(user) {
    const response = await fetchFriendChange('GET', { id: user.id });
    if (!response) return false;
    
    const friendStatus = await assembler(response);
    return friendStatus && friendStatus.state === 'friend';
}

function updateOtherUsers(user) {
    const userCards = document.querySelectorAll(`div.card[data-id="${user.id}"]`);
    userCards.forEach(card => {
        const avatarElement = card.querySelector('#user-avatar');
        const nameElement = card.querySelector('#user-name');

        if (avatarElement) {
            avatarElement.src = user.avatar; // Update avatar image source
            avatarElement.alt = user.nickname; // Update alt text
        }
        if (nameElement) {
            nameElement.textContent = user.nickname; // Update user's name
        }
    });
}

export function setStatus(user) {
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

//////////////////////////// SOCKET FUNCTIONS ////////////////////////////
// Les login/logout ne sont pas parfait.
// Les users ne seront plus en ordre online/offline dans les friends.

// To use when user update his profile (avatar/nickname)
export async function updateSpecificUser(userID) {
    const apiParam = { id: userID };
    const response = await fetchUser('GET', apiParam);
    if (!response)
        return;
    const assemble = await assembler(response);
    if (assemble.users) {
        updateOtherUsers(assemble.users[0]);
    } else {
        console.error('Cannot find user to update with Socket');
    }
}

// To use when user login
export async function newUser(userID) {
    const apiParam = { id: userID };
    try {
        const response = await fetchUser('GET', apiParam);
        if (!response)
            return;

        const assemble = await assembler(response);
        if (typeof assemble !== 'object' || assemble === null) {
            console.log(assemble);
            return;
        }

        addNewUser(assemble[0]);
    } catch (error) {
        console.error('Error in newUser:', error);
    }
}

// To use when user logout
export async function removeUser(userID) {
    const everyoneContainer = document.getElementById('userDisplay');
    const friendContainer = document.getElementById('friendDisplay');

    const userCards = document.querySelectorAll(`div[data-id="${userID}"]`);
    userCards.forEach(card => {
        if (everyoneContainer.contains(card)) {
            everyoneContainer.removeChild(card);
        } else if (friendContainer.contains(card)) {
            const statusBadge = card.querySelector('#badge');
            if (statusBadge) {
                statusBadge.style.backgroundColor = setStatus('OFF');
                friendContainer.removeChild(card);
                friendContainer.appendChild(card);
            }
        }
    });
}