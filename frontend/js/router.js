import { showHome } from './pages/home/home.js';
import { showUser } from './pages/user/user.js';
import { showGame } from './pages/game/game.js';
import { showAbout } from './pages/about/about.js';
import { showSignUp } from './pages/signUp/signUp.js';
import { show404 } from './pages/404/404.js';
import { showLogin } from './pages/login/login.js';
import { headerComponent } from './components/header/header.js';
import { templateComponent } from './components/template/template.js';
import { showSocket } from './pages/socket/debug_socket.js';

var currentRoute = '';
const routes = {
    '/': showLogin,
    '/home': showHome,
    '/about': showAbout,
    '/game_page': showGame,
    '/user': showUser,
    '/login': showLogin,
    '/signUp': showSignUp,
    '/socket': showSocket,
};

function showPage(pageFunction) {
    pageFunction();
}

export function navigateTo(route) {
    // console.log("navigateTo!")
    if (route === currentRoute) return;
    console.log("PUSH STATE")
    history.pushState({ route: route }, null, route);
    handleRoute();
}

export async function checkIfCookie() {
    var accessTokenLive = sessionStorage.getItem('jwt');
    var options = {
        method: 'GET',
        credentials: 'include',
        headers: {
            ...(accessTokenLive ? { jwt: `${accessTokenLive}` } : {}),
        },
    };
    const tokenResponse = await fetch('/api/auth/token/', options);
    return tokenResponse;
}

export async function handleRoute() {
    var pageFunction = null;
    var goPath = window.location.pathname;
    // make this work properly with the history
    if (goPath == '/home') {
        var cookieResponse = await checkIfCookie();
        if (cookieResponse.status == 401) {
            // history.pushState(null, null, '/');
            goPath = '/';
        }
    }

    if (routes[goPath]) {
        pageFunction = routes[goPath];
    } else {
        pageFunction = show404;
    }
    currentRoute = goPath;
    showPage(pageFunction);
}

// !! Do not change the order in which it's append !!
async function loadPage() {
    const body = document.getElementById('content');
    const header = await headerComponent();
    const template = await templateComponent();

    // body.append(header);
    body.append(template);
    const path = window.location.pathname;
    navigateTo(path);
}

window.addEventListener('beforeunload', () => {
    sessionStorage.clear();
    localStorage.clear();
})

document.addEventListener('DOMContentLoaded', async () => {
    await loadPage();

    // const navContainer = document.getElementById('navbar');
    // navContainer.addEventListener('click', (event) => {
    //     const target = event.target;
    //     if (target.classList.contains('nav-link')) {
    //         event.preventDefault();
    //         const route = target.getAttribute('data-route');
    //         navigateTo(route);
    //     }
    // });

    window.addEventListener('popstate', handlePopState);
});

function handlePopState(event) {
    checkAllModal();
    handleRoute();
}

function checkAllModal() {
    const settingsModal = document.getElementById('userSettingsModal');
    if (settingsModal) {
        const modalInstance = bootstrap.Modal.getInstance(settingsModal);
        if (modalInstance) {
            modalInstance.dispose();
        }
    }

    const twoAuthModal = document.getElementById('twoFAModal');
    if (twoAuthModal) {
        const modalInstance = bootstrap.Modal.getInstance(twoAuthModal);
        if (modalInstance) {
            modalInstance.dispose();
        }
    }

    const otherUsersModal = document.getElementById('otherUserInfo');
    if (otherUsersModal) {
        const modalInstance = bootstrap.Modal.getInstance(otherUsersModal);
        if (modalInstance) {
            modalInstance.dispose();
        }
    }

    const inviteModal = document.getElementById('inviteGameModal');
    if (inviteModal) {
        const modalInstance = bootstrap.Modal.getInstance(inviteModal);
        if (modalInstance) {
            modalInstance.dispose();
        }
    }

    const socialModal = document.getElementById('socialModal');
    if (socialModal) {
        const modalInstance = bootstrap.Modal.getInstance(socialModal);
        if (modalInstance) {
            modalInstance.dispose();
        }
    }
    // Close all other modals, one by one, id by id...

}
