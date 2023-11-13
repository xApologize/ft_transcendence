import { loadHTMLContent } from '../../api/fetchData.js';

export async function showLogin() {
  try {
    await loadHTMLContent('./js/pages/login/login.html')
  } catch (error) {
    console.error('Error fetching home.html:', error);
  }
}
