import { fetchUser } from '../../api/fetchData.js';
import { loadHTMLPage } from '../../api/fetchData.js';

export async function showSignUp() {
    try {
        await loadHTMLPage('./js/pages/signUp/signUp.html');
        document
            .getElementById('signUpButton')
            .addEventListener('click', () => {
                signUp();
            });
    } catch (error) {
        if (error) console.error('Error fetching signUp.html:', error);
        else console.log('error null');
    }
}

async function signUp() {
    const nickname = document.getElementById('inputUsername').value;
    const email = document.getElementById('inputEmail').value;
    const password = document.getElementById('inputPassword').value;
    const passwordConfirm = document.getElementById(
        'inputPasswordConfirm'
    ).value;
    const avatar = document.getElementById('inputAvatar').value;
    if (!nickname || !email || !password || !passwordConfirm || !avatar) {
        alert('Fill the form.');
        return;
    }
    const userData = {
        nickname,
        email,
        avatar,
        password,
    };

    console.log(`'${userData['nickname']}'`);
    const users = await fetchUser('POST', null, userData);
    const responseText = await users.text();
    if (!users.ok) {
        displayErrorMessage(responseText);
    } else {
        console.log("Create Success: ", responseText)
    }
}

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
