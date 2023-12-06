import { userTemplateComponent } from '../../components/userTemplate/userTemplate.js';
import { assembleUser } from '../../api/assembler.js';


export async function displayUser(allUsers) {
    const objectAllUsers = await assembleUser(allUsers);
    const templateUser = await userTemplateComponent();
    
    let userContainer = document.getElementById('userDisplay');
    userContainer.innerHTML = '';
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