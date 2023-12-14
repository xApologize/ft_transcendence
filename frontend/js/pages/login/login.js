import { loadHTMLPage } from '../../api/fetchData.js';
import { navigateTo } from '../../router.js'
import { fetchAuth } from '../../api/fetchData.js';
import { displayAlertMsg } from '../../utils/utilityFunctions.js';

export async function showLogin() {
    try {
        await loadHTMLPage('./js/pages/login/login.html');
        // sessionStorage.clear()
        document.getElementById('login-form').addEventListener('submit', function (event) {
            event.preventDefault();
            login();
        });
        document
            .getElementById('signUpButton')
            .addEventListener('click', () => {
                navigateTo('/signUp');
            });
        document.getElementById('btnAlertCloseLogin').addEventListener('click', hideLoginAlert)
        document.getElementById('demo-user-btn').addEventListener('click', () => {
            login("demo-user", "demo-user");
        });
        document.getElementById('demo-user-btn2').addEventListener('click', () => {
            login("demo-user2", "demo-user2");
        });
    } catch (error) {
        console.error('Error fetching home.html:', error);
    }
}


async function login(username = null, password = null) {
    const usernameInput = username !== null ? username : document.getElementById('validationDefault01').value;
    const passwordInput = password !== null ? password : document.getElementById('passwordInput').value;

    if (!usernameInput || !passwordInput) {
        return;
    }

    const loginData = {
        nickname: usernameInput,
        password: passwordInput,
    };
    
    // Response status:
    // 404: User not found
    // 400: User found but bad password -> will definitely change
    // 200: Login successfull

    try {
        const response = await fetchAuth('POST','login/', loginData);
        if (!response)
            return;
        if (response.ok) {
            navigateTo('/home');
        } else {
            const result = await response.json();
            displayLoginError(result)
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
}

async function displayLoginError(message) {
    const alert = document.getElementById('alertErrorLogin');
    const msg = message.error;
    displayAlertMsg(msg, alert);
    alert.classList.remove('hide');
    alert.classList.add('show');
}

function hideLoginAlert() {
    const alert = document.getElementById('alertErrorLogin');
    alert.classList.add('hide');
    alert.classList.remove('show');

}