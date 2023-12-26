import { fetchAuth, loadHTMLPage } from "../../api/fetchData.js";

export async function showCallback() {
    try {
        await loadHTMLPage('./js/pages/callback/callback.html')

        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
    
        const response = await fetchAuth('POST', 'api-auth/', null, { code: code })
        console.log(await response.text())
    } catch (error) {
        console.error('Error fetching callback.html:', error);
    }
  }