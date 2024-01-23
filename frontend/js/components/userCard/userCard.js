import { fetchAuth, loadHTMLComponent } from "../../api/fetchData.js";
import { navigateTo, handleRoute, checkModal } from "../../router.js";
import { closeAlertAvatar, closeAlertInfo, setupSettings, closeAlert2FA, clearSettings } from "./utils.js";
import { disable2FA, enable2FA, updateMenu2FA, checkConfirmationCode } from "./menu2FA.js";
import { saveAvatar, saveInfo } from "./menuInfo.js";
import interactiveSocket from '../../pages/home/socket.js'
import { World } from "../../pages/game/src/World.js";


export async function userCardComponent() {
    try {
        const userTemplate = await loadHTMLComponent('./js/components/userCard/userCard.html');
        return userTemplate
    } catch (error) {
        console.error('Error fetching userCard:', error);
    }
}

export async function userCardListener() {
    const logoutBtn = document.getElementById('logout');
    if (!logoutBtn) return;
    logoutBtn.addEventListener('click', logoutUser);
    document.getElementById('saveInfo').addEventListener('submit', saveInfo)
    document.getElementById('saveAvatar').addEventListener('click', saveAvatar)
    document.getElementById('userSettingsModal').addEventListener('show.bs.modal', setupSettings)
    document.getElementById('userSettingsModal').addEventListener('hide.bs.modal', clearSettings);
    document.getElementById('disable2FA').addEventListener('click', disable2FA)
    document.getElementById('enable2FA').addEventListener('click', enable2FA)
    document.getElementById('btnErrorAvatar').addEventListener('click', closeAlertAvatar)
    document.getElementById('btnErrorInfo').addEventListener('click', closeAlertInfo)
    document.getElementById('closeAlert2FA').addEventListener('click', closeAlert2FA)
    document.getElementById('2FAForm').addEventListener('submit', checkConfirmationCode)
    settingsListener()
}


function settingsListener() {
    document.querySelectorAll('.left-column-settings i').forEach(function(icon) {
            icon.addEventListener('click', function() {
            document.querySelectorAll('.left-column-settings i').forEach(function(icon) {
                icon.classList.remove('active');
            });
            icon.classList.add('active');
            document.querySelectorAll('.right-column-settings .collapse').forEach(function(menu) {
                menu.classList.remove('show');
            });
            const targetMenuId = icon.getAttribute('data-bs-target').substring(1);
            const targetMenu = document.getElementById(targetMenuId);
            targetMenu.classList.add('show');
        });
    });

}

export async function logoutUser() {
    const logoutResponse = await fetchAuth('POST', 'logout/')
    if (!logoutResponse) { return }
    if (logoutResponse.status == 200) {
        if (World._instance)
		    World._instance.forceQuit();
        checkModal()
        sessionStorage.clear()
        navigateTo('/')
    }
    return ;
}


// Called in home.js
export async function displayUserCard(meUser) {
    let userContainer = document.getElementById('own-user-card');
    userContainer.innerHTML = ''

    let userCard = await userCardComponent();
    userContainer.appendChild(userCard);
    userCardListener();
    updateMenu2FA(meUser);
    updateUserCard(meUser);
}

export function updateUserCard(userObject) {
    if (userObject.avatar) {
        const profilePicture = document.getElementById('avatar-img');
        profilePicture.src = userObject.avatar;
    }

    if (userObject.nickname) {
        const nicknameElement = document.getElementById('nickname');
        nicknameElement.innerText = userObject.nickname;
    }

    const winsElement = document.getElementById('wins');
    const lossesElement = document.getElementById('losses');
    const gamesPlayedElement = document.getElementById('game-played');

    winsElement.innerText = userObject.won_matches.length;
    lossesElement.innerText = userObject.lost_matches.length;
    gamesPlayedElement.innerText = userObject.played_matches.length;
}
