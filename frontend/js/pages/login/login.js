import { loadHTMLPage } from '../../api/fetchData.js';

export async function showLogin() {
    try {
        await loadHTMLPage('./js/pages/login/login.html');

        document.getElementById('loginButton').addEventListener('click', () => {
            login();
        });
    } catch (error) {
        console.error('Error fetching home.html:', error);
    }
}

async function login() {
    const email = document.getElementById('inputEmail').value;
    const password = document.getElementById('inputPassword').value;
    if (!email || !password) {
        alert('Fill the form.');
        return;
    }
    console.log('login with: ', email, password);
}
