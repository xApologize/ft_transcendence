import { userTemplateComponent } from '../../components/userTemplate/userTemplate.js';
import { fillOtherUserInfo } from './leftColumn.js';
import { displayOtherUserProfile } from './otherUserProfile.js';
import { displayToast } from './toastNotif.js';
import { displayFriend } from './home.js';
import { getUserAndDisplay} from './otherUserProfile.js';
import { updateSocial } from './social.js';
import { getMyID, fetchUserById } from './utils.js';
import { fetchUser, fetchFriendChange } from '../../api/fetchData.js';
import { assembler } from '../../api/assembler.js';
/////////////////////

function updateOtherUsers(user) {
    const userCards = document.querySelectorAll(`div[data-id="${user.id}"]`);
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

// To use when user update his profile (avatar/nickname)
export async function updateSpecificUser(userID) {
    console.log("UPDATE USER")
    const apiParam = { id: userID };
    const response = await fetchUser('GET', apiParam);
    if (!response)
        return;
    const assemble = await assembler(response);
    if (typeof assemble !== 'object' || assemble === null) {
        console.log(assemble);
        return;
    } else {
        updateOtherUsers(assemble[0]);
    }
}

/////////////////////


// To use when user logout
export async function removeUser(userID) {
    console.log("REMOVE USER")
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
    console.log("END REMOVE USER")
}


/////////////////////

export function handleSocialUpdate(rType, currentUser, otherUserId) {
    const userId = getMyID();
    console.log("START SOCIAL UPDATE")
    if (!userId || userId == currentUser || userId == otherUserId) {
        console.log("IN IF")
        updateSocial();
        if (userId == otherUserId)
        updateModalIfOpen()
    displayFriend();
    createNotifications(rType, userId, currentUser, otherUserId);
}

console.log("END SOCIAL UPDATE");
}

function updateModalIfOpen() {
    const otherUserModal = document.getElementById('otherUserInfo')
    console.log(otherUserModal)
    if (otherUserModal.classList.contains('show'))  { // ERROR HERE
        const content = otherUserModal.querySelector('.modal-content');
        if (content.dataset.id)
            getUserAndDisplay(content.dataset.id);
    }
}

async function createNotifications(rType, userId, otherUserId, currentUser) {
    let toastMsg = "";
    let toastTitle = "";
    
    if (userId === currentUser) {
        const user = await fetchUserById(otherUserId);
        let imgUrl = user ? user.avatar : "https://www.shutterstock.com/image-vector/friends-request-icon-isolated-sign-260nw-1591730662.jpg";
        let userNickname = user ? user.nickname : "someone";
    
        switch (rType) {
            case "add":
                toastMsg = `You have received a friend request from ${userNickname}!`;
                toastTitle = "Friend Request";
                break;
            case "accept":
                toastMsg = `${userNickname} has accepted your friend request!`;
                toastTitle = "Request Accepted";
                break;
            case "refuse":
                toastMsg = `${userNickname} has refused your friend request.`;
                toastTitle = "Request Refused";
                break;
            case "unfriend":
                toastMsg = `You have been unfriended by ${userNickname}.`;
                toastTitle = "Unfriended";
                break;
            default:
                return;
        }

        if (toastMsg)
            displayToast(toastMsg, toastTitle, imgUrl);
    }
}

/////////////////////

// To use when user login
export async function newUser(userID) {
    console.log("NEW USER")
    const apiParam = { id: userID };
    if (getMyID() == userID) 
        return;
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
    console.log("END NEW USER")
}

async function addNewUser(user) {
    const everyoneContainer = document.getElementById('userDisplay');
    const friendContainer = document.getElementById('friendDisplay');
    const templateUser = await getTemplateUser(user);

    if (!templateUser) return;

    const seeProfileBtn = templateUser.querySelector('.card');
    seeProfileBtn.addEventListener('click', displayOtherUserProfile)
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
        element.setAttribute('data-id', userID);
        container.appendChild(element);
    } else {
        console.log(`User with ID ${userID} already exists in the container.`);
    }
}

function prependToContainer(container, element, userID) {
    element.setAttribute('data-id', userID);
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

/////////////////////
