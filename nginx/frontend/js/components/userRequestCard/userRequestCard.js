import { loadHTMLComponent } from '../../api/fetchData.js';

export async function userRequestCardComponent() {
  try {
    const userRequestCard = await loadHTMLComponent('./js/components/userRequestCard/userRequestCard.html');
    return userRequestCard
  } catch (error) {
    console.error('Error fetching userRequestCardComponent:', error);
  }
}
