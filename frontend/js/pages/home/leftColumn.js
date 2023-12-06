import { userTemplateComponent } from '../../components/userTemplate/userTemplate.js';
import { assembleUser } from '../../api/assembler.js';


export async function displayUser(allUsers) {
    let userContainer = document.getElementById('userDisplay');
    userContainer.innerHTML = '';
    const objectAllUsers = await assembleUser(allUsers);
    if (typeof objectAllUsers !== 'object' && objectAllUsers !== null) {
        return;
    }
    objectAllUsers.sort((a, b) => {
        // Custom sorting logic: Online users come before Offline users.
        if ((a.status === 'ONL' && b.status !== 'ONL') || (a.status === 'ING' && b.status !== 'ING')) {
            return -1;
        } else if ((a.status !== 'ONL' && b.status === 'ONL') || (a.status !== 'ING' && b.status === 'ING')) {
            return 1;
        } else {
            return 0;
        }
    });
    const templateUser = await userTemplateComponent();

    if (objectAllUsers) {
        objectAllUsers.forEach((user) => {
            userContainer.appendChild(document.createElement('hr'));

            const clonedUserTemplate = templateUser.cloneNode(true);

            const avatarElement =
                clonedUserTemplate.querySelector('#user-avatar');
            const nameElement = clonedUserTemplate.querySelector('#user-name');
            const statusBadge = clonedUserTemplate.querySelector('#badge');
            statusBadge.style.backgroundColor = setStatus(user.status);
            avatarElement.src = user.avatar;
            nameElement.textContent = user.nickname;

            userContainer.appendChild(clonedUserTemplate);
        });

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
    }
}