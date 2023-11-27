import { loadHTMLComponent } from "../../api/fetchData.js";

export async function userCardComponent() {
    try {
        const userTemplate = await loadHTMLComponent('./js/components/userCard/userCard.html');
        return userTemplate
    } catch (error) {
        console.error('Error fetching userCard:', error);
    }
}