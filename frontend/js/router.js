import { showHome } from './pages/home/home.js';
import { showUser } from './pages/user/user.js';
import { showAbout } from './pages/about/about.js';
import { show404 } from './pages/404/404.js';
import { showLogin } from './pages/login/login.js';
import { headerComponent } from './components/header/header.js'

function showPage(pageFunction) {
  pageFunction();
}

function navigateTo(route) {
  history.pushState(null, null, route);
  handleRoute();
}

function handleRoute() {
  const path = window.location.pathname;
  const routes = {
    '/': showHome,
    '/about': showAbout,
    '/user': showUser,
    '/login': showLogin,
  };
  const pageFunction = routes[path] || show404;
  showPage(pageFunction);
}

async function loadPage(navContainer) {
  headerComponent(navContainer)
  handleRoute()
}

// Load the page at first launch.
// will listen at everything that has the class "nav-link" in <nav> in index.html
document.addEventListener('DOMContentLoaded', () => {
  const navContainer = document.getElementById('navbar');
  loadPage(navContainer.id)

  navContainer.addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('nav-link')) {
      event.preventDefault();
      const route = target.getAttribute('data-route');
      navigateTo(route);
    }
  });

  window.addEventListener('popstate', handleRoute);
});
