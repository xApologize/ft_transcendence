import { loadHTMLPage } from '../../api/fetchData.js';
export async function showFirewall() {
    await loadHTMLPage('./js/pages/firewall/firewall.html');
}
