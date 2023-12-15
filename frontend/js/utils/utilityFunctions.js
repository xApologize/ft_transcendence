export function displayAlertMsg(text, alert) {
    while (alert.firstChild && alert.firstChild.nodeType === Node.TEXT_NODE) {
        alert.removeChild(alert.firstChild);
    }
    alert.insertBefore(new Text(text), alert.firstChild);
}

export function closeAllModals() {
    const modals = document.getElementsByClassName('modal');
    for (let i = 0; i < modals.length; i++) {
        const modalInstance = bootstrap.Modal.getInstance(modals[i]);
        if (modalInstance) {
            modalInstance.hide();
        }
    }
}