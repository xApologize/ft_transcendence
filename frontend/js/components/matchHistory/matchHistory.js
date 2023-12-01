import { loadHTMLComponent } from '../../api/fetchData.js';

export async function matchHistoryComponent() {
    try {
        const matchHistoryTemplate = await loadHTMLComponent(
            './js/components/matchHistory/matchHistory.html'
        );
        return matchHistoryTemplate;
    } catch (error) {
        console.error('Error fetching matchHistory:', error);
    }
}
