import { loadHTMLComponent } from '../../api/fetchData.js';

export async function headerComponent() {
  try {
    const header = await loadHTMLComponent('./js/components/header/header.html');
    return header
  } catch (error) {
    console.error('Error fetching headerComponent:', error);
  }
}
