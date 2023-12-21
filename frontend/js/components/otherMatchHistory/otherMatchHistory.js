import { loadHTMLComponent } from '../../api/fetchData.js';

export async function otherMatchHistoryComponent() {
    try {
        const userTemplate = await loadHTMLComponent(
            './js/components/otherMatchHistory/otherMatchHistory.html'
        );
        return userTemplate;
    } catch (error) {
        console.error('Error fetching userTemplateComponent:', error);
    }
}
