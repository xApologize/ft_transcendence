
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


export function setupSettings(event) {
    console.log('Settings Modal is about to be shown');

    const userNickname = document.getElementById('nickname').textContent;
    const nicknameInput = document.getElementById('nicknameInput');
    nicknameInput.value = userNickname


    const userEmail = document.getElementById('email').textContent;
    const emailInput = document.getElementById('emailInput');
    emailInput.value = userEmail;
}


