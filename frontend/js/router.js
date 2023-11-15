import { showHome } from './pages/home/home.js';
import { showUser } from './pages/user/user.js';
import { showGame } from './pages/game/game.js';
import { showAbout } from './pages/about/about.js';
import { show404 } from './pages/404/404.js';
import { showLogin } from './pages/login/login.js';
import { headerComponent } from './components/header/header.js'
import { templateComponent } from './components/template/template.js';

var currentRoute;

function showPage(pageFunction) {
  pageFunction();
}

function navigateTo(route) {
  history.pushState(null, null, route);
  handleRoute();
}

function handleRoute() {
  var pageFunction = "";

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

function handlePopState() {
  const gameModal = document.getElementById('gameModal');
  if (gameModal && gameModal.classList.contains('show')) {
    console.log('here');
    // gameModal.classList.remove('show');
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop)
      backdrop.remove()
  }
  handleRoute();
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

// Load the page at first launch.
// will listen at everything that has the class "nav-link" in <nav> in index.html
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

