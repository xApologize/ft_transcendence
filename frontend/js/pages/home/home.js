import { loadHTMLPage } from '../../api/fetchData.js';

export async function showHome() {
  try {
    await loadHTMLPage('./js/pages/home/home.html')
  } catch (error) {
    console.error('Error fetching home.html:', error);
  }
}
