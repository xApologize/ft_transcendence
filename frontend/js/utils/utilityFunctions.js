export function displayErrorAlert(text, alert) {
    while (alert.firstChild && alert.firstChild.nodeType === Node.TEXT_NODE) {
        alert.removeChild(alert.firstChild);
    }
    alert.insertBefore(new Text(text), alert.firstChild);
}