import { fetchAuth, loadHTMLComponent } from "../../api/fetchData.js";
import { navigateTo } from "../../router.js";

export async function userCardComponent() {
    try {
        const userTemplate = await loadHTMLComponent('./js/components/userCard/userCard.html');
        return userTemplate
    } catch (error) {
        console.error('Error fetching userCard:', error);
    }
}

export async function userCardListener() {
    document.getElementById('logout').addEventListener('click', async () => {
        await logoutUser()
    })
}

async function logoutUser() {
    console.log('logout!')
    const logoutResponse = await fetchAuth('post', 'logout/')
    if (logoutResponse.status == 200) {
        sessionStorage.clear()
        navigateTo('/')
    }
    // window.location.replace('/login')
    
    return ;
}