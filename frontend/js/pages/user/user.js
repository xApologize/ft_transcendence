import { fetchUser } from '../../api/fetchData.js';
import { loadHTMLPage } from '../../api/fetchData.js';
import { assembleUser } from '../../api/assembler.js';

export async function showUser() {
    try {
        await loadHTMLPage('./js/pages/user/user.html');

        document.getElementById('createUser').addEventListener('click', () => {
            createUser();
        });

        document
            .getElementById('getUser')
            .addEventListener('click', async () => {
                getUser();
            });

        document
            .getElementById('deleteUser')
            .addEventListener('click', async () => {
                deleteUser();
            });

        document.getElementById('reset').addEventListener('click', () => {
            resetPage();
        });
    } catch (error) {
        console.error('Error fetching home.html:', error);
    }
}

///////
async function createUser() {
    const nickname = document.getElementById('userInput').value;
    const email = document.getElementById('emailInput').value;
    const avatar = document.getElementById('avatarInput').value;

    if (!nickname || !email || !avatar) {
        alert('Please enter all required fields.');
        return;
    }

    const userData = {
        nickname,
        email,
        avatar,
        status: 'ONL', // Set the default status here
        admin: false, // Set the default admin value here
    };

    // console.log(`'${userData['nickname']}'`)
    const users = await fetchUser('POST', null, userData);
    const responseText = await users.text();
    if (users.ok) {
        displaySuccessMessage(responseText, 'successCreate');
    } else {
        displayErrorMessage(responseText);
    }
}

///////

async function getUser() {
    const nicknameInput = document.getElementById('nicknameInput').value;
    if (!nicknameInput) {
        alert('Fill in the nickname');
        return;
    }

    let userResponse = await fetchUser('GET', nicknameInput);
    if (userResponse.ok) {
        const user = await assembleUser(userResponse);
        displayUsers(user);
        displaySuccessMessage('User Found !', 'successUser');
    } else {
        const textResponse = await userResponse.text();
        displayErrorMessage(textResponse);
    }
}

///////

async function deleteUser() {
    const nicknameInput = document.getElementById('deleteInput').value;
    if (!nicknameInput) {
        alert('Fill in the nickname');
        return;
    }
    let userResponse = await fetchUser('DELETE', nicknameInput);
    if (userResponse.ok) {
        displaySuccessMessage(
            `User ${nicknameInput} deleted successfully!`,
            'deleteUserMsg'
        );
    } else {
        const textResponse = await userResponse.text();
        displayErrorMessage(textResponse);
    }
}

///////

function resetPage() {
    const error = document.getElementById('errorMessage');
    error.classList.add('d-none');

    const usersContainer = document.getElementById('userData');
    const userNodes = usersContainer.querySelectorAll(
        '.user-list > .user-template'
    );
    userNodes.forEach((node) => node.remove());
}

//////////////////////////////////////////////////////////////

function displayErrorMessage(errorMessage) {
    const error = document.getElementById('errorMessage');
    error.classList.remove('d-none');
    error.textContent = errorMessage;
}

function displaySuccessMessage(responseText, SuccessElement) {
    const successMessage = document.getElementById(SuccessElement);
    successMessage.textContent = responseText;
    successMessage.classList.remove('d-none');
}

//////////////////////////////////////////////////////////////

function displayUsers(users) {
    const usersContainer = document.getElementById('userData');
    const userTemplate = document.querySelector('.user-template');

    usersContainer.innerHTML = '';

    users.forEach((user) => {
        const newUser = userTemplate.cloneNode(true);
        newUser.classList.remove('d-none');

        // Fill in the user data
        newUser.querySelector('.user-avatar').src = user.avatar;
        newUser.querySelector(
            '.user-nickname'
        ).textContent = `Nickname: ${user.nickname}`;
        newUser.querySelector(
            '.user-email'
        ).textContent = `Email: ${user.email}`;
        newUser.querySelector(
            '.user-status'
        ).textContent = `Status: ${user.status}`;
        newUser.querySelector('.user-admin').textContent = `Admin: ${
            user.admin ? 'Yes' : 'No'
        }`;

        usersContainer.appendChild(newUser);
    });
}

//////////////////////////////////////////////////////////////
