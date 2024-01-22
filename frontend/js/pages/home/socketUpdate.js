import { userTemplateComponent } from '../../components/userTemplate/userTemplate.js';
import { fillOtherUserInfo } from './leftColumn.js';
import { displayOtherUserProfile } from './otherUserProfile.js';
import { displayToast } from './toastNotif.js';
import { displayFriend } from './home.js';
import { getUserAndDisplay} from './otherUserProfile.js';
import { updateSocial } from './social.js';
import { getMyID, fetchUserById, setStatus } from './utils.js';
import { fetchUser, fetchFriendChange } from '../../api/fetchData.js';
import { assembler } from '../../api/assembler.js';
/////////////////////

function updateSocialSocket(user) {
    const socialContainer = document.getElementById('socialModal');
    const socialCards = socialContainer.querySelectorAll(`div[data-id="${user.id}"]`);
    socialCards.forEach(card => {
        const avatarElement = card.querySelector('#userRequestCardImg');
        const nameElement = card.querySelector('#userRequestCardNickname');

        if (avatarElement) {
            avatarElement.src = user.avatar;
            avatarElement.alt = user.nickname;
        }
        if (nameElement) {
            nameElement.textContent = user.nickname;
        }
    });
}

function updateOtherProfileSocket(user) {
    const otherUserModal = document.getElementById('otherUserInfo');
    const isModalShown = otherUserModal.classList.contains('show');
    if (isModalShown) {
        const modalContent = otherUserModal.querySelector('.modal-content');
        const id = modalContent ? modalContent.dataset.id : null;

        if (id && id == user.id) {
            let nickname = otherUserModal.querySelector('#userNickname');
            nickname.textContent = user.nickname;

            let avatar = otherUserModal.querySelector('#userAvatar');
            avatar.src = user.avatar;
        }
    }
}

function updateOtherUsersCard(user) {
    const userCards = document.querySelectorAll(`div[data-id="${user.id}"]`);
    userCards.forEach(card => {
        const avatarElement = card.querySelector('#user-avatar');
        const nameElement = card.querySelector('#user-name');

        if (avatarElement) {
            avatarElement.src = user.avatar;
            avatarElement.alt = user.nickname;
        }
        if (nameElement) {
            nameElement.textContent = user.nickname;
        }
    });
    updateOtherProfileSocket(user);
    updateSocialSocket(user);
}

// To use when user update his profile (avatar/nickname)
export async function updateSpecificUser(userID) {
    const apiParam = { id: userID };
    const response = await fetchUser('GET', apiParam);
    if (!response)
        return;
    const assemble = await assembler(response);
    if (typeof assemble !== 'object' || assemble === null) {
        return;
    } else {
        updateOtherUsersCard(assemble[0]);
    }
}

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
            const inviteGameBtn = card.querySelector('#inviteGameBtn');
            if (inviteGameBtn) {
                inviteGameBtn.classList.add("disabled", "border-0");
            }
        }
    });
}

export function handleSocialUpdate(rType, currentUser, otherUserId) {
    const userId = getMyID();
    if (!userId || userId == currentUser || userId == otherUserId) {
        updateSocial('friend');
        if (userId == otherUserId)
            updateModalIfOpen()
        displayFriend();
        createNotifications(rType, userId, currentUser, otherUserId);
    }
}

function updateModalIfOpen() {
    const otherUserModal = document.getElementById('otherUserInfo')
    if (otherUserModal.classList.contains('show'))  { // ERROR HERE
        const content = otherUserModal.querySelector('.modal-content');
        if (content.dataset.id)
            getUserAndDisplay(content.dataset.id);
    }
}

async function createNotifications(rType, userId, otherUserId, currentUser) {
    let toastMsg = "";
    let toastTitle = "";
    
    if (userId == currentUser || !userId) {
        const user = await fetchUserById(otherUserId);
        let imgUrl = user ? user.avatar : "../../../public/80-percent.jpeg";
        let userNickname = user ? user.nickname : "someone";
        let toastType = ''
    
        switch (rType) {
            case "add":
                toastMsg = `You have received a friend request from ${userNickname}!`;
                toastTitle = "Friend Request";
                toastType = 'displaySocial'
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
            displayToast(toastMsg, toastTitle, toastType,imgUrl);
    }
}

export async function newUser(userID) {
    const apiParam = { id: userID };
    const currentUser = getMyID()
    if (!currentUser || currentUser == userID) 
        return;
    try {
        const response = await fetchUser('GET', apiParam);
        if (!response)
            return;
        
        const assemble = await assembler(response);
        if (typeof assemble !== 'object' || assemble === null) {
            return;
        }
        addNewUser(assemble[0]);
    } catch (error) {
        console.error('Error in newUser:', error);
    }
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

async function checkIfFriend(user) {
    const response = await fetchFriendChange('GET', { id: user.id });
    if (!response) return false;
    
    const friendStatus = await assembler(response);
    return friendStatus && friendStatus.state === 'friend';
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
    const inviteGameBtn = friendCard.querySelector('#inviteGameBtn');
    if (inviteGameBtn) {
        inviteGameBtn.classList.remove("disabled", "border-0");
    }
}

function appendToContainer(container, element, userID) {
    if (!container.querySelector(`div[data-id="${userID}"]`)) {
        element.setAttribute('data-id', userID);
        element.querySelector('#inviteGameBtn').remove()
        container.appendChild(element);
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

export function updateSpecificUserStatus(id, rType) {
    const friendDiv = document.getElementById('friendDisplay');
    const everyoneDiv = document.getElementById('userDisplay')
    const userCardFriend = friendDiv.querySelector(`div[data-id="${id}"]`);
    const userCardEveryone = everyoneDiv.querySelector(`div[data-id="${id}"]`);
    let color = setStatus(rType);
    if (userCardFriend) {
        updateBadgeSpecificColor(userCardFriend, color);
        const inviteGameBtn = userCardFriend.querySelector('#inviteGameBtn');
        if (rType == 'ONL') {
            inviteGameBtn.classList.remove("disabled", "border-0");
        } else {
            inviteGameBtn.classList.add("disabled", "border-0");
        }
    }

    if (userCardEveryone) {
        updateBadgeSpecificColor(userCardEveryone, color);
    }
}

const updateBadgeSpecificColor = (userCard, color) => {
    const statusBadge = userCard.querySelector('#badge');
    if (statusBadge) {
        statusBadge.style.backgroundColor = color;
    }
}
