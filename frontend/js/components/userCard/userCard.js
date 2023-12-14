import { fetchAuth, fetchUpload, fetchUser, loadHTMLComponent } from "../../api/fetchData.js";
import { navigateTo } from "../../router.js";
import { closeAlertAvatar, closeAlertInfo, setupSettings, closeAlert2FA } from "./utils.js";
import { disable2FA, enable2FA, updateMenu2FA } from "./menu2FA.js";
import { saveAvatar, saveInfo, displayAlertStatus } from "./menuInfo.js";


export async function userCardComponent() {
    try {
        const userTemplate = await loadHTMLComponent('./js/components/userCard/userCard.html');
        return userTemplate
    } catch (error) {
        console.error('Error fetching userCard:', error);
    }
}

export async function userCardListener() {
    document.getElementById('logout').addEventListener('click', logoutUser)
    document.getElementById('saveInfo').addEventListener('click', saveInfo)
    document.getElementById('saveAvatar').addEventListener('click', saveAvatar)
    document.getElementById('userSettingsModal').addEventListener('show.bs.modal', setupSettings)
    document.getElementById('userSettingsModal').addEventListener('hide.bs.modal', function (event) {
        console.log('Settings Modal is about to be hide')
        document.getElementById('avatarInput').value = ''
        
    });
    document.getElementById('disable2FA').addEventListener('click', disable2FA)
    document.getElementById('enable2FA').addEventListener('click', enable2FA)
    document.getElementById('btnErrorAvatar').addEventListener('click', closeAlertAvatar)
    document.getElementById('btnErrorInfo').addEventListener('click', closeAlertInfo)
    document.getElementById('closeAlert2FA').addEventListener('click', closeAlert2FA)

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

async function logoutUser() {
    console.log('logout!')
    const logoutResponse = await fetchAuth('POST', 'logout/')
    if (logoutResponse.status == 200) {
        sessionStorage.clear()
        navigateTo('/')
    }
    return ;
}


// Call in home.js
export async function displayUserCard(meUser) {
    let userContainer = document.getElementById('own-user-card');

    let userCard = await userCardComponent();
    userContainer.appendChild(userCard);
    userCardListener(); // enable js on the userCard
    updateMenu2FA(meUser);
    updateUserCard(meUser);
}

function updateUserCard(userObject) {
    const profilePicture = document.getElementById('avatar-img');
    profilePicture.src = userObject.avatar;

    const nicknameElement = document.getElementById('nickname');
    nicknameElement.innerText = userObject.nickname;

    const emailElement = document.getElementById('email');
    emailElement.innerText = userObject.email;

    const winsElement = document.getElementById('wins');
    const lossesElement = document.getElementById('losses');
    const gamesPlayedElement = document.getElementById('game-played');

    winsElement.innerText = userObject.won_matches.length;
    lossesElement.innerText = userObject.lost_matches.length;
    gamesPlayedElement.innerText = userObject.played_matches.length;
}
