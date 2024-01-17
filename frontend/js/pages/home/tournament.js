import { assembler } from '../../api/assembler.js';
import interactiveSocket, { hideAllUI } from './socket.js';
import { displayToast } from './toastNotif.js';
import { fetchUserById, getMyID, switchModals, isModalShown, hideModal, showModal } from './utils.js';
import { fetchMe, fetchAllLobbies, fetchMyLobby } from '../../api/fetchData.js';
import { World } from '../game/src/World.js';

// This is handler for when someone sent something with socket and it worked.
export function socketTournamentUser(action, ownerTournamentID) {

    switch (action) {
        case 'createTournament':
            someoneCreateTournament(ownerTournamentID);
            break;
        case 'cancelTournament':
            someoneCancelTournament(ownerTournamentID);
            break;
        case 'joinTournament':
            someoneJoinLobby(ownerTournamentID);
            break;
        case 'leftTournament':
            someoneLeftLobby(ownerTournamentID);
            break;
        case 'startTournament':
            tournamentStarting(ownerTournamentID)
            break;
        default:
            console.log("DEFAULT")
            socketLobbyError(action, ownerTournamentID);
            break;
    }
}

// This is handler for response to request I sent with socket and failed
export function socketLobbyError(action, ownerTournamentID) {
    console.log("ZZZ", action);
    switch (action){
        case 'invalidStart':
            // Tried to start a tournament that doesn't exist
            console.log("invalidStart");
            cancelEverythingTournament();
            displayToast("You retarded, tf you doing", "Tournament doesn't exist");
            break;
        case 'invalidJoin':
            // Tried to join a tournament that doesn't exist
            console.log("invalidJoin");
            displayToast("This tournament no longer exist.", "Tournament doesn't exist");
            updateTournamentList();
            break;
        case 'lobbyFull':
            // Tried to join a lobby that was full
            console.log("lobbyFull")
            displayToast("This lobby is full.", "Lobby Full");
            break;
        case 'createFailure':
            // Failed to create a lobby
            console.log("createFailure")
            displayToast("Failed to create a tournament.", "Tournament Creation Failed");
            cancelEverythingTournament();
            break;
        case 'leaveError':
            // Tried to leave a lobby that wasn't found
            console.log("leaveError")
            displayToast("You tried to leave a tournament that no longer exist. Back to menu.", "Tournament Leave Failed");
            cancelEverythingTournament();
            break;
        case 'spotError':
            // Tried to leave a lobby you're not in
            console.log("spotError")
            displayToast("You tried to leave a tournament that you're not in. Back to menu.", "Tournament Leave Failed");
            cancelEverythingTournament();
            break;
        case 'cancelError':
            // Tried canceling a tournament that doesn't exist
            console.log("cancelError")
            displayToast("You tried to cancel a tournament that no longer exist. Back to menu.", "Tournament Cancel Failed");
            cancelEverythingTournament();
            break;
        default:
            console.error("Ayo wtf is this error: " + action)
            break;
    }
    console.log("LOBBY ERROR")
}

function cancelEverythingTournament() {
    removeInfoLobbyModal();
    document.getElementById('lobbyTournamentModal').removeEventListener('hide.bs.modal', leftTournament);
    document.getElementById('lobbyTournamentModal').removeEventListener('hide.bs.modal', cancelTournament);
    document.getElementById('startTournamentBtn').removeEventListener('click', startTournament);
    document.getElementById('cancelTournamentBtn').removeEventListener('click', cancelTournament);
    checkModal();
}

function someoneCancelTournament(ownerTournamentID) {
    if (isModalShown('joinTournamentModal') && !isUserInTournament(ownerTournamentID))
        updateTournamentList();
    else if (isUserInTournament(ownerTournamentID)) {
        updateTournamentList();
        document.getElementById('lobbyTournamentModal').removeEventListener('hide.bs.modal', leftTournament);
        switchModals('lobbyTournamentModal', 'joinTournamentModal')
        displayToast('The tournament has been cancelled by the host.', 'Tournament Cancelled')
    }
}

function someoneCreateTournament(ownerTournamentID) {
    if (isModalShown('joinTournamentModal') && !isUserInTournament(ownerTournamentID)) {
        updateTournamentList();
    } else if (isUserInTournament(ownerTournamentID)) {
        updateParticipantList()
        document.getElementById('startTournamentBtn').addEventListener('click', startTournament);
        switchModals('joinTournamentModal', 'lobbyTournamentModal')
        document.getElementById('lobbyTournamentModal').addEventListener('hide.bs.modal', cancelTournament);
        displayToast('The tournament has been created successfully.', 'Tournament Created')
    }
}

// Quand quelqu'un quitte un tournoi - Envpoyé par le Socket de celui qui leave un tournoi
function someoneLeftLobby(ownerTournamentID) {
    console.log("SOMEONE LEAVED A LOBBY")
    if (isModalShown('joinTournamentModal') && !isUserInTournament(ownerTournamentID)) {
        updateTournamentListNbr('remove', ownerTournamentID);
    } else if (isUserInTournament(ownerTournamentID)) {
        updateParticipantList()
    }
}

// Quand quelqu'un rejoins le tournoi - Envoyé par le Socket de celui qui join
function someoneJoinLobby(ownerTournamentID) {
    console.log("SOMEONE JOINED A LOBBY, UPDATE ", ownerTournamentID)
    if (isModalShown('joinTournamentModal') && !isUserInTournament(ownerTournamentID)) {
        console.log("UPDATE TOURNAMENT PLAYER NBR LIST")
        updateTournamentListNbr('add', ownerTournamentID);
    } else if (isUserInTournament(ownerTournamentID)) {
        if (!isModalShown('lobbyTournamentModal')) {
            switchModals('joinTournamentModal', 'lobbyTournamentModal')
            console.log("SHOW MODAL")
        }
        console.log("UPDATE PARTICIPANT LIST")
        updateParticipantList()
    }
}

function tournamentStarting(ownerTournamentID) {
    console.log("TOURNAMENT STARTING TRIGGER BY OWNER SOCKET")
    if (isModalShown('joinTournamentModal') && !isUserInTournament(ownerTournamentID)) {
        updateTournamentList();
    } else if (isUserInTournament(ownerTournamentID)) {
        transferToTournament()
    }
}

export function updateTournamentListNbr(action, ownerTournamentID) {
    const tournamentToUpdate = document.querySelector(`#tournamentList li[data-id="${ownerTournamentID}"] small`)
    if (!tournamentToUpdate) return;
    const nbr = tournamentToUpdate.textContent.split('/')[0]
    if (action == 'add') {
        tournamentToUpdate.textContent = `${parseInt(nbr) + 1}/4 Players`
    } else if (action == 'remove') {
        tournamentToUpdate.textContent = `${parseInt(nbr) - 1}/4 Players`
    }
}

///////////////////////////////////
//// TRIGGER BY EVENT LISTENER ////
///////////////////////////////////

// Quand je crée un tournoi - Trigger par event listener
export async function handleCreateTournamentClick() {
    const response = await fetchMe('GET');
    if (!response) return;
    const lobbyModalEl = document.getElementById('lobbyTournamentModal')
    const myID = getMyID();
    if (!myID)
        return;
    
    document.getElementById('participantList').innerHTML = '';
    document.getElementById('waitingMessage').textContent = 'Waiting for more players (1/4)';
    document.getElementById('startTournamentBtn').classList.add('d-none');
    lobbyModalEl.dataset.id = myID

    interactiveSocket.sendMessageSocket(JSON.stringify({ "type": "Tournament", "action": "Create" }));

    const cancelBtn = document.getElementById('cancelTournamentBtn');
    cancelBtn.textContent = 'Cancel Tournament';
}

// Quand je suis owner et cancel mon tournoi - Trigger par event listener
export function cancelTournament() {
    console.log("CANCEL TOURNAMENT")
    // Socket doit envoyer: cancelTournament
    interactiveSocket.sendMessageSocket(JSON.stringify({ "type": "Tournament", "action": "Cancel" }));
    document.getElementById('lobbyTournamentModal').removeEventListener('hide.bs.modal', cancelTournament);
    switchModals('lobbyTournamentModal', 'gameMenuModal')
    displayToast('The tournament has been cancelled successfully.', 'Tournament Cancelled')
    removeInfoLobbyModal()
}

// Quand je quitte le tournoi - Trigger par event listener
export async function leftTournament(event) {
    console.log("LEFT TOURNAMENT")
    interactiveSocket.sendMessageSocket(JSON.stringify({ "type": "Tournament", "action": "Leave" }));
    document.getElementById('lobbyTournamentModal').removeEventListener('hide.bs.modal', leftTournament);
    switchModals('lobbyTournamentModal', 'joinTournamentModal')
    removeInfoLobbyModal()
    updateTournamentList()
}

// Quand je rejoins un tournoi - Trigger par event listener
export async function joinTournament(event) {
    const currentElement = event.currentTarget
    const ownerID = currentElement.dataset.id

    const lobbyModalEl = document.getElementById('lobbyTournamentModal')
    lobbyModalEl.addEventListener('hide.bs.modal', leftTournament)
    lobbyModalEl.dataset.id = ownerID;

    console.log("JOINING ", ownerID)
    // Socket doit envoyer: joinTournament -> owner ID
    interactiveSocket.sendMessageSocket(JSON.stringify({ "type": "Tournament", "action": "Join", "owner_id": ownerID }));

    const leaveBtn = document.getElementById('cancelTournamentBtn');
    leaveBtn.textContent = 'Leave Tournament';
}

// Quand le owner start le tournoi - Trigger par event listener
export function startTournament(event) {
    interactiveSocket.sendMessageSocket(JSON.stringify({ "type": "Tournament", "action": "Start" }));

    // [ONLY TOURNAMENT OWNER CAN START]
    // Socket doit envoyer: startTournament
}

/////////////
/// UTILS ///
/////////////

function addParticipant(user) {
    if (!user)
        return;
    const participantList = document.getElementById('participantList');
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex align-items-center';
    li.dataset.id = user.id

    const img = document.createElement('img');
    img.src = user.avatar;
    img.alt = user.nickname + ' Avatar';
    img.className = 'rounded-circle me-2';
    img.style.width = '30px';
    img.style.height = '30px';

    const text = document.createTextNode(nickname);
    text.textContent = user.nickname

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
        toggleStartBtnForOwner(true)
    } else {
        waitingMessage.classList.add('bg-warning');
        waitingMessage.classList.remove('bg-success');
        toggleStartBtnForOwner(false);
    }
}

export async function updateTournamentList() {
    // Fetch la view du backend pour update la liste de tournoi car un tournoi viens d'être cancel ou créer.
    const response = await fetchAllLobbies('GET')
    if (!response) return;
    let tournaments = await assembler(response)
    tournaments = tournaments['lobbies']

    const tournamentList = document.getElementById('tournamentList');
    tournamentList.innerHTML = '';

    tournaments.forEach(tournament => {
        tournamentList.appendChild(createTournamentElement(tournament));
    });
    function createTournamentElement(tournament) {
        const li = document.createElement('li');
        li.dataset.id = tournament.owner_id
        li.className = 'list-group-item d-flex justify-content-start align-items-center';
        const img = document.createElement('img');
        img.src = tournament.owner_avatar;
        img.alt = "Creator's Avatar";
        img.className = 'rounded-circle me-2';
        img.style.width = '40px';
        img.style.height = '40px';

        const div = document.createElement('div');
        const h6 = document.createElement('h6');
        h6.className = 'mb-0';
        h6.textContent = tournament.owner_nickname + '\'s lobby';

        const small = document.createElement('small');
        small.textContent = `${tournament.player_count}/4 Players`;

        div.appendChild(h6);
        div.appendChild(small);

        li.appendChild(img);
        li.appendChild(div);

        li.addEventListener('click', joinTournament);
        return li;
    }
}

export async function updateParticipantList() {
    const response = await fetchMyLobby('GET');
    if (!response) return;
    // Error handling if response.status >= 400
    let tournament = await assembler(response);
    tournament = tournament['lobby']
    const participantList = document.getElementById('participantList');
    participantList.innerHTML = '';


    const players = Object.values(tournament);
    players.forEach(player => {
        addParticipant(player);
    });
    updateBracket(tournament)
}

function updateBracket(tournament) {
    const bracket = document.getElementById('bracket');

    const title = bracket.querySelector('#tournament-name-bracket');
    title.textContent = tournament.owner.nickname + '\'s tournament'

    const player1 = bracket.querySelector('#r1-p1');
    const player2 = bracket.querySelector('#r1-p2');
    const player3 = bracket.querySelector('#r1-p3');
    const player4 = bracket.querySelector('#r1-p4');

    if (tournament.owner)
        player1.textContent = tournament.owner.nickname
    if (tournament.player_2)
        player2.textContent = tournament.player_2.nickname
    if (tournament.player_3)
        player3.textContent = tournament.player_3.nickname
    if (tournament.player_4)
        player4.textContent = tournament.player_4.nickname
}

////// FOR UTILS FILE //////

export function toggleStartBtnForOwner(shouldShow) {
    const startTournamentBtn = document.getElementById('startTournamentBtn');
    const userID = getMyID();
    if (!userID || !isUserInTournament(userID)) return;

    const isCurrentlyHidden = startTournamentBtn.classList.contains('d-none');

    if (shouldShow && isCurrentlyHidden) {
        startTournamentBtn.classList.remove('d-none');
    } else if (!shouldShow && !isCurrentlyHidden) {
        startTournamentBtn.classList.add('d-none');
    }
}

export function isUserInTournament(ownerTournamentID) {
    const lobbyModalEl = document.getElementById('lobbyTournamentModal');
    if (lobbyModalEl.dataset.id == ownerTournamentID) {
        return true;
    }
    return false;
}

export function removeInfoLobbyModal() {
    const lobbyTournamentModal = document.getElementById('lobbyTournamentModal')
    lobbyTournamentModal.dataset.id = ''
    const participantList = lobbyTournamentModal.querySelector('#participantList')
    participantList.innerHTML = '';
}

export function transferToTournament() {
    document.getElementById('lobbyTournamentModal').removeEventListener('hide.bs.modal', leftTournament);
    document.getElementById('lobbyTournamentModal').removeEventListener('hide.bs.modal', cancelTournament);
    hideAllUI();
    World._instance.camera.viewTable(1, null);


    setTimeout(function () {
        document.getElementById('result').classList.remove('d-none')
        document.getElementById('bracket').classList.remove('d-none')
    }, 1000);
    removeInfoLobbyModal();
}
