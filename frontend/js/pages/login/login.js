import { loadHTMLPage } from '../../api/fetchData.js';

export async function showLogin() {
    try {
        await loadHTMLPage('./js/pages/login/login.html');
        console.log(document.getElementById('signUpLink'));
        document.getElementById('loginButton').addEventListener('click', () => {
            console.log('please work');
            login();
        });
        // document
        //     .getElementById('signUpButton')
        //     .addEventListener('click', () => {
        //         navigateTo('/signUp');
        //     });
    } catch (error) {
        console.error('Error fetching home.html:', error);
    }
}

async function login() {
    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;
    if (!username || !password) {
        alert('Fill the form.');
        return;
    }
    console.log('login with: ', username, password);
}
