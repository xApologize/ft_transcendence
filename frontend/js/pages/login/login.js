import { loadHTMLPage } from '../../api/fetchData.js';
import { navigateTo } from '../../router.js'
import { fetchAuth } from '../../api/fetchData.js';
import { displayAlertMsg } from '../../utils/utilityFunctions.js';


let modal2FA
export async function showLogin() {
    try {
        await loadHTMLPage('./js/pages/login/login.html');

        modal2FA = new bootstrap.Modal(document.getElementById('twoFAModal'))

        document
        .getElementById('login-form')
        .addEventListener('submit', function (event) {
            event.preventDefault();
            login();
        });

        document
        .getElementById('signUpButton')
        .addEventListener('click', () => {
            navigateTo('/signUp');
        });

        document
        .getElementById('btnAlertCloseLogin')
        .addEventListener('click', hideLoginAlert)

        document
        .getElementById('demo-user-btn')
        .addEventListener('click', () => {
            login("demo-user", "demo-user");
        });

        document
        .getElementById('demo-user-btn2')
        .addEventListener('click', () => {
            login("demo-user2", "demo-user2");
        });

        document
        .getElementById('submit2FACode')
        .addEventListener('click', submit2FACode);

        document
        .getElementById('close2FAModal')
        .addEventListener('click', close2FAModal)
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
        const result = await response.json();
        if (response.ok) {
            if (result['2fa_required']) {
                modal2FA.show()
                return ; 
            }
            navigateTo('/home');
        } else {
            displayLoginError(result)
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
}

async function submit2FACode(result) {
    const code = document.getElementById('2faCodeInput').value
    const response = await fetchAuth('POST', 'login2fa/', {'otp_token': code})
    if (!response) { return } // @TODO: handle error bc no token so not suppose to throw 401
    const data = await response.json();
    if (response.status == 200) {
        modal2FA.hide()
        navigateTo('/home');
    } else if (response.status == 400) {
        document.getElementById("2FAErrorMsg").textContent = data.error; 
    } else if (response.status == 404 || response.status == 409) {
        modal2FA.hide()
        displayLoginError(data)
    } else {
        modal2FA.hide()
        displayLoginError({'error': "An error occured. Please try again."})
    }

}

function close2FAModal() {
    modal2FA.hide()
    const error = {'error': '2FA Authentication interrupted. Please try again.'};
    displayLoginError(error)
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