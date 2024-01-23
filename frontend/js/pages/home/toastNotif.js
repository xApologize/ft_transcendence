import { toastComponent } from '../../components/toast/toast.js';
import { checkModal } from '../../router.js';
import { hideElementById } from './utils.js';

let toastQueue = [];
export function displayToast(toastMsg, toastTitle, toastType = '', imgUrl = '') {
    if (imgUrl === '')
        imgUrl = '../../../public/80-percent.jpeg';
    const toastPrep = prepToastInfo(toastMsg, toastTitle, toastType,imgUrl);
    if (document.querySelectorAll('#toastContainer .toast.show').length >= 5) {
        toastQueue.push(toastPrep);
    } else {
        createToast(toastPrep);
    }
}

function prepToastInfo(toastMsg, toastTitle, toastType, imgUrl) {
    const startTime = Date.now();
    const toastInfo = {
        toastMsg,
        toastTitle,
        startTime,
        imgUrl,
        toastType
    }
    return toastInfo;

}

async function createToast(toastInfo) {
    const toastNotif = await toastComponent();
    toastNotif.querySelector('#toast-img').src = toastInfo['imgUrl'];
    toastNotif.querySelector('#toast-title').textContent = toastInfo['toastTitle'];
    toastNotif.querySelector('#msg-toast').textContent = toastInfo['toastMsg'];
    if (toastInfo['toastType'] == 'displaySocial') {
        clickToastEnable(toastNotif);
    }

    document.getElementById('toastContainer').prepend(toastNotif);
    var toast = new bootstrap.Toast(toastNotif);
    toastNotif.addEventListener('shown.bs.toast', () => {
        const timeSinceToastElement = toastNotif.querySelector('#timeSinceToast');

        const intervalId = setInterval(() => {
            const secondsPassed = Math.floor((Date.now() - toastInfo['startTime']) / 1000);
            timeSinceToastElement.textContent = `${secondsPassed} seconds ago`;
        }, 1000);

        toastNotif.addEventListener('hidden.bs.toast', () => {
            clearInterval(intervalId);
            toastNotif.remove();
            showNextToast();
        });
    });

    toast.show();
}

function showNextToast() {
    const displayedToasts = document.querySelectorAll('#toastContainer .toast.show').length;
    if (displayedToasts < 5 && toastQueue.length > 0) {
        const toastInfo = toastQueue.shift();
        createToast(toastInfo);
    }
}

function clickToastEnable(toastNotif) {
    const toastSmall = toastNotif.querySelector('#toast-displaySocial')
    toastSmall.classList.remove('d-none');
    // toastNotif.querySelector('.toast').classList.add('cursor-pointer');
    toastNotif.addEventListener('click', async() => {
        checkModal();
        const socialModalEl = document.getElementById('socialModal');
        let socialModal = bootstrap.Modal.getInstance(socialModalEl)
        if (!socialModal) {
            socialModal = new bootstrap.Modal(socialModalEl);
        }
        socialModal.show();
        toastNotif.remove();
    });
}


