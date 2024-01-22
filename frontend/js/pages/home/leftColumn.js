import { userTemplateComponent } from '../../components/userTemplate/userTemplate.js';
import { assembler } from '../../api/assembler.js';
import { displayOtherUserProfile } from './otherUserProfile.js';
import { setStatus } from './utils.js';
import { displayInviteModal } from './inviteGame.js';

function sortUser(objectAllUsers) {
    objectAllUsers.sort((a, b) => {
        // Custom sorting logic: Online users come before Offline users.
        if (
            (a.status === 'ONL' && b.status !== 'ONL') ||
            (a.status === 'ING' && b.status !== 'ING')
        ) {
            return -1;
        } else if (
            (a.status !== 'ONL' && b.status === 'ONL') ||
            (a.status !== 'ING' && b.status === 'ING')
        ) {
            return 1;
        } else {
            return 0;
        }
    });
    return (objectAllUsers)
}


export async function displayUser(allUsers, container) {
    if (!container) 
        return;
    container.innerHTML = '';
    let currentUser;
    const objectAllUsers = await assembler(allUsers);
    if (typeof objectAllUsers !== 'object' && objectAllUsers !== null) {
        return;
    }
    currentUser = document.getElementById('nickname');
    if (!currentUser) {
        return;
    }
    currentUser = currentUser.innerText

    const sortAllUser = sortUser(objectAllUsers);
    await loopDisplayUser(sortAllUser, currentUser, container);
}

async function loopDisplayUser(objectAllUsers, currentUser, userContainer) {
    const templateUser = await userTemplateComponent();
    const currentUserIndex = objectAllUsers.findIndex(
        (user) => user.nickname === currentUser
    );

    if (currentUserIndex !== -1) {
        const currentUserObject = objectAllUsers.splice(currentUserIndex, 1)[0];
        objectAllUsers.unshift(currentUserObject);
    }

    objectAllUsers.forEach((user) => {
        if (!templateUser)  return;
        const clonedUserTemplate = templateUser.cloneNode(true);


        const seeProfileBtn = clonedUserTemplate.querySelector('.card');
        seeProfileBtn.addEventListener('click', displayOtherUserProfile)
        
        if (userContainer.id == 'friendDisplay') {
            const inviteGameBtn = clonedUserTemplate.querySelector('#inviteGameBtn');
            inviteGameBtn.addEventListener('click', displayInviteModal);
            if (user.status === 'ING' || user.status === 'OFF')
                inviteGameBtn.classList.add("disabled", "border-0");
        } else {
            clonedUserTemplate.querySelector('#inviteGameBtn').remove();;
        }
            


        const filledTemplate = fillOtherUserInfo(clonedUserTemplate, user)
        if (!userContainer.querySelector(`[data-id="${user.id}"]`)) {
            userContainer.appendChild(filledTemplate);            
        }

        userContainer.appendChild(clonedUserTemplate);
    });
}

export function fillOtherUserInfo(clonedUserTemplate, user) {
    clonedUserTemplate.dataset.id = user.id

    const avatarElement = clonedUserTemplate.querySelector('#user-avatar');
    const nameElement = clonedUserTemplate.querySelector('#user-name');
    const statusBadge = clonedUserTemplate.querySelector('#badge');
    statusBadge.style.backgroundColor = setStatus(user.status);
    avatarElement.src = user.avatar;
    nameElement.textContent = user.nickname;
    return clonedUserTemplate
}
