import { showHome } from './pages/home/home.js';
import { showSignUp } from './pages/signUp/signUp.js';
import { showFirewall } from './pages/firewall/firewall.js';
import { show404 } from './pages/404/404.js';
import { showLogin } from './pages/login/login.js';
import { templateComponent } from './components/template/template.js';
import { showCallback } from './pages/callback/callback.js';
import interactiveSocket from './pages/home/socket.js'
import { fetchIsToken } from './api/fetchData.js';

const routes = {
    '/': showLogin,
    '/home': showHome,
    '/login': showLogin,
    '/signUp': showSignUp,
    '/firewall': showFirewall,
    '/callback': showCallback,
};

function showPage(pageFunction) {
    pageFunction();
}

export function navigateTo(route) {
    history.pushState({ route: route }, null, route);
    handleRoute();
}

export async function handleRoute() {
    let pageFunction = null;
    let goPath = window.location.pathname;
    
    // make this work properly with the history
    if (goPath == '/home') {
        let cookieResponse = await fetchIsToken();
        if (!cookieResponse) {
            goPath = '/';
        }
    }

    if (routes[goPath]) {
        pageFunction = routes[goPath];
    } else {
        pageFunction = show404;
    }
    showPage(pageFunction);
}

function handlePopState(event) {
    checkModal();
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

export function checkModal(modalToClose = null) {
    const modals = [
        'userSettingsModal',
        'twoFAModal',
        'otherUserInfo',
        'inviteGameModal',
        'socialModal',
        'gameMenuModal',
        'inviteTournamentModal',
        'lobbyTournamentModal',
        'joinTournamentModal',
        'createTournamentModal',
    ];

    if (modalToClose) {
        disposeModal(modalToClose);
    } else {
        modals.forEach(disposeModal);
    }
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
});

document.addEventListener('DOMContentLoaded', async () => {
    loadPage();
    window.addEventListener('popstate', handlePopState);
    window.addEventListener("visibilitychange", function() {
        if (document.visibilityState === 'visible' && window.location.pathname == '/home') {
            if (interactiveSocket.isSocketClosed()) {
                checkModal();
                showHome();
            }
        }
    });
});
