import { assembler } from '../../api/assembler.js';
import { fetchTournamentUser, fetchUser } from '../../api/fetchData.js';
import interactiveSocket from './socket.js';
import { getMyID } from './utils.js';
import { handleCreateTournamentClick } from './tournament.js';
import { switchModals, hideModal } from './utils.js';

export function initGameMenu(world) {
    initMainGameMenu(world)
    initLobbyTournament()
    initJoinTournament()
}

function initLobbyTournament() {
    const lobbyModal = document.getElementById('lobbyTournamentModal');
    lobbyModal.addEventListener('hide.bs.modal', () => {
        const participantList = document.getElementById('participantList');
        participantList.innerHTML = '';
    });
}

function initJoinTournament() {
    document.getElementById('cancelJoinTournament').addEventListener('click', () => switchModals('joinTournamentModal', 'gameMenuModal'));
}


function initMainGameMenu(world) {
    setupPlay1vs1Button(world);
    setupCreateTournamentButton();
    setupJoinTournamentButton();
}

function setupPlay1vs1Button(world) {
    const play1vs1 = document.getElementById('play1vs1');
    play1vs1.addEventListener('click', () => handlePlay1vs1Click(world));
    function handlePlay1vs1Click(world) {
        hideModal('gameMenuModal');
        hideElement('toastContainer');
        hideElement('ui');
        world.currentGameState = 'lookingForPlayer';
        showElement('lfp');
        interactiveSocket.sendMessageSocket(
            JSON.stringify({ type: 'Find Match' })
        );
    
        function showElement(elementId) {
            document.getElementById(elementId).classList.remove('d-none');
        }
        
        function hideElement(elementId) {
            document.getElementById(elementId).classList.add('d-none');
        }
    }
}

function setupCreateTournamentButton() {
    const createBtn = document.getElementById('createTournamentBtn');
    createBtn.addEventListener('click', handleCreateTournamentClick);
}

function setupJoinTournamentButton() {
    const joinBtn = document.getElementById('joinTournamentBtn');
    joinBtn.addEventListener('click', () => switchModals('gameMenuModal', 'joinTournamentModal'));
}

