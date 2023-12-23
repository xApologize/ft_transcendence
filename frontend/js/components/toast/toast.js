import { loadHTMLComponent } from '../../api/fetchData.js';

export async function toastComponent() {
  try {
    const template = await loadHTMLComponent('./js/components/toast/toast.html');
    return template
  } catch (error) {
    console.error('Error fetching toastComponent:', error);
  }
}
