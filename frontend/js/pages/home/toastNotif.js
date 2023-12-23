import { toastComponent } from '../../components/toast/toast.js';
import { removeUser } from './utils.js';

let toastQueue = [];
export function displayToast() {
    removeUser(5);
    if (document.querySelectorAll('#toastContainer .toast.show').length >= 5) {
        toastQueue.push(prepToastInfo());
    } else {
        const toastInfo = prepToastInfo();
        createToast(toastInfo);
    }
}

function prepToastInfo() {
    const startTime = Date.now();
    return ({
        startTime
    })

}

async function createToast(toastInfo) {
    // Assume toastComponent() is a function that returns a toast HTML element
    const toastNotif = await toastComponent(); 
    document.getElementById('toastContainer').append(toastNotif);

    // Initialize Bootstrap Toast
    var toast = new bootstrap.Toast(toastNotif);

    // Set up events and display logic
    toastNotif.addEventListener('shown.bs.toast', () => {
        const timeSinceToastElement = toastNotif.querySelector('#timeSinceToast');

        // Update the time every second
        const intervalId = setInterval(() => {
            const secondsPassed = Math.floor((Date.now() - toastInfo['startTime']) / 1000);
            timeSinceToastElement.textContent = `${secondsPassed} seconds ago`;
        }, 1000);

        // When the toast is hidden, clear the interval and remove the toast from DOM
        toastNotif.addEventListener('hidden.bs.toast', () => {
            clearInterval(intervalId);
            toastNotif.remove();
            showNextToast(); // Attempt to show the next toast in the queue
        });
    });

    // Display the toast
    toast.show();
}

// Function to show a toast if less than 5 are displayed
function showNextToast() {
    // Get the number of toasts currently displayed
    const displayedToasts = document.querySelectorAll('#toastContainer .toast.show').length;

    // If there are less than 5 toasts displayed and the queue is not empty
    if (displayedToasts < 5 && toastQueue.length > 0) {
        // Remove the first request from the queue, create the toast, and display it
        const toastInfo = toastQueue.shift();
        createToast(toastInfo);
    }
}


