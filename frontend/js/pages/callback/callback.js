import { fetchAuth, loadHTMLPage } from "../../api/fetchData.js";
import { navigateTo } from "../../router.js";
import { showLogin } from "../login/login.js";
import { assembler } from "../../api/assembler.js";

export async function showCallback() {
    try {
        await loadHTMLPage('./js/pages/callback/callback.html')

        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
    
        const response = await fetchAuth('POST', 'api-auth/', null, { code: code })
        const assemble = await assembler(response)
        console.log(assemble)
        if (response.status >= 200 && response.status < 300) {
            if (assemble['2fa_required'] === true) {
                await showLogin();
                const modal2FA = bootstrap.Modal.getInstance(document.getElementById('twoFAModal'))
                modal2FA.show();
            } else {
                navigateTo('/home')
            }
        } else {
            await showLogin('/')
        }
    } catch (error) {
        console.error('Error fetching callback.html:', error);
    }
  }