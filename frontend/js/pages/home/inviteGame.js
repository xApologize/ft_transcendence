import { fetchGameInvite, fetchUser } from '../../api/fetchData.js';
import { assembler } from '../../api/assembler.js';
import interactiveSocket from './socket.js';
import { getMyID, hideModal } from './utils.js';
import { updateSocial } from './social.js';
import { checkModal } from '../../router.js';
import { displayToast } from './toastNotif.js';


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
            showModal('inviteGameModal', userID);
            console.log("Socket Invite Game Sent");
            break;
        case 'acceptGameInvite':
            console.log('Accept Game Invite');
            showModal('loadingModal');
            break;
    }
}

function showModal(modalId, userID = null) {
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
    // If (request accepted) ... else (delete request) ... OR keep the current method ?
    interactiveSocket.sendMessageSocket(JSON.stringify({"type": "Social", "rType": "cancelGameInvite", "other_user_id": userID}));
}

// Function called by socket when a game invite is sent by someone.
export async function handleInviteInteraction(refresh_type, id, other_user_id) {
    console.log("handleInviteInteraction")
    const userID = getMyID();
    if (!userID || (userID != other_user_id && userID != id))
        return;
    console.log(" I'm here for: " + refresh_type)
    if (refresh_type == "acceptGameInvite" || refresh_type == "refuseGameInvite") {
        await handleInviteUpdate(refresh_type, id, other_user_id, userID)
    } else if (refresh_type == 'sendGameInvite' && userID == other_user_id) {
        const response = await fetchUser('GET', {'id': id})
        if (!response) return;
        const userToNotif = await assembler(response);
        console.log(userToNotif)
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
    console.log("I am the one who accepted the invite.");
    const socialModalEl = document.getElementById('socialModal');
    const socialModal = bootstrap.Modal.getInstance(socialModalEl);
    if (socialModal) {
        socialModal.hide();
    }
    const loadingModalEl = document.getElementById('loadingModal');
    const loadingModal = bootstrap.Modal.getInstance(loadingModalEl);
    if (loadingModal) {
        loadingModal.show();
    }
    // I ACCEPTED THE INVITE, I NEED TO JOIN THE GAME HERE

    ///////////////////////////
    // loadingModal.hide()
}

async function handleOtherUserAcceptedInvite(request_id) {
    console.log("I am the one who sent the invite and he accepted it.");

    const inviteModalEl = document.getElementById('inviteGameModal');
    const inviteModal = bootstrap.Modal.getInstance(inviteModalEl);
    resetModalContentID(inviteModalEl);
    hideModal(inviteModal);

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
    
    function hideModal(inviteModal) {
        if (inviteModal) {
            inviteModal.hide();
        }
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
    console.log("I am the one who refused the invite.");
    const response = await fetchGameInvite('DELETE', {'recipient': other_user_id});
    if (!response) return;
    updateSocial('gameInvite');
}

async function handleOtherUserRefusedInvite(request_id) {
    console.log("I am the one who sent the invite and he refused it.");
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



