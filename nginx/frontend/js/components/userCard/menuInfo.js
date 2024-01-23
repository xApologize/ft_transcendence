import { displayAlertMsg } from '../../utils/utilityFunctions.js';
import { fetchUpload, fetchUser } from '../../api/fetchData.js';
import { closeAlertInfo, removeAllAlerts } from './utils.js';

export async function displayAlertStatus(response, type) {
    const alert = document.getElementById('alertError' + type);

    let message = ""
    removeAllAlerts(alert);
    if (response.status == 413) {
        alert.classList.add('alert-danger');
        message = "File is too big, max size is 1MB"
    } else if (response.status == 200) {
        if (response.headers.get("Content-Type").includes("application/json")) {
            const dataSuccess = await response.json();
            if (dataSuccess && dataSuccess.user) {
                sessionStorage.setItem('nickname', dataSuccess.user.nickname);
                sessionStorage.setItem('email', dataSuccess.user.email);
                document.getElementById('nickname').innerText = dataSuccess.user.nickname;
            } else if (dataSuccess && dataSuccess.avatar_url) {
                document.getElementById('avatar-img').src = dataSuccess.avatar_url
            }
        }
        alert.classList.add('alert-success');
        message = "Your " + type + " has been updated"
    } else {
        message = await response.text();
        alert.classList.add('alert-danger');
    }

    alert.classList.remove('hide');
    alert.classList.add('show');
    displayAlertMsg(message, alert);
}

export async function saveAvatar() {
    const formData = new FormData();
    const avatarInput = document.getElementById('avatarInput').files[0];
    if (avatarInput) {
        formData.append('avatar', avatarInput);
    }
    if (formData.has('avatar')) {
        document.getElementById('avatarInput').value = "";
        const response = await fetchUpload('POST', formData);
        if (!response) { return }
        displayAlertStatus(response, 'Avatar')
    } else {
        noChangeMadeAlert('alertErrorAvatar');
    }
}

export async function saveInfo(event) {
    event.preventDefault();
    const objectData = new Object();

    const alert = document.getElementById('alertErrorInfo');
    removeAllAlerts(alert);
    closeAlertInfo()

    const nicknameInput = document.getElementById('nicknameInput').value;
    const userNickname = sessionStorage.getItem('nickname');
    if (userNickname != nicknameInput) {
        objectData.nickname = nicknameInput;
    }

    const emailInput = document.getElementById('emailInput').value;
    const userEmail = sessionStorage.getItem('email');
    if (userEmail != emailInput) {
        objectData.email = emailInput;
    }

    if (Object.keys(objectData).length > 0) {
        const response = await fetchUser('PATCH', null, objectData);
        if (!response) { return }
        await displayAlertStatus(response, 'Info')
    } else {
        noChangeMadeAlert('alertErrorInfo');
    }
}

export function noChangeMadeAlert(alertError) {
    const alert = document.getElementById(alertError);
    const text = "No changes were made";
    removeAllAlerts(alert);

    displayAlertMsg(text, alert);
    alert.classList.add('alert-primary');
    alert.classList.add('show');
}