import { displayErrorAlert } from "../../utils/utilityFunctions.js";
import { fetchAuth } from "../../api/fetchData.js";

export function toggle2FAButton() {
    const enable2FA = document.getElementById('enable2FA')
    const disable2FA = document.getElementById('disable2FA')
    if (!enable2FA.classList.contains('disabled')) {
        enable2FA.classList.add('disabled');
        enable2FA.disabled = true;
        disable2FA.classList.remove('disabled');
        disable2FA.disabled = false;
    } else {
        enable2FA.classList.remove('disabled');
        enable2FA.disabled = false;
        disable2FA.classList.add('disabled');
        disable2FA.disabled = true;
    }
}

export async function disable2FA() {
    const response = await fetchAuth('DELETE', '2fa/')
    if (!response) { return }
    const data = await response.json();
    let info = null
    const alertDisplay = document.getElementById('2FAInfoDisplay')
    if (response.status == 200) {
        alertDisplay.classList.add('alert-success');
        alertDisplay.classList.remove('alert-danger');
        info = data.success;
    } else {
        alertDisplay.classList.add('alert-danger');
        alertDisplay.classList.remove('alert-success');
        info = data.error;
    }
    displayErrorAlert(info, alertDisplay);
    document.getElementById('twoFactorAuthDisplay').classList.remove('d-none');
    document.getElementById('twoFactorAuthEnable').classList.add('d-none');
    toggle2FAButton()
}

export async function enable2FA() {
    const response = await fetchAuth('POST', '2fa/')
    if (!response) { return }
    if (response.status == 200) {
        const dataSuccess = await response.json();
        const qrCodeUrl = dataSuccess.qr_code;
        const secretKey = dataSuccess.secret_key;
        const info = dataSuccess.info;
        
        const alert2FAEnable = document.getElementById('2FAInfoEnable')
        displayErrorAlert(info, alert2FAEnable);
        document.getElementById('qrCodeImage').src = qrCodeUrl;
        document.getElementById('secretKey').textContent = secretKey;
        document.getElementById('twoFactorAuthDisplay').classList.add('d-none');
        document.getElementById('twoFactorAuthEnable').classList.remove('d-none');
        toggle2FAButton()
    } else {
        const dataError = await response.text();
        const alert2FADisplay = document.getElementById('2FAInfoDisplay')
        displayErrorAlert(dataError, alert2FADisplay);
    
        alert2FADisplay.classList.add('alert-danger');
        alert2FADisplay.classList.remove('alert-success');
        
        document.getElementById('twoFactorAuthDisplay').classList.remove('d-none');
        document.getElementById('twoFactorAuthEnable').classList.add('d-none');
    }

}

function setup2FAMenu(TFAState) {
    if (TFAState == true) {
        disable2FA.textContent = "Disable 2FA"
        console.log("2FA Enable and Confirm")
    } else {
        disable2FA.textContent = "Cancel 2FA"
        enable2FA()
        console.log("2FA Enable but not confirm")
    }
}

export function updateMenu2FA(userObject) {
    const TFAState = userObject.two_factor_auth
    if ( TFAState != null) {
        setup2FAMenu(TFAState)
    } else {
        document.getElementById('disable2FA').classList.add('disabled');
        console.log("THERE IS NO 2FA")
    }
}