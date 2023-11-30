import { showHome } from './pages/home/home.js';
import { showUser } from './pages/user/user.js';
import { showGame } from './pages/game/game.js';
import { showAbout } from './pages/about/about.js';
import { showSignUp } from './pages/signUp/signUp.js';
import { show404 } from './pages/404/404.js';
import { showLogin } from './pages/login/login.js';
import { headerComponent } from './components/header/header.js';
import { templateComponent } from './components/template/template.js';
import { GameModal } from './pages/home/gameModal.js';

// Not currently use
var currentRoute = '';

function showPage(pageFunction) {
    pageFunction();
}

export function navigateTo(route) {
  if (route === currentRoute)
    return ;
  history.pushState({ GoingTo: route}, null, route);
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
    '/signUp': showSignUp,
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
    const template = await templateComponent();
    // const footer = await footerComponent()

  body.append(header)
  body.append(template)
  const path = window.location.pathname;
  navigateTo(path)
}


document.addEventListener('DOMContentLoaded', async () => {
  // isPathGame()
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
  closeModal()
  handleRoute();
}

function closeModal() {
  const modal = document.getElementById("playModal");
  if (modal) {
    if (modal.classList.contains("show")) {
      modal.classList.remove("show");
      document.body.classList.remove("modal-open");
      const backdrop = document.querySelector(".modal-backdrop");
      if (backdrop) {
        backdrop.remove();
      }
    }
  }
}