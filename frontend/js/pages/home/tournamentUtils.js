import { getMyID } from "./utils";
import { leftTournament, cancelTournament } from "./tournament";
import { switchModals } from "./utils";


// Sert à retirer une personne du lobby quand elle quitte.
// function removeParticipant(userId) {
//     const participantList = document.getElementById('participantList');
//     const participants = participantList.querySelectorAll('li');

//     for (let participant of participants) {
//         if (participant.dataset.id == userId) {
//             participantList.removeChild(participant);
//             break;
//         }
//     }
//     updateWaitingMessage();
// }