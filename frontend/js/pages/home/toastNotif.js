import { toastComponent } from '../../components/toast/toast.js';
import { getMyID, removeUser } from './utils.js';

let toastQueue = [];
export function displayToast(toastMsg, toastTitle, imgUrl) {
    const toastPrep = prepToastInfo(toastMsg, toastTitle, imgUrl);
    if (document.querySelectorAll('#toastContainer .toast.show').length >= 5) {
        toastQueue.push(toastPrep);
    } else {
        createToast(toastPrep);
    }
}

function prepToastInfo(toastMsg, toastTitle, imgUrl) {
    const startTime = Date.now();
    const toastInfo = {
        toastMsg,
        toastTitle,
        startTime,
        imgUrl
    }
    return toastInfo;

}

async function createToast(toastInfo) {
    console.log("CREATE TOAST")
    const toastNotif = await toastComponent(); 
    toastNotif.querySelector('#toast-img').src = toastInfo['imgUrl'];
    toastNotif.querySelector('#toast-title').textContent = toastInfo['toastTitle'];
    toastNotif.querySelector('#toast-content').textContent = toastInfo['toastMsg'];

    document.getElementById('toastContainer').append(toastNotif);
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
            showNextToast(); // Attempt to show the next toast in the queue
        });
    });

    console.log("SHOW TOAST")
    toast.show();
}

function showNextToast() {
    const displayedToasts = document.querySelectorAll('#toastContainer .toast.show').length;

    if (displayedToasts < 5 && toastQueue.length > 0) {
        const toastInfo = toastQueue.shift();
        createToast(toastInfo);
    }
}


