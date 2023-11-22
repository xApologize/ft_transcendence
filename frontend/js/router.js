import { showHome } from './pages/home/home.js';
import { showUser } from './pages/user/user.js';
import { showGame } from './pages/game/game.js';
import { showAbout } from './pages/about/about.js';
import { show404 } from './pages/404/404.js';
import { showLogin } from './pages/login/login.js';
import { showSignUp } from './pages/signUp/signUp.js'
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
    const template = await templateComponent();
    // const footer = await footerComponent()

  body.append(header)
  body.append(template)
  const path = window.location.pathname;
  navigateTo(path)
}

// This 'if' will be trigger when going directly to /game OR refresh when inside a game
// Check if he currently is in a game?
// Redirect to home if not ? Too complicated with socket ?
// function isPathGame() {
//   if (window.location.pathname == '/game') {
//     history.replaceState({ GoingTo: '/' }, null, '/')
//   }
// }

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
    handleRoute();
}
