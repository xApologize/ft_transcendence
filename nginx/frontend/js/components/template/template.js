import { loadHTMLComponent } from '../../api/fetchData.js';

export async function templateComponent() {
  try {
    const template = await loadHTMLComponent('/js/components/template/template.html');
    return template
  } catch (error) {
    console.error('Error fetching templateComponent:', error);
  }
}
