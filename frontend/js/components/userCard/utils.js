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

export function closeSettings() {
    const settingsModal = document.getElementById('userSettingsModal');
    if (settingsModal) {
        const modalInstance = bootstrap.Modal.getInstance(settingsModal);
        if (modalInstance) {
            modalInstance.hide();
        }
    }  
}


export function noChangeMadeAlert(messageError, alertError) {
    const alert = document.getElementById(alertError);
    const alertText = document.getElementById(messageError);
    removeAllAlerts(alert);
    alertText.textContent = "No changes were made";
    alert.classList.add('alert-primary');
    alert.classList.add('show');
}


export function removeAllAlerts(alertElement) {
    alertElement.classList.remove('alert-success');
    alertElement.classList.remove('alert-danger');
    alertElement.classList.remove('alert-primary');
}


export function setupSettings() {
    console.log('Settings Modal is about to be shown');

    const userNickname = document.getElementById('nickname').textContent;
    const nicknameInput = document.getElementById('nicknameInput');
    nicknameInput.value = userNickname


    const userEmail = document.getElementById('email').textContent;
    const emailInput = document.getElementById('emailInput');
    emailInput.value = userEmail;
}