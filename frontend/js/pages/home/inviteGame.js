import { fetchGameInvite } from '../../api/fetchData.js';
import { assembler } from '../../api/assembler.js';
import interactiveSocket from './socket.js';
import { getMyID } from './utils.js';
import { updateSocial } from './social.js';
import { checkModal } from '../../router.js';
import { displayToast } from './toastNotif.js';


export async function displayInviteModal(event) {
    event.stopPropagation(); // Empêche le otherUserModal d'open pcq le listener est sur la div.
    let ancestor = event.currentTarget;
    while (ancestor && !ancestor.hasAttribute('data-userid-flag')) {
        ancestor = ancestor.parentNode;
    }
    if (!ancestor || !ancestor.dataset.id) {
        console.error('User ID not found');
        return;
    }
    const userID = ancestor.dataset.id;
    const response = await fetchGameInvite('POST', {'recipient': userID});
    if (!response) {
        return
    }
    const assembleResponse = await assembler(response)
    if (response.status >= 400) { // ERROR HANDLING
        console.log("Error Invite Game")
        console.log(assembleResponse)
    } else {
        // NEED TO DETECT IF IT SENT A REQUEST OR ACCEPT IT
        const modalElement = document.getElementById('inviteGameModal')
        const inviteModal = bootstrap.Modal.getInstance(modalElement);
        if (!inviteModal) {
            console.error('Other user modal instance not found')
            return
        }
        modalElement.querySelector('.modal-content').dataset.id = userID
        inviteModal.show()
        console.log("Socket Invite Game Sent")
        interactiveSocket.sendMessageSocket(JSON.stringify({"type": "Social", "rType": "sendGameInvite", "other_user_id": userID}));
    }
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
    // const assemble = await assembler(response);
    // console.log(assemble)
    // Update social modal of other user, remove the request.
    // If (request accepted) ... else (delete request)
    interactiveSocket.sendMessageSocket(JSON.stringify({"type": "Social", "rType": "cancelGameInvite", "other_user_id": userID}));
}

// Function called by socket when a game invite is sent by someone.
export async function handleInviteInteraction(refresh_type, id, other_user_id) {
    console.log("receiveGameInvite")
    const userID = getMyID();
    if (!userID || (userID != other_user_id && userID != id))
        return;
    console.log(" I'm here for: " + refresh_type)
    if (refresh_type == "acceptGameInvite" || refresh_type == "refuseGameInvite") {
        await handleInviteUpdate(refresh_type, id, other_user_id, userID)
    } else if (refresh_type == 'sendGameInvite' && userID == other_user_id) {
        displayToast("You have received a game invite from " + other_user_id, "Game Invite", "https://png.pngtree.com/png-clipart/20190904/ourmid/pngtree-80-3d-text-png-image_18456.jpg")
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
    // Determine the role of the user and handle accordingly.
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
    // SOCKET GAME LOGIC HERE FOR ACCEPT 

    ///////////////////////////
}

async function handleOtherUserAcceptedInvite(request_id) {
    console.log("I am the one who sent the invite and he accepted it.");

    // Handle the invite modal UI updates.
    const inviteModalEl = document.getElementById('inviteGameModal');
    const inviteModal = bootstrap.Modal.getInstance(inviteModalEl);
    resetModalContentID(inviteModalEl);
    hideModal(inviteModal);

    const loadingModalEl = document.getElementById('loadingModal');
    const loadingModal = bootstrap.Modal.getInstance(loadingModalEl);
    if (loadingModal) {
        loadingModal.show();
    }

    const response = await fetchGameInvite('DELETE', {'recipient': request_id});
    if (!response) return;

    const data = await assembler(response);
    handleResponseErrors(data, response.status);

    notifySocialUpdate(request_id);

    // SOCKET GAME LOGIC HERE FOR ACCEPT 


    ///////////////////////////
    function resetModalContentID(inviteModalEl) {
        const modalContentDatasetID = inviteModalEl.querySelector('.modal-content');
        modalContentDatasetID.dataset.id = '';
    }
    
    function hideModal(inviteModal) {
        if (inviteModal) {
            inviteModal.hide();
        }
    }
    
    function handleResponseErrors(data, status) {
        if (status >= 400) {
            const msg = data.error;
            displayToast(msg, "Error", "https://png.pngtree.com/png-clipart/20190904/ourmid/pngtree-80-3d-text-png-image_18456.jpg");
        }
    }
    
    function notifySocialUpdate(request_id) {
        interactiveSocket.sendMessageSocket(JSON.stringify({
            "type": "Social",
            "rType": "refreshGameInvite",
            "other_user_id": request_id
        }));
    }    
}

function handleRefuseInvite(request_id, other_user_id, userID) {
    // Determine the role of the user and handle accordingly.
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

    displayToast("Your game invite has been refused.", "Game Invite", "https://png.pngtree.com/png-clipart/20190904/ourmid/pngtree-80-3d-text-png-image_18456.jpg");

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



