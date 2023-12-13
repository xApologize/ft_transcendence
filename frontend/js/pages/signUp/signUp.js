import { fetchUser } from '../../api/fetchData.js';
import { loadHTMLPage } from '../../api/fetchData.js';
import { navigateTo } from '../../router.js';
import { fetchAuth } from '../../api/fetchData.js';

export async function showSignUp() {
    try {
        await loadHTMLPage('./js/pages/signUp/signUp.html');
        document
            .getElementById('signupForm')
            .addEventListener('submit', function (event){
                event.preventDefault();
                signUp();
            });
    } catch (error) {
        console.error('Error fetching signUp.html:', error);
    }
}

async function loginAfterSignup(nickname, password) {
    const loginData = {
        nickname,
        password,
    };
    try {
        const response = await fetchAuth('POST','login/', loginData);
        if (response.ok) {
            navigateTo('/home');
            return ;
        } else {
            const result = await response.text();
            displayErrorMessage(result)
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
}

async function signUp() {
    const nickname = document.getElementById('inputUsername').value;
    const email = document.getElementById('inputEmail').value;
    const password = document.getElementById('inputPassword').value;
    const passwordConfirm = document.getElementById(
        'inputPasswordConfirm'
    ).value;
    if (!nickname || !email || !password || !passwordConfirm) {
        return;
    }
    if (password !== passwordConfirm) {
        displayErrorMessage('Passwords do not match');
        return;
    }
    const userData = {
        nickname,
        email,
        password,
        passwordConfirm,
    };
    const users = await fetchUser('POST', null, userData);
    if (!users) {
        console.log('Error creating user');
        return;
    }
    const responseText = await users.text();
    if (!users.ok) { displayErrorMessage(responseText); }
    else { loginAfterSignup(nickname, password); }
}

function displayErrorMessage(errorMessage) {
    const error = document.getElementById('errorMessage');
    error.classList.remove('d-none');
    error.textContent = errorMessage;

    // Hide the error message after 3 seconds
    setTimeout(() => {
        error.classList.add('d-none');
        error.textContent = '';
    }, 3000);
}

