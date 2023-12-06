import { loadHTMLPage } from '../../api/fetchData.js';
import { navigateTo } from '../../router.js'
import { fetchAuth } from '../../api/fetchData.js';

export async function showLogin() {
    try {
        await loadHTMLPage('./js/pages/login/login.html');
        // sessionStorage.clear()
        document.getElementById('loginButton').addEventListener('click', async () => {
            await login();
        });
        document
            .getElementById('signUpButton')
            .addEventListener('click', () => {
                navigateTo('/signUp');
            });
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
    const usernameInput = username !== null ? username : document.getElementById('usernameInput').value;
    const passwordInput = password !== null ? password : document.getElementById('passwordInput').value;

    if (!usernameInput || !passwordInput) {
        alert('Fill the form.');
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
        const result = await response.json();
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
}
