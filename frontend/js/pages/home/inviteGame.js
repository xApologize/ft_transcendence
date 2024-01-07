import { fetchGameInvite } from '../../api/fetchData.js';
import { assembler } from '../../api/assembler.js';
import interactiveSocket from './socket.js';
import { getMyID } from './utils.js';
import { updateSocial } from './social.js';


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
export function handleInviteInteraction(refresh_type, id, other_user_id) {
    console.log("receiveGameInvite")
    const userID = getMyID();
    if (!userID || userID != other_user_id)
        return;

    updateSocial('gameInvite')
}
