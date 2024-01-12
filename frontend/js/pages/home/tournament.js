import { assembler } from '../../api/assembler.js';
import { fetchTournamentUser, fetchUser } from '../../api/fetchData.js';
import interactiveSocket from './socket.js';
import { displayToast } from './toastNotif.js';
import { fetchUserById, getMyID } from './utils.js';
import { switchModals } from './utils.js';

export async function handleCreateTournamentClick() {
    const response = await fetchTournamentUser('POST');
    if (!response) return;
    const data = await assembler(response);
    if (response.status >= 400) {
        displayToast(data.error, 'Error Tournament');
        await fetchTournamentUser('PATCH', {'status': 'finish'})
        // Display a way to delete the tournament ?
        return; 
    }
    switchMenuBtn(false);
    changeMenu
    const cancelButton = document.getElementById('cancelTournamentBtn');
    cancelButton.addEventListener('click', quitTournament);

    const currentUser = await fetchUserById();
    if (!currentUser) return;
    updateLobbyTitle(currentUser.nickname);
    addParticipant(currentUser.nickname, currentUser.avatar);    
    
    switchModals('gameMenuModal', 'lobbyTournamentModal');
    
    function updateLobbyTitle(nickname) {
        const lobbyTitle = document.getElementById('lobbyTournamentModalLabel');
        lobbyTitle.textContent = `${nickname}'s Tournament`;
    }
}

async function quitTournament(event) {
    await fetchTournamentUser('PATCH', {'status': 'finish'});
    switchModals('lobbyTournamentModal', 'gameMenuModal');
    switchMenuBtn(true)

    const cancelButton = document.getElementById('cancelTournamentBtn');
    cancelButton.removeEventListener('click', quitTournament);

}

function switchMenuBtn(state) {
    const buttons = document.querySelectorAll('#gameMenuModal .modal-body button');
    if (state === true) {
        buttons.forEach(button => button.disabled = false);
    } else {
        buttons.forEach(button => button.disabled = true);
    }
}

function addParticipant(nickname, avatarUrl) {
    const participantList = document.getElementById('participantList');
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex align-items-center';

    const img = document.createElement('img');
    img.src = avatarUrl;
    img.alt = nickname + ' Avatar';
    img.className = 'rounded-circle me-2';
    img.style.width = '30px';
    img.style.height = '30px';

    const text = document.createTextNode(nickname);

    li.appendChild(img);
    li.appendChild(text);
    participantList.appendChild(li);
    updateWaitingMessage();
}

function updateWaitingMessage() {
    const participantList = document.getElementById('participantList');
    const waitingMessage = document.getElementById('waitingMessage');
    const maxPlayers = 4; // Set the maximum number of players

    const currentPlayers = participantList.children.length;
    waitingMessage.textContent = `Waiting for more players (${currentPlayers}/${maxPlayers})`;

    if (currentPlayers >= maxPlayers) {
        waitingMessage.classList.add('bg-success');
        waitingMessage.classList.remove('bg-warning');
        waitingMessage.textContent = 'Game Ready to Start!';
    } else {
        waitingMessage.classList.add('bg-warning');
        waitingMessage.classList.remove('bg-success');
    }
}