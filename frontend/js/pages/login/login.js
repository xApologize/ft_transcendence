import { loadHTMLPage } from '../../api/fetchData.js';
import { navigateTo } from '../../router.js'
import { fetchLogin } from '../../api/fetchData.js';

export async function showLogin() {
    try {
        await loadHTMLPage('./js/pages/login/login.html');
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
    const loginData = {
        username: username,
        password: password,
    };
    
    // Response status:
    // 404: User not found
    // 400: User found but bad password -> will definitely change
    // 200: Login successfull

    try {
        const response = await fetchLogin('POST', loginData);
        const result = await response.json();
        if (response.ok) {
            if (result.success) {
                console.log('Login successful: ', await result.success);
            } else {
                console.log('Login failed: ', await result.error);
            }
        } else {
            console.log('Login failed.');
        }
        console.log('Response Status:', await response.status);
    } catch (error) {
        console.error('Error during login:', error);
    }
}
