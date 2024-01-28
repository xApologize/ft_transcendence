import { showHome } from '/js/pages/home/home.js';
import { showSignUp } from '/js/pages/signUp/signUp.js';
import { showFirewall } from '/js/pages/firewall/firewall.js';
import { showLogin } from '/js/pages/login/login.js';
import { templateComponent } from '/js/components/template/template.js';
import { showCallback } from '/js/pages/callback/callback.js';
import interactiveSocket from '/js/pages/home/socket.js'
import { fetchIsToken } from '/js/api/fetchData.js';
import { disposeModal, showModal, hideModal } from '/js/pages/home/utils.js';

let currentPath;
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
        pageFunction = showLogin;
    }
    currentPath = goPath;
    showPage(pageFunction);
}

function closeAndHandleRoute() {
    checkModal(true);
    handleRoute();
    interactiveSocket.closeSocket();
}

function handlePopState(event) {
    checkModal();
    showModal('loadingModal');

    const specialPathnames = ['/', '/login', '/signUp'];
    const pathname = window.location.pathname;
    if (specialPathnames.includes(pathname) && currentPath === '/home') {
        setTimeout(closeAndHandleRoute, 1000);
    } else {
        closeAndHandleRoute();
    }
}
export function checkModal(deleteModal = false) {
    const modals = [
        'lobbyTournamentModal',
        'userSettingsModal',
        'twoFAModal',
        'otherUserInfo',
        'inviteGameModal',
        'socialModal',
        'gameMenuModal',
        'joinTournamentModal',
        'createTournamentModal',
        'tournamentInfoModal',
        'loadingModal'
    ];

    if (deleteModal) {
        modals.forEach(disposeModal);
    } else {
        modals.forEach(hideModal);
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
                checkModal(true);
                showHome();
            }
        }
    });
});
