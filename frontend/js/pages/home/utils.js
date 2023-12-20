import { fetchFriendChange } from '../../api/fetchData.js';
import { assembler } from '../../api/assembler.js';
import { updateOtherFriendButton, updateStatusMsg } from './otherUserProfile.js';
import { updateSocialFriendCard } from './social.js';

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

    const userID = actionObj.id
    const action = actionObj.action;
    if (!action || !actionToMethod.hasOwnProperty(action)) {
        console.error('Unknown action:', action);
        return;
    }

    const apiParam = { id: userID, action: action };
    const method = actionToMethod[action];
    const response = await fetchFriendChange(method, apiParam);
    if (!response) {
        return;
    }
    const assemble = await assembler(response);
    console.log(assemble);
    if (!assemble) {
        return;
    }

    const responseStatus = response.status;
    if (actionObj.modal == 'otherProfile') {
        updateStatusMsg(assemble, responseStatus);
        if (assemble.status) {
            updateOtherFriendButton(assemble.status);
        }
    } else if (actionObj.modal == 'social') {

        updateSocialFriendCard(userID, action, responseStatus, assemble);
    }

}