import { GameState } from '../game/src/systems/GameStates.js';
import interactiveSocket from './socket.js';


function getFriendsForInvite() {
    
}


function initMainGameMenu(world) {
    const play1vs1 = document.getElementById('play1vs1');
    play1vs1.addEventListener('click', () => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('gameMenuModal'));
        modal.hide()
        document.getElementById('toastContainer').classList.add('d-none')
        document.getElementById('ui').classList.add('d-none');
        world.currentGameState = GameState.LookingForPlayer;
        document.getElementById('lfp').classList.remove('d-none');
        interactiveSocket.sendMessageSocket(
            JSON.stringify({ type: 'Find Match' })
        );
    });

    document.getElementById('createTournamentBtn').addEventListener('click', () => {
        const gameMenuModal = bootstrap.Modal.getInstance(document.getElementById('gameMenuModal'));
        gameMenuModal.hide()
        const createTournamentModal = bootstrap.Modal.getInstance(document.getElementById('createTournamentModal'));
        createTournamentModal.show()
    });

    document.getElementById('joinTournamentBtn').addEventListener('click', function(event) {
        const gameMenuModal = bootstrap.Modal.getInstance(document.getElementById('gameMenuModal'));
        gameMenuModal.hide()
        const joinModal = bootstrap.Modal.getInstance(document.getElementById('joinTournamentModal'));
        joinModal.show();
    });
}

function initCreateTournamentMenu() {
    const tournamentForm = document.getElementById('tournamentForm');

    tournamentForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const tournamentName = document.getElementById('tournamentName');

        const lobbyTitle = document.getElementById('lobbyTournamentModalLabel');
        lobbyTitle.textContent = tournamentName.value;  // Set the text of the title
        tournamentName.value = '';

        const createTournamentModal = bootstrap.Modal.getInstance(document.getElementById('createTournamentModal'));
        createTournamentModal.hide();

        const lobbyTournamentModal = bootstrap.Modal.getInstance(document.getElementById('lobbyTournamentModal'));
        lobbyTournamentModal.show();
    });

    document.getElementById('cancelCreateTournament').addEventListener('click', function(event) {
        const createTournamentModal = bootstrap.Modal.getInstance(document.getElementById('createTournamentModal'));
        createTournamentModal.hide();
        const gameMenuModal = bootstrap.Modal.getInstance(document.getElementById('gameMenuModal'));
        gameMenuModal.show();
    });
}


function initLobbyTournament() {
    document.getElementById('inviteTournamentBtn').addEventListener('click', function(event) {
        const inviteModal = bootstrap.Modal.getInstance(document.getElementById('inviteTournamentModal'));
        inviteModal.show();
    });

}

function initInviteTournament() {
    const inviteTournamentModal = document.getElementById('inviteTournamentModal');
    inviteTournamentModal.addEventListener('show.bs.modal', function(event) {
        inviteTournamentModal.classList.add('bg-dark');
        inviteTournamentModal.classList.add('bg-opacity-50')
        getFriendsForInvite();
    });

    inviteTournamentModal.addEventListener('hidden.bs.modal', function(event) {
        inviteTournamentModal.classList.remove('bg-dark');
        inviteTournamentModal.classList.remove('bg-opacity-50')
    });
}


function initJoinTournament() {
    document.getElementById('cancelJoinTournament').addEventListener('click', function(event) {
        const joinModal = bootstrap.Modal.getInstance(document.getElementById('joinTournamentModal'));
        joinModal.hide();
        const gameMenuModal = bootstrap.Modal.getInstance(document.getElementById('gameMenuModal'));
        gameMenuModal.show();
    });
}

export function initGameMenu(world) {
    new bootstrap.Modal(document.getElementById('gameMenuModal'));
    new bootstrap.Modal(document.getElementById('createTournamentModal'));
    new bootstrap.Modal(document.getElementById('lobbyTournamentModal'));
    new bootstrap.Modal(document.getElementById('inviteTournamentModal'))
    new bootstrap.Modal(document.getElementById('joinTournamentModal'))

    initMainGameMenu(world)
    initCreateTournamentMenu()
    initLobbyTournament()
    initInviteTournament()
    initJoinTournament()
}
