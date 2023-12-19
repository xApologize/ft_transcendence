import { fetchFriendChange } from '../../api/fetchData.js';
import { assembler } from '../../api/assembler.js';

export async function handleFriendAction(action, otherUserID) {
    const actionToMethod = {
        'add': 'POST',
        'cancel': 'DELETE',
        'accept': 'POST',
        'refuse': 'DELETE',
        'unfriend': 'DELETE',
    };

    if (!action || !actionToMethod.hasOwnProperty(action)) {
        console.error('Unknown action:', action);
        return;
    }

    const apiParam = { id: otherUserID, action: action };
    const method = actionToMethod[action];
    const response = await fetchFriendChange(method, apiParam);
    if (!response) {
        return;
    }
    const assemble = await assembler(response);
    console.log(assemble);
}