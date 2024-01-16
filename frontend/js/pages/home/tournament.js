import { assembler } from '../../api/assembler.js';
import interactiveSocket from './socket.js';
import { displayToast } from './toastNotif.js';
import { fetchUserById, getMyID, switchModals, showModal, isModalShown, hideModal } from './utils.js';
import { fetchMe, fetchTournament } from '../../api/fetchData.js';

// VIEW BACKEND
// - Quand user join tournament, vérifier qu'il est pas dans un autre lobby en cours
//
//
//

export function socketTournamentUser(action, concernUserID, ownerTournamentID) {
    if (action === 'createTournament' || action === 'cancelTournament') {
        handleTournamentCreationOrCancellation(ownerTournamentID, action);
    } else {
        // Check if user is part of the tournament
        if (!isUserInTournament(ownerTournamentID)) return;

        switch (action) {
            case 'joinTournament':
                someoneJoinLobby(concernUserID, ownerTournamentID);
                break;
            case 'leftTournament':
                someoneLeftLobby(concernUserID, ownerTournamentID);
                break;
            case 'startTournament':
                tournamentStarting()
                break;
        }
    }
}

function handleTournamentCreationOrCancellation(ownerTournamentID, action) {
    if (isModalShown('joinTournamentModal')) {
        updateTournamentList();
    } else if (isModalShown('lobbyTournamentModal') && action == 'cancelTournament') {
        isMyTournamentCancel(ownerTournamentID);
    }
}

function isMyTournamentCancel(ownerTournamentID) {
    if (!isUserInTournament(ownerTournamentID))
        return
    // Le tournoi dans lequel je suis a été annulé par le owner.
    switchModals('lobbyTournamentModal', 'joinTournamentModal')
    displayToast('The tournament has been cancelled by the host.', 'Tournament Cancelled')
    // Need to fetch something ? 
}

// Quand quelqu'un quitte un tournoi - Envpoyé par le Socket de celui qui leave un tournoi
function someoneLeftLobby(leavingUserID, ownerTournamentID) {
    // More Logic ?
    // Check if it is in my tournament
    removeParticipant(leavingUserID)
}

// Quand quelqu'un rejoins le tournoi - Envoyé par le Socket de celui qui join
function someoneJoinLobby(joiningUserID, ownerTournamentID) {
    // More logic ?
    // Check if it is in my tournament
    addParticipant(joiningUserID)
}

function tournamentStarting() {
    console.log("TOURNAMENT STARTING TRIGGER BY SOCKET")
    transferToInfoModal()
}


///////////////////////////////////
//// TRIGGER BY EVENT LISTENER ////
///////////////////////////////////

// Quand je crée un tournoi - Trigger par event listener
export async function handleCreateTournamentClick() {
    const response = await fetchMe('GET');
    if (!response) return;
    const lobbyModalEl = document.getElementById('lobbyTournamentModal')
    const lobbyModal = bootstrap.Modal.getInstance(lobbyModalEl)
    const myID = getMyID();
    if (!myID)
        return;

    document.getElementById('startTournamentBtn').addEventListener('click', startTournament);
    lobbyModalEl.addEventListener('hide.bs.modal', cancelTournament);

    lobbyModalEl.dataset.id = myID
    const user = await assembler(response);
    addParticipant(user)
    const cancelBtn = document.getElementById('cancelTournamentBtn');
    cancelBtn.textContent = 'Cancel Tournament';
    hideModal('gameMenuModal')
    lobbyModal.show()


    // Socket doit envoyer: createTournament -> owner ID
    // +
    // (?) Créé tournoi dans backend
}

// Quand je suis owner et cancel mon tournoi - Trigger par event listener
function cancelTournament() {
    console.log("CANCEL TOURNAMENT")
    // Socket doit envoyer: cancelTournament
    // +
    // (?) backend delete le tournoi
    document.getElementById('lobbyTournamentModal').removeEventListener('hide.bs.modal', cancelTournament);
    switchModals('lobbyTournamentModal', 'gameMenuModal')
    displayToast('The tournament has been cancelled successfully.', 'Tournament Cancelled')
    removeInfoLobbyModal()
}

// Quand je rejoins un tournoi - Trigger par event listener
export function joinTournament(event) {
    const currentElement = event.currentTarget
    const ownerID = currentElement.dataset.id
    
    const lobbyModalEl = document.getElementById('lobbyTournamentModal')
    lobbyModalEl.addEventListener('hide.bs.modal', leftTournament)
    lobbyModalEl.dataset.id = ownerID;

    // Socket doit envoyer: joinTournament -> owner ID

    const leaveBtn = document.getElementById('cancelTournamentBtn');
    leaveBtn.textContent = 'Leave Tournament';

    // fetch backend tournoi pour display liste de joueur dans lobbyTournamentModal de ce tournoi
    switchModals('joinTournamentModal', 'lobbyTournamentModal')
}

// Quand je quitte le tournoi - Trigger par event listener
async function leftTournament(event) {
    console.log("LEFT TOURNAMENT")
    // Socket doit envoyer: leftTournament -> owner ID
    document.getElementById('lobbyTournamentModal').removeEventListener('hide.bs.modal', leftTournament);
    switchModals('lobbyTournamentModal', 'joinTournamentModal')
    removeInfoLobbyModal()
    updateTournamentList()
}

// Quand le owner start le tournoi - Trigger par event listener
export function startTournament(event) {
    transferToInfoModal()

    // [ONLY TOURNAMENT OWNER CAN START]
    // Socket doit envoyer: startTournament
    // + (?) fetch backend to change status of tournament
}

/////////////
/// UTILS ///
/////////////

// Sert à afficher la nouvelle personne qui join le lobby du tournoi,
function addParticipant(user) {
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

// Sert à retirer une personne du lobby quand elle quitte.
function removeParticipant(userId) {
    const participantList = document.getElementById('participantList');
    const participants = participantList.querySelectorAll('li');

    for (let participant of participants) {
        if (participant.dataset.id == userId) {
            participantList.removeChild(participant);
            break;
        }
    }
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

function toggleStartBtnForOwner(shouldShow) {
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

function isUserInTournament(ownerTournamentID) {
    const lobbyModalEl = document.getElementById('lobbyTournamentModal');
    const isModalShown = lobbyModalEl.classList.contains('show');
    if (isModalShown && lobbyModalEl.dataset.id == ownerTournamentID) {
        return true;
    }
    return false;
}

function removeInfoLobbyModal() {
    const lobbyTournamentModal = document.getElementById('lobbyTournamentModal')
    lobbyTournamentModal.dataset.id = ''
    const participantList = lobbyTournamentModal.querySelector('#participantList')
    participantList.innerHTML = '';
}

function transferToInfoModal() {
    document.getElementById('lobbyTournamentModal').removeEventListener('hide.bs.modal', leftTournament);
    document.getElementById('lobbyTournamentModal').removeEventListener('hide.bs.modal', cancelTournament);
    
    switchModals('lobbyTournamentModal', 'tournamentInfoModal')
    // Add event listener on tournamentInfoModal to know when the modal is closing.
}

export async function updateTournamentList() {
    // Fetch la view du backend pour update la liste de tournoi car un tournoi viens d'être cancel ou créer.
    const response = await fetchTournament('GET')
    if(!response) return;
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