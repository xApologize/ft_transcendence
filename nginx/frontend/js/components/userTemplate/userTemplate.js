import { loadHTMLComponent } from '../../api/fetchData.js';

export async function userTemplateComponent() {
    try {
        const userTemplate = await loadHTMLComponent(
            './js/components/userTemplate/userTemplate.html'
        );
        return userTemplate;
    } catch (error) {
        console.error('Error fetching userTemplateComponent:', error);
    }
}
