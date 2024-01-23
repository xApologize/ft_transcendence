import { checkModal } from '../../router.js';
import { GameState } from '../game/src/systems/GameStates.js';
import interactiveSocket from './socket.js';
import { handleCreateTournamentClick } from './tournament.js';
import { updateTournamentList } from './tournamentUtils.js';
import { switchModals, hideModal, showModal } from './utils.js';

export function initGameMenu(world) {
    initlfp(world)
    initMainGameMenu(world)
    initJoinTournament()
}

function initlfp(world) {
    const lfpBtn = document.getElementById('cancel-lfp');
    lfpBtn.addEventListener('click', () => {
        hideElement('lfp');
        showElement('ui')
        showElement('toastContainer')
        showModal('gameMenuModal');
        world.currentGameState = GameState.InMenu;
        interactiveSocket.sendMessageSocket(
            JSON.stringify({ type: 'Cancel Match' })
        );
    });
}

function initJoinTournament() {
    document.getElementById('cancelJoinTournament').addEventListener('click', () => {
        switchModals('joinTournamentModal', 'gameMenuModal');
    });
}


function initMainGameMenu(world) {
    setupPlayClassicButton(world);
    setupPlayUpgradedButton(world);
    setupCreateTournamentButton();
    setupJoinTournamentButton();
}

function setupPlayClassicButton(world) {
    const playClassic = document.getElementById('joinClassicBtn');
    playClassic.addEventListener('click', () => handlePlayClassicClick(world));
    function handlePlayClassicClick(world) {
        hideModal('gameMenuModal');
        checkModal()
        hideElement('toastContainer');
        hideElement('ui');
        world.currentGameState = GameState.LookingForPlayer;
        showElement('lfp');
        interactiveSocket.sendMessageSocket(
            JSON.stringify({ type: 'Find Match Classic' })
        );
    }
}

function setupPlayUpgradedButton(world) {
    const playUpgraded = document.getElementById('joinUpgradedBtn');
    playUpgraded.addEventListener('click', () => handlePlayUpgradedClick(world));
    function handlePlayUpgradedClick(world) {
        hideModal('gameMenuModal');
        checkModal()
        hideElement('toastContainer');
        hideElement('ui');
        world.currentGameState = GameState.LookingForPlayer;
        showElement('lfp');
        interactiveSocket.sendMessageSocket(
            JSON.stringify({ type: 'Find Match' })
        );
    }
}

function showElement(elementId) {
    document.getElementById(elementId).classList.remove('d-none');
}
function hideElement(elementId) {
    document.getElementById(elementId).classList.add('d-none');
}

function setupCreateTournamentButton() {
    const createBtn = document.getElementById('createTournamentBtn');
    createBtn.addEventListener('click', handleCreateTournamentClick);
}

function setupJoinTournamentButton() {
    const joinBtn = document.getElementById('joinTournamentBtn');
    joinBtn.addEventListener('click', () => {
        switchModals('gameMenuModal', 'joinTournamentModal')
        updateTournamentList()
    });
}

