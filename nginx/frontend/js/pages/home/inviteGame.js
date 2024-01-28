import { fetchGameInvite, fetchUser } from '../../api/fetchData.js';
import { assembler } from '../../api/assembler.js';
import interactiveSocket from './socket.js';
import { getMyID, hideModal } from './utils.js';
import { updateSocial } from './social.js';
import { displayToast } from './toastNotif.js';
import { showModal } from './utils.js';


export async function displayInviteModal(event) {
    event.stopPropagation();
    const userID = getUserIDFromEventTarget(event.currentTarget);

    if (!userID) {
        console.error('User ID not found');
        return;
    }

    const response = await fetchGameInvite('POST', {'recipient': userID});
    if (!response) return;

    const assembledResponse = await assembler(response);

    if (response.status >= 400) {
        displayErrorResponse(assembledResponse.error);
        return;
    }
    const rType = assembledResponse.rType
    handleResponseType(rType, userID);
    interactiveSocket.sendMessageSocket(JSON.stringify({"type": "Social", "rType": rType, "other_user_id": userID}));
}

function getUserIDFromEventTarget(target) {
    let ancestor = target;
    while (ancestor && !ancestor.hasAttribute('data-userid-flag')) {
        ancestor = ancestor.parentNode;
    }
    return ancestor ? ancestor.dataset.id : null;
}

function displayErrorResponse(errorMessage) {
    displayToast(errorMessage, "Error");
}

function handleResponseType(rType, userID) {
    switch (rType) {
        case 'sendGameInvite':
            showModalAsResponse('inviteGameModal', userID);
            break;
        case 'acceptGameInvite':
            showModalAsResponse('loadingModal');
            break;
    }
}

function showModalAsResponse(modalId, userID = null) {
    const modalElement = document.getElementById(modalId);
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (!modal) {
        console.error(`${modalId} instance not found`);
        return;
    }
    if (userID) {
        modalElement.querySelector('.modal-content').dataset.id = userID;
    }
    modal.show();
}



export async function closeInviteRequest(event) {
    const modal_content =  event.currentTarget.querySelector('.modal-content')
    const userID = modal_content.dataset.id
    if (!userID)
        return;
    modal_content.dataset.id = ''
    const response = await fetchGameInvite('DELETE', {'recipient': userID})
    if (!response)
        return;
    interactiveSocket.sendMessageSocket(JSON.stringify({"type": "Social", "rType": "cancelGameInvite", "other_user_id": userID}));
}

// Function called by socket when a game invite is sent by someone.
export async function handleInviteInteraction(refresh_type, id, other_user_id) {
    const userID = getMyID();
    if (!userID || (userID != other_user_id && userID != id))
        return;
    if (refresh_type == "acceptGameInvite" || refresh_type == "refuseGameInvite") {
        await handleInviteUpdate(refresh_type, id, other_user_id, userID)
    } else if (refresh_type == 'sendGameInvite' && userID == other_user_id) {
        const response = await fetchUser('GET', {'id': id})
        if (!response) return;
        const userToNotif = await assembler(response);
        displayToast("You have received a game invite from " + userToNotif[0].nickname, "Game Invite", 'displaySocial',userToNotif[0].avatar)
        await updateSocial('gameInvite')
    } else if (userID == other_user_id) {
        await updateSocial('gameInvite')
    }
}

async function handleInviteUpdate(refresh_type, request_id, other_user_id, userID) {
    if (refresh_type == 'acceptGameInvite') {
        await handleAcceptInvite(request_id, other_user_id, userID)
    } else {
        handleRefuseInvite(request_id, other_user_id, userID)
    }
}

async function handleAcceptInvite(request_id, other_user_id, userID) {
    if (userID == request_id) {
        handleSelfAcceptedInvite();
    } else if (userID == other_user_id) {
        await handleOtherUserAcceptedInvite(request_id);
    }
}

function handleSelfAcceptedInvite() {
    hideModal('socialModal');
    showModal('loadingModal');
}

async function handleOtherUserAcceptedInvite(request_id) {
    const inviteModalEl = document.getElementById('inviteGameModal');
    resetModalContentID(inviteModalEl);
    hideModal('inviteGameModal')

    const loadingModalEl = document.getElementById('loadingModal');
    const loadingModal = bootstrap.Modal.getInstance(loadingModalEl);
    if (loadingModal) {
        loadingModal.show();
    }

    interactiveSocket.sendMessageSocket(JSON.stringify({"type": "Game Invite"}));

    function resetModalContentID(inviteModalEl) {
        const modalContentDatasetID = inviteModalEl.querySelector('.modal-content');
        modalContentDatasetID.dataset.id = '';
    }
}

function handleRefuseInvite(request_id, other_user_id, userID) {
    if (userID == request_id) {
        handleSelfRefusedInvite(other_user_id);
    } else if (userID == other_user_id) {
        handleOtherUserRefusedInvite(request_id);
    }
}

async function handleSelfRefusedInvite(other_user_id) {
    const response = await fetchGameInvite('DELETE', {'recipient': other_user_id});
    if (!response) return;
    updateSocial('gameInvite');
}

async function handleOtherUserRefusedInvite(request_id) {
    const inviteModalEl = document.getElementById('inviteGameModal');
    const inviteModal = bootstrap.Modal.getInstance(inviteModalEl);
    resetModalContentID(inviteModalEl);
    hideModal(inviteModal);

    displayToast("Your game invite has been refused.", "Game Invite");

    function resetModalContentID(inviteModalEl) {
        const modalContentDatasetID = inviteModalEl.querySelector('.modal-content');
        modalContentDatasetID.dataset.id = '';
    }
    
    function hideModal(inviteModal) {
        if (inviteModal) {
            inviteModal.hide();
        }
    }    
}



