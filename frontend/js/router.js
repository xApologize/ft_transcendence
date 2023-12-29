import { showHome } from './pages/home/home.js';
import { showUser } from './pages/user/user.js';
import { showGame } from './pages/game/game.js';
import { showAbout } from './pages/about/about.js';
import { showSignUp } from './pages/signUp/signUp.js';
import { show404 } from './pages/404/404.js';
import { showLogin } from './pages/login/login.js';
import { templateComponent } from './components/template/template.js';
import { showSocket } from './pages/socket/debug_socket.js';
import { showCallback } from './pages/callback/callback.js';
import interactiveSocket from './pages/home/socket.js'

const routes = {
    '/': showLogin,
    '/home': showHome,
    '/about': showAbout,
    '/game_page': showGame,
    '/user': showUser,
    '/login': showLogin,
    '/signUp': showSignUp,
    '/socket': showSocket,
    '/callback': showCallback,
};

function showPage(pageFunction) {
    pageFunction();
}

export function navigateTo(route) {
    history.pushState({ route: route }, null, route);
    handleRoute();
}

export async function checkIfCookie() {
    const accessTokenLive = sessionStorage.getItem('jwt');
    const options = {
        method: 'GET',
        credentials: 'include',
        headers: {
            ...(accessTokenLive ? { jwt: `${accessTokenLive}` } : {}),
        },
    };
    const tokenResponse = await fetch('/api/auth/token/', options);
    return tokenResponse;
}

export function handleRoute() {
    let pageFunction = null;
    let goPath = window.location.pathname;
    // make this work properly with the history
    // if (goPath == '/home') {
    //     let cookieResponse = await checkIfCookie();
    //     if (cookieResponse.status == 401) {
    //         goPath = '/';
    //     }
    // }

    if (routes[goPath]) {
        pageFunction = routes[goPath];
    } else {
        pageFunction = show404;
    }
    showPage(pageFunction);
}

function handlePopState(event) {
    checkAllModal();
    handleRoute();
    interactiveSocket.closeSocket();
}

function disposeModal(modalId) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
            modalInstance.dispose();
        }
    }
}

function checkAllModal() {
    const modals = [
        'userSettingsModal',
        'twoFAModal',
        'otherUserInfo',
        'inviteGameModal',
        'socialModal'
    ];

    modals.forEach(disposeModal);
}

async function loadPage() {
    const body = document.getElementById('content');
    const template = await templateComponent();

    body.append(template);
    handleRoute();
}

window.addEventListener('beforeunload', () => {
    sessionStorage.clear();
    localStorage.clear();
})

document.addEventListener('DOMContentLoaded', async () => {
    loadPage();
    window.addEventListener('popstate', handlePopState);
    window.addEventListener("visibilitychange", async function() {
        if (document.visibilityState === 'visible' && window.location.pathname == '/home') {
            if (interactiveSocket.isSocketClosed()) {
                showHome();
            }
        }
    });
});
