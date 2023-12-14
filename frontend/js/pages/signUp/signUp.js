import { fetchUser } from '../../api/fetchData.js';
import { loadHTMLPage } from '../../api/fetchData.js';
import { navigateTo } from '../../router.js';
import { fetchAuth } from '../../api/fetchData.js';
import { displayErrorAlert } from '../../utils/utilityFunctions.js';

export async function showSignUp() {
    try {
        await loadHTMLPage('./js/pages/signUp/signUp.html');
        document
            .getElementById('signupForm')
            .addEventListener('submit', function (event){
                event.preventDefault();
                signUp();
            });
        document.getElementById('btnAlertCloseSignup').addEventListener('click', hideSignupAlert)
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
            displaySignupError(result)
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
        displaySignupError('Passwords do not match');
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
    if (!users.ok) { displaySignupError(responseText); }
    else { loginAfterSignup(nickname, password); }
}

function displaySignupError(errorMessage) {
    const errorAlert = document.getElementById('alertErrorSignup');
    displayErrorAlert(errorMessage, errorAlert);
    errorAlert.classList.add('show');
    errorAlert.classList.remove('hide');
}


function hideSignupAlert() {
    const errorAlert = document.getElementById('alertErrorSignup');
    errorAlert.classList.remove('show');
    errorAlert.classList.add('hide');
}