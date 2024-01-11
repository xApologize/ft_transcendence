import { assembler } from '../../api/assembler.js';
import { fetchUser } from '../../api/fetchData.js';
import interactiveSocket from './socket.js';
import { getMyID } from './utils.js';



function initMainGameMenu(world) {
    const play1vs1 = document.getElementById('play1vs1');
    play1vs1.addEventListener('click', () => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('gameMenuModal'));
        modal.hide()
        document.getElementById('toastContainer').classList.add('d-none')
        document.getElementById('ui').classList.add('d-none');
        world.currentGameState = 'lookingForPlayer';
        document.getElementById('lfp').classList.remove('d-none');
        interactiveSocket.sendMessageSocket(
            JSON.stringify({ type: 'Find Match' })
        );
    });

    document.getElementById('createTournamentBtn').addEventListener('click', async () => {
        // CREATE TOURNAMENT LOGIC IN BACKEND 
        
        // Add event listener before unload or on socket?

        const response = await fetchUser('GET', {'id': getMyID()});
        if (!response) return;
        let currentUser = await assembler(response);
        currentUser = currentUser[0];
        
        const lobbyTitle = document.getElementById('lobbyTournamentModalLabel');
        lobbyTitle.textContent = currentUser.nickname + '\'s Tournament';
        addParticipant(currentUser.nickname, currentUser.avatar);    
        
        const gameMenuModal = bootstrap.Modal.getInstance(document.getElementById('gameMenuModal'));
        gameMenuModal.hide();
        const lobbyTournamentModal = bootstrap.Modal.getInstance(document.getElementById('lobbyTournamentModal'));
        lobbyTournamentModal.show();
    });

    document.getElementById('joinTournamentBtn').addEventListener('click', function(event) {
        const gameMenuModal = bootstrap.Modal.getInstance(document.getElementById('gameMenuModal'));
        gameMenuModal.hide()
        const joinModal = bootstrap.Modal.getInstance(document.getElementById('joinTournamentModal'));
        joinModal.show();
    });
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

// function initCreateTournamentMenu() {
    // const tournamentForm = document.getElementById('tournamentForm');

    // tournamentForm.addEventListener('submit', function(event) {
    //     event.preventDefault();
    //     const tournamentName = document.getElementById('tournamentName');

    //     const lobbyTitle = document.getElementById('lobbyTournamentModalLabel');
    //     lobbyTitle.textContent = tournamentName.value;  // Set the text of the title
    //     tournamentName.value = '';

    //     const createTournamentModal = bootstrap.Modal.getInstance(document.getElementById('createTournamentModal'));
    //     createTournamentModal.hide();

    //     const lobbyTournamentModal = bootstrap.Modal.getInstance(document.getElementById('lobbyTournamentModal'));
    //     lobbyTournamentModal.show();
    // });

    // document.getElementById('cancelCreateTournament').addEventListener('click', function(event) {
    //     const createTournamentModal = bootstrap.Modal.getInstance(document.getElementById('createTournamentModal'));
    //     createTournamentModal.hide();
    //     const gameMenuModal = bootstrap.Modal.getInstance(document.getElementById('gameMenuModal'));
    //     gameMenuModal.show();
    // });
// }


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
    initMainGameMenu(world)
    // initCreateTournamentMenu()
    initLobbyTournament()
    initInviteTournament()
    initJoinTournament()
}
