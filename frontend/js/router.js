import { showHome } from './pages/home/home.js';
import { showUser } from './pages/user/user.js';
import { showGame } from './pages/game/game.js';
import { showAbout } from './pages/about/about.js';
import { show404 } from './pages/404/404.js';
import { showLogin } from './pages/login/login.js';
import { headerComponent } from './components/header/header.js'
import { templateComponent } from './components/template/template.js';

// Not currently use
var currentRoute = "";

function showPage(pageFunction) {
  pageFunction();
}

function navigateTo(route) {
  if (route == currentRoute)
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
    '/game': showGame,
    '/user': showUser,
    '/login': showLogin,
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

document.addEventListener('DOMContentLoaded', async () => {
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
  // Check if event.detail is present, indicating a manually triggered popstate event
  if (event.detail) {
    console.log('Popstate event triggered manually, Detail:', event.detail);
  } else {
    console.log('Popstate event triggered by browser navigation');
    handleRoute();
  }
}
