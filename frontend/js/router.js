// import { showHome } from './pages/home/home.js';
// import { showAbout } from './pages/about/about.js';

// const routes = {
//   '': showHome,
//   'about': showAbout,
//   // Add more routes for additional pages
// };

// function showPage(pageFunction) {
//   pageFunction();
// }

// function navigateTo(route) {
//   window.location.hash = route;
//   handleRoute(route);
// }

// function handleRoute() {
//   const route = window.location.hash.substring(1);
//   const pageFunction = routes[route] || routes['']; // Default to home if route not found
//   showPage(pageFunction);
// }

// document.addEventListener('DOMContentLoaded', () => {
//   handleRoute();

//   const homeButton = document.getElementById('homeButton');
//   homeButton.addEventListener('click', () => navigateTo(''));

//   const aboutButton = document.getElementById('aboutButton');
//   aboutButton.addEventListener('click', () => navigateTo('about'));

//   window.addEventListener('hashchange', handleRoute);
// });

import { showHome } from './pages/home/home.js';
import { showAbout } from './pages/about/about.js';
import { show404 } from './pages/404/404.js';


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
    '/404': show404,
  };
  const pageFunction = routes[path] || routes['/404'];
  showPage(pageFunction);
}

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  handleRoute()
  appContainer.addEventListener('click', (event) => {
    const target = event.target;

    // Check if the clicked element has the 'nav-link' class
    if (target.classList.contains('nav-link')) {
      event.preventDefault();
      const route = target.getAttribute('data-route');
      navigateTo(route);
    }
  });

  window.addEventListener('popstate', handleRoute);
});
