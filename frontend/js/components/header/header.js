import { loadHTMLComponent } from '../../api/fetchData.js';

export async function headerComponent(navContainer) {
  try {
    await loadHTMLComponent(navContainer, './js/components/header/header.html')
  } catch (error) {
    console.error('Error fetching headerComponent:', error);
  }
}
