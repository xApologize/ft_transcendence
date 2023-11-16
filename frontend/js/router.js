import { showHome } from './pages/home/home.js';
import { showUser } from './pages/user/user.js';
import { showGame } from './pages/game/game.js';
import { showAbout } from './pages/about/about.js';
import { show404 } from './pages/404/404.js';
import { showLogin } from './pages/login/login.js';
import { headerComponent } from './components/header/header.js'
import { templateComponent } from './components/template/template.js';
import { securityUnload } from './pages/home/gameModal.js'

// Not currently use
var currentRoute = "";

function showPage(pageFunction) {
  pageFunction();
}

function navigateTo(route) {
  if (route === currentRoute)
    return ;

  const eventData = { route: route };
  history.pushState(eventData, null, route);

  const popstateEvent = new CustomEvent('popstate', { detail: eventData });
  window.dispatchEvent(popstateEvent);

  handleRoute();
}

function handleRoute() {
  var pageFunction = null;

  const path = window.location.pathname;
  const routes = {
    '/': showHome,
    '/about': showAbout,
    '/game_page': showGame,
    '/user': showUser,
    '/login': showLogin,
    '/game': null, // redirect to home ? Regarder si il est dans une partie ?
  };
  if (routes[path]) {
    pageFunction = routes[path]
    currentRoute = path
  } else {
    pageFunction = show404
  }
  showPage(pageFunction);
}

// !! Do not change the order in which it's append !!
async function loadPage() {
  const body = document.getElementById('content');
  const header = await headerComponent();
  const template = await templateComponent()
  // const footer = await footerComponent()

  body.append(header)
  body.append(template)
  handleRoute();
}

function isPathGame() {
  if (window.location.pathname == '/game') {
    history.replaceState({ route: '/' }, null, '/')
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  isPathGame()
  await loadPage()

  const navContainer = document.getElementById('navbar');
  navContainer.addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('nav-link')) {
      event.preventDefault();
      const route = target.getAttribute('data-route');
      navigateTo(route);
    }
  });

  window.addEventListener('popstate', handlePopState);
});

function handlePopState(event) {
  const poppedState = history.state;
  if (event.detail) {
    console.log('Popstate event triggered manually for the game, Detail:', event.detail);
    return ;
  }

  if (poppedState && poppedState.route == '/') {
    const backdrop = document.querySelector('.modal-backdrop')
    if (backdrop) {
      backdrop.remove()
    }
    window.removeEventListener('beforeunload', securityUnload)
    history.replaceState({ route: '/' }, null, '/')
  } else {
    console.log('Popstate event triggered by browser arrow navigation');
  }
  handleRoute();
}
