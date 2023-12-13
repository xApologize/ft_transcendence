import { loadHTMLPage } from '../../api/fetchData.js';
export async function showAbout() {
    await loadHTMLPage('./js/pages/about/about.html');
    // const contentContainer = document.getElementById('contentContainer');
    // contentContainer.innerHTML = '<h2>Learn more about us on the About Page.</h2>';
}
