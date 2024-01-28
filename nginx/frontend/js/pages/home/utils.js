import { fetchFriendChange, fetchIsToken, fetchUser } from '../../api/fetchData.js';
import { assembler } from '../../api/assembler.js';
import { updateOtherFriendButton, updateStatusMsg } from './otherUserProfile.js';
import { updateSocialFriendCard } from './social.js';
import interactiveSocket from './socket.js';
import { checkModal } from '../../router.js';


export async function handleFriendAction(actionObj) {
    const actionToMethod = {
        'add': 'POST',
        'cancel': 'DELETE',
        'accept': 'POST',
        'refuse': 'DELETE',
        'unfriend': 'DELETE',
    };

    if (!actionObj) {
        console.error('No actionObj');
        return;
    }

    const { id: userID, action, modal } = actionObj;
    if (!action || !actionToMethod[action]) {
        console.error(`Unknown action: ${action}`);
        return;
    }

    const apiParam = { id: userID, action };
    const method = actionToMethod[action];
    const response = await fetchFriendChange(method, apiParam);
    if (!response) {
        return;
    }
    if (response.status >= 200 && response.status < 300) {
        interactiveSocket.sendMessageSocket(JSON.stringify({"type": "Social", "rType": action, "other_user_id": userID}));
    }
    const assemble = await assembler(response);
    const responseStatus = response.status;
    switch (modal) {
        case 'otherProfile':
            updateStatusMsg(assemble, responseStatus);
            if (assemble.status) {
                updateOtherFriendButton(assemble.status);
            }
            break;
        case 'social':
            updateSocialFriendCard(userID, action, responseStatus, assemble);
            break;
        default:
            console.error(`Unknown modal type: ${modal}`);
    }
}


export function setStatus(user) {
    switch (user) {
        case 'ONL':
            return 'green';
        case 'BUS':
            return 'red';
        case 'ING':
            return 'yellow';
        case 'OFF':
            return 'gray';
    }
}


export function getMyID() {
    let userID = sessionStorage.getItem('user_id');
    if (!userID) {
        let token = sessionStorage.getItem('jwt');
        if (!token) {
            console.error('Error with jwt token. Please refresh your page.')
            return; 
        }
        const parts = token.split('.');
        if (parts.length === 3) {
            try {
                const decodedPayload = JSON.parse(atob(parts[1]));
                userID = decodedPayload.sub;
                sessionStorage.setItem('user_id', userID);
            } catch (e) {
                console.error('Failed to decode JWT:', e);
            }
        }
    }
    return userID;
}


export async function fetchUserById(userID = null) {
    if (!userID) {
        userID = getMyID();
        if (!userID)
            return;
    }

    const response = await fetchUser('GET', { id: userID });
    if (!response)
        return;
    const assemble = await assembler(response);
    if (typeof assemble !== 'object' || assemble === null) {
        return;
    }
    return assemble[0];
}

export function switchModals(hideModalId, showModalId) {
    hideModal(hideModalId);
    showModal(showModalId)
}

export function hideModal(modalId) {
    const modalElement = document.getElementById(modalId);
    if (!modalElement) return;

    const modal = bootstrap.Modal.getInstance(modalElement);
    if (!modal) return;

    modal.hide();
}

export function showModal(modalId) {
    const modalElement = document.getElementById(modalId);
    if (!modalElement) return;

    const modal = bootstrap.Modal.getInstance(modalElement);
    if (!modal) return;

    modal.show();
}

export function disposeModal(modalId) {
    const modalElement = document.getElementById(modalId);
    if (!modalElement) return;

    const modal = bootstrap.Modal.getInstance(modalElement);
    if (!modal) return;

    modal.dispose();
}

export function isModalShown(modalId) {
    const modalElement = document.getElementById(modalId);
    return modalElement && modalElement.classList.contains('show');
}

export function hideElementById(id) {
    const element = document.getElementById(id);
    if (element && !element.classList.contains('d-none')) {
        element.classList.add('d-none');
    }
}

export function showElementById(id) {
    const element = document.getElementById(id);
    if (element && element.classList.contains('d-none')) {
        element.classList.remove('d-none');
    }
}

export function resetInnerHTMLById(id) {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = "";
    }
}

export function hideAllUI(launchGame = false) {
    checkModal()
    hideElementById('toastContainer')
    hideElementById('ui')
    if (launchGame === true)
        showElementById('lfp')
}