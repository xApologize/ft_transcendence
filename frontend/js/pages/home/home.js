import { fetchUser } from '../../api/fetchData.js';
import { loadHTMLContent } from '../../api/fetchData.js';

export async function showHome() {
  try {
    await loadHTMLContent('./js/pages/home/home.html')
  } catch (error) {
    console.error('Error fetching home.html:', error);
  }
}
