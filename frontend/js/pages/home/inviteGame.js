import { fetchGameInvite } from '../../api/fetchData.js';
import { assembler } from '../../api/assembler.js';
import interactiveSocket from './socket.js';


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
    
    console.log(userID)
    const response = await fetchGameInvite('POST', {'recipient': userID});
    if (!response) {
        return
    }
    const assembleResponse = await assembler(response)
    if (response.status >= 400) {
        console.log("Error Invite Game")
        console.log(assembleResponse)
    } else {
        const modalElement = document.getElementById('inviteGameModal')
        const inviteModal = bootstrap.Modal.getInstance(modalElement);
        if (!inviteModal) {
            console.error('Other user modal instance not found')
            return
        }
        modalElement.querySelector('.modal-content').dataset.id = userID
        inviteModal.show()
        // interactiveSocket.sendMessageSocket(JSON.stringify({"type": "Game", "rType": "invite", "other_user_id": userID}));
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
    const assemble = await assembler(response);
    console.log(assemble)
}