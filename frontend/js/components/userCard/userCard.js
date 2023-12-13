import { fetchAuth, fetchUpload, fetchUser, loadHTMLComponent } from "../../api/fetchData.js";
import { navigateTo } from "../../router.js";
import { closeAlertAvatar, closeAlertInfo, setupSettings, removeAllAlerts, noChangeMadeAlert } from "./utils.js";

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
    document.getElementById('btnErrorAvatar').addEventListener('click', closeAlertAvatar)
    document.getElementById('btnErrorInfo').addEventListener('click', closeAlertInfo)

    settingsListener()
}

async function displayAlertStatus(response, type) {
    const alert = document.getElementById('alertError' + type);
    const alertText = document.getElementById('messageError' + type);

    let message =  await response.text();
    removeAllAlerts(alert);
    if (response.status == 200) {
        alert.classList.add('alert-success');
        message = "Your " + type + " has been updated"
    } else {
        alert.classList.add('alert-danger');
    }

    if (response.status == 413) {
        alert.classList.add('alert-danger');
        message = "File is too big, max size is 1MB"
    }
    alert.classList.remove('hide');
    alert.classList.add('show');
    alertText.textContent = message
}


async function saveAvatar() {
    const formData = new FormData();
    const avatarInput = document.getElementById('avatarInput').files[0];
    if (avatarInput) {
        console.log("APPEND AVATAR")
        formData.append('avatar', avatarInput);
    }
    if (formData.has('avatar')) {
        const response = await fetchUpload('POST', formData);
        if (!response) { return }
        displayAlertStatus(response, 'Avatar')
    } else {
        noChangeMadeAlert('messageErrorAvatar', 'alertErrorAvatar');
    }
}


async function saveInfo() {
    const objectData = new Object();

    const nicknameInput = document.getElementById('nicknameInput').value;
    const userNickname = document.getElementById('nickname').innerText;
    if (userNickname != nicknameInput) {
        console.log("APPEND NICKNAME")
        objectData.nickname = nicknameInput;
    }
    const emailInput = document.getElementById('emailInput').value;
    const userEmail = document.getElementById('email').innerText;
    if (userEmail != emailInput) {
        console.log("APPEND EMAIL")
        objectData.email = emailInput;
    }

    if (Object.keys(objectData).length > 0) {
        const response = await fetchUser('PATCH', null, objectData);
        if (!response) { return }
        displayAlertStatus(response, 'Info')
    } else {
        noChangeMadeAlert('messageErrorInfo', 'alertErrorInfo');
    }
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