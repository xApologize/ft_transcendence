import { displayAlertMsg } from "../../utils/utilityFunctions.js";
import { fetchAuth } from "../../api/fetchData.js";
import { assembler } from "../../api/assembler.js";
import { hideElementById, showElementById } from "../../pages/home/utils.js";

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
    const disable2FA = document.getElementById('disable2FA')
    disable2FA.textContent = "Disable 2FA"

    displayAlertMsg(info, alertDisplay);
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
        
        const disable2FA = document.getElementById('disable2FA')
        disable2FA.textContent = "Cancel 2FA"
    
        const alert2FAEnable = document.getElementById('2FAInfoEnable')
        displayAlertMsg(info, alert2FAEnable);
        document.getElementById('qrCodeImage').src = qrCodeUrl;
        document.getElementById('secretKey').textContent = secretKey;
        hideElementById('twoFactorAuthDisplay');
        showElementById('twoFactorAuthEnable')
        toggle2FAButton()
    } else {
        const dataError = await response.text();
        const alert2FADisplay = document.getElementById('2FAInfoDisplay')
        displayAlertMsg(dataError, alert2FADisplay);
    
        alert2FADisplay.classList.add('alert-danger');
        alert2FADisplay.classList.remove('alert-success');
        
        showElementById('twoFactorAuthDisplay');
        hideElementById('twoFactorAuthEnable')
    }
}

let errorTimeout
export async function checkConfirmationCode(event) {
    event.preventDefault()
    const confirmationCode = document.getElementById('confirmationCode').value;
    const response = await fetchAuth('POST', 'confirm2fa/', {'otp_token': confirmationCode})
    if (!response) { return }
    const data = await assembler(response);
    if (response.status == 200) {
        const info = data.success;
        const alert2FADisplay = document.getElementById('2FAInfoDisplay')
        displayAlertMsg(info, alert2FADisplay);
        hideElementById('twoFactorAuthEnable');
        showElementById('twoFactorAuthDisplay');
        document.getElementById('confirmationCode').value = '';
        document.getElementById('disable2FA').textContent = "Disable 2FA"
    } else {
        let dataError = null
        if (data.error) {
            dataError = data.error;
        } else {
            dataError = data;
        }
        const errorMsg = document.getElementById('errorConfirmCode')
        errorMsg.textContent = dataError;
        if (errorTimeout) {
            clearTimeout(errorTimeout);
        }
        errorTimeout = setTimeout(function() {
            errorMsg.textContent = '';
        }, 5000);
    }
}

function setup2FAMenu(TFAState) {
    const disable2FA = document.getElementById('disable2FA')
    if (TFAState) {
        disable2FA.textContent = "Disable 2FA"
    } else {
        disable2FA.textContent = "Cancel 2FA"
        enable2FA()
    }
    toggle2FAButton()
}

export function updateMenu2FA(userObject) {
    const TFAState = userObject.two_factor_auth
    if ( TFAState != null) {
        setup2FAMenu(TFAState)
    } else {
        document.getElementById('disable2FA').classList.add('disabled');
    }
}