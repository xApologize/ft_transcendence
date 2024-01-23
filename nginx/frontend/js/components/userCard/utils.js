import { assembler } from "../../api/assembler.js";
import { fetchMe } from "../../api/fetchData.js";

export function closeAlertInfo() {
    const alert = document.getElementById('alertErrorInfo');
    alert.classList.remove('show');
    alert.classList.add('hide');
}


export function closeAlertAvatar() {
    const alert = document.getElementById('alertErrorAvatar');
    alert.classList.remove('show');
    alert.classList.add('hide');
}

export function closeAlert2FA() {
    const alert = document.getElementById('twoFactorAuthDisplay');
    alert.classList.add('d-none');
}

export function closeSettings() {
    const settingsModal = document.getElementById('userSettingsModal');
    if (settingsModal) {
        const modalInstance = bootstrap.Modal.getInstance(settingsModal);
        if (modalInstance) {
            modalInstance.hide();
        }
    }
}

export function removeAllAlerts(alertElement) {
    alertElement.classList.remove('alert-success');
    alertElement.classList.remove('alert-danger');
    alertElement.classList.remove('alert-primary');
}


export async function setupSettings(event) {
    const response = await fetchMe('GET');
    if (!response) { return }
    const userInfo = await assembler(response);

    const nickname = userInfo.nickname
    const email = userInfo.email;

    const nicknameInput = document.getElementById('nicknameInput');
    nicknameInput.value = nickname


    const emailInput = document.getElementById('emailInput');
    emailInput.value = email

    sessionStorage.setItem('nickname', nickname)
    sessionStorage.setItem('email', email)

}

export function clearSettings(event) {
    document.getElementById('confirmationCode').value = '';
    closeAlert2FA();
    closeAlertAvatar();
    closeAlertInfo();
    sessionStorage.removeItem('nickname');
    sessionStorage.removeItem('email');
}

