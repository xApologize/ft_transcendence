import { userTemplateComponent } from '../../components/userTemplate/userTemplate.js';
import { assembler } from '../../api/assembler.js';
import { displayOtherUserProfile } from './otherUserProfile.js';

export async function displayUser(allUsers) {
    let userContainer = document.getElementById('userDisplay');
    userContainer.innerHTML = '';
    let currentUser;
    const objectAllUsers = await assembler(allUsers);
    if (typeof objectAllUsers !== 'object' && objectAllUsers !== null) {
        return;
    }
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

    try {
        currentUser = document.getElementById('nickname').innerText;
    } catch {
        currentUser = null;
    }

    if (!objectAllUsers) {
        return;
    }
    await loopDisplayUser(objectAllUsers, currentUser, userContainer);
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
        userContainer.appendChild(document.createElement('hr'));

        const clonedUserTemplate = templateUser.cloneNode(true);

        const seeProfileBtn = clonedUserTemplate.querySelector('.card');
        seeProfileBtn.addEventListener('click', displayOtherUserProfile)

        const filledTemplate = fillOtherUserInfo(clonedUserTemplate, user)
        userContainer.appendChild(filledTemplate);


        const inviteGameBtn = clonedUserTemplate.querySelector('#inviteGameBtn');
        inviteGameBtn.addEventListener('click', () => {
            console.log('invite ', user.nickname, 'to a game');
        });
        if (user.status === 'ING' || user.status === 'OFF')
            inviteGameBtn.classList.add("disabled", "border-0");


        //this is for potential patch to prevent the text box to push the button out of the div
        // if (user.nickname.length > 10 && window.innerWidth < 1000) console.log('greater than 10');
        // console.log(userContainer.offsetWidth);
        // console.log(clonedUserTemplate.querySelector('#user-name').offsetWidth);

        userContainer.appendChild(clonedUserTemplate);
    });
}

function fillOtherUserInfo(clonedUserTemplate, user) {
    clonedUserTemplate.dataset.id = user.id

    const avatarElement = clonedUserTemplate.querySelector('#user-avatar');
    const nameElement = clonedUserTemplate.querySelector('#user-name');
    const statusBadge = clonedUserTemplate.querySelector('#badge');
    statusBadge.style.backgroundColor = setStatus(user.status);
    avatarElement.src = user.avatar;
    nameElement.textContent = user.nickname;
    function setStatus(user) {
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
    return clonedUserTemplate
}
