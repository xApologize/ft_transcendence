import { fetchAuth, loadHTMLPage } from "../../api/fetchData.js";
import { navigateTo } from "../../router.js";

export async function showCallback() {
    try {
        await loadHTMLPage('./js/pages/callback/callback.html')

        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
    
        const response = await fetchAuth('POST', 'api-auth/', null, { code: code })
        if (response.status >= 200 && response.status < 300) {
            navigateTo('/home')
        } else {
            navigateTo('/')
        }
        const assembleResponse = await response.json()
        console.log(assembleResponse)
    } catch (error) {
        console.error('Error fetching callback.html:', error);
    }
  }