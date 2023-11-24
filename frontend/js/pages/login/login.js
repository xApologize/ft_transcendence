import { loadHTMLPage } from '../../api/fetchData.js';
import { navigateTo } from '../../router.js';

export async function showLogin() {
    try {
        await loadHTMLPage('./js/pages/login/login.html');
        console.log(document.getElementById('signUpLink'));
        document.getElementById('loginButton').addEventListener('click', () => {
            console.log('please work');
            login();
        });
        document
            .getElementById('signUpButton')
            .addEventListener('click', () => {
                navigateTo('/signUp');
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
