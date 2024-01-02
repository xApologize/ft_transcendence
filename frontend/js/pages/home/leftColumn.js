import { userTemplateComponent } from '../../components/userTemplate/userTemplate.js';
import { assembler } from '../../api/assembler.js';
import { displayOtherUserProfile } from './otherUserProfile.js';
import { fetchUser } from '../../api/fetchData.js';
import { setStatus } from './utils.js';

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
    container.innerHTML = '';
    let currentUser;
    const objectAllUsers = await assembler(allUsers);
    if (typeof objectAllUsers !== 'object' && objectAllUsers !== null) {
        return;
    }
    currentUser = document.getElementById('nickname').innerText;

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
        const clonedUserTemplate = templateUser.cloneNode(true);

        const seeProfileBtn = clonedUserTemplate.querySelector('.card');
        seeProfileBtn.addEventListener('click', displayOtherUserProfile)
        
        const inviteGameBtn = clonedUserTemplate.querySelector('#inviteGameBtn');
        inviteGameBtn.addEventListener('click', displayInviteModal);
        if (user.status === 'ING' || user.status === 'OFF')
            inviteGameBtn.classList.add("disabled", "border-0");


        const filledTemplate = fillOtherUserInfo(clonedUserTemplate, user)
        userContainer.appendChild(filledTemplate);

        //this is for potential patch to prevent the text box to push the button out of the div
        // if (user.nickname.length > 10 && window.innerWidth < 1000) console.log('greater than 10');
        // console.log(userContainer.offsetWidth);
        // console.log(clonedUserTemplate.querySelector('#user-name').offsetWidth);

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

async function displayInviteModal(event) {
    event.stopPropagation(); // Empêche le otherUserModal d'open pcq le listener est sur la div.
    let ancestor = event.currentTarget;
    while (ancestor && !ancestor.hasAttribute('data-userid-flag')) {
        ancestor = ancestor.parentNode;
    }
    if (!ancestor || !ancestor.dataset.id) {
        console.error('User ID not found');
        return;
    }
    const userID = ancestor.dataset.id;
    
    const response = await fetchUser('GET', { id: userID })
    const userResponse = await assembler(response)
    const user = userResponse[0]
    console.log('invite ', user.nickname, 'to a game'); // Need to fetch the user


    const modalElement = document.getElementById('inviteGameModal')
    const inviteModal = bootstrap.Modal.getInstance(modalElement);
    if (!inviteModal) {
        console.error('Other user modal instance not found')
        return
    }

    inviteModal.show()
}