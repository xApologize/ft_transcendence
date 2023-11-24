import { loadHTMLPage } from '../../api/fetchData.js';
import { navigateTo } from '../../router.js'
import { fetchLogin } from '../../api/fetchData.js';

export async function showLogin() {
    try {
        await loadHTMLPage('./js/pages/login/login.html');
        console.log(document.getElementById('signUpLink'));
        document.getElementById('loginButton').addEventListener('click', () => {
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
    
    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;
    
    if (!username || !password) {
        alert('Fill the form.');
        return;
    }
    console.log('login with: ', username, password);
    const loginData = {
        username: username,
        password: password,
    };
    
    try {
        const response = await fetchLogin('POST', loginData);
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                console.log('Login successful: ', result.success);
            } else {
                console.log('Login failed: ', result.error);
            }
        } else {
            console.log('Login failed.');
        }
        console.log('Response Status:', result.status);
    } catch (error) {
        console.error('Error during login:', error);
    }
}
