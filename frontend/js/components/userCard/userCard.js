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

    document.getElementById('settingsModal').addEventListener('show.bs.modal', function (event) {
        console.log('Settings Modal is about to be shown');
    });

    document.getElementById('settingsModal').addEventListener('hide.bs.modal', function (event) {
        console.log('Settings Modal is about to be hide')
    });

    document.getElementById('changeEmailLink').addEventListener('click', function() {
        // Hide the current email paragraph
        document.getElementById('currentEmail').classList.add('d-none');
        
        // Show the new email input
        document.getElementById('newEmailInput').classList.remove('d-none');
        
        // Set focus on the new email input
        document.getElementById('newEmailInput').focus();
    });
    // document.getElementById('settingsButton').addEventListener('click', await settings())
    // document.getElementById('settingsButton').addEventListener('click', showSettings)
}


async function showSettings() {
    var modal = new bootstrap.Modal(document.getElementById('settingsModal'));
    modal.show();
    // console.log("SHOW !")
    // var myModal = await new bootstrap.Modal(document.getElementById('settingsModal'), {
    //     keyboard: false,
    //     backdrop: 'static',
    //     focus: true
    // });
    // myModal.show()
}

async function logoutUser() {
    console.log('logout!')
    const logoutResponse = await fetchAuth('POST', 'logout/')
    if (logoutResponse.status == 200) {
        sessionStorage.clear()
        navigateTo('/')
    }
    return ;
}