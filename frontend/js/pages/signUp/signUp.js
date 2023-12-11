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
        if (error) console.error('Error fetching signUp.html:', error);
        else console.log('error null');
    }
}

async function loginAfterSignup(nickname, password) {
    const loginData = {
        nickname,
        password,
    };
    try {
        const response = await fetchAuth('POST','login/', loginData);
        const result = await response.json();
        console.log(result)
        if (response.ok) {
            if (result.success) {
                console.log('Login successful: ', await result.success);
                navigateTo('/home');
                return ;
            }
            console.log('Login failed: ', await result.error);
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
    // navigateTo('/home')
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
        return;
    }
    if (password !== passwordConfirm) {
        displayErrorMessage('Passwords do not match');
        return;
    }
    const userData = {
        nickname,
        email,
        avatar,
        password,
        passwordConfirm,
    };
    console.log(userData)
    const users = await fetchUser('POST', null, userData);
    if (!users) {
        console.log('Error creating user');
        return;
    }
    const responseText = await users.text();
    if (!users.ok) {
        displayErrorMessage(responseText);
    } else {
        console.log("SignUp Success: ", responseText)
        loginAfterSignup(nickname, password);
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
