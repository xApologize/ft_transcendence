import { assembler } from '../../api/assembler.js';2
import interactiveSocket from './socket.js';
import { displayToast } from './toastNotif.js';
import { getMyID, switchModals, isModalShown, hideElementById } from './utils.js';
import { fetchMe, fetchMatchHistory } from '../../api/fetchData.js';
import { World } from '../game/src/World.js';
import { checkModal } from '../../router.js';
import { getOpponentID } from '../game/src/systems/Match.js';
import { cleanBracket, removeInfoLobbyModal, isUserInTournament, updateParticipantList, updateTournamentList } from './tournamentUtils.js';
import { hideAllUI } from './utils.js';

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
        case 'Tournament Match End':
            tournamentMatchEnd(ownerTournamentID);
            break;
        case "Final Match End":
            finalMatchEnd(ownerTournamentID)
            break;
        case "abortTournament":
            abortTournament();
            break;
        default:
            socketLobbyError(action, ownerTournamentID);
            break;
    }
}

// This is handler for response to request I sent with socket and failed
export function socketLobbyError(action, ownerTournamentID) {
    switch (action){
        case 'invalidStart':
            // Tried to start a tournament that doesn't exist
            cancelEverythingTournament();
            displayToast("You cannot start a tournament that does not exist.", "Tournament doesn't exist");
            break;
        case 'invalidJoin':
            // Tried to join a tournament that doesn't exist
            displayToast("This tournament no longer exist.", "Tournament doesn't exist");
            updateTournamentList();
            break;
        case 'lobbyFull':
            // Tried to join a lobby that was full
            displayToast("This lobby is full.", "Lobby Full");
            break;
        case 'createFailure':
            // Failed to create a lobby
            displayToast("Failed to create a tournament.", "Tournament Creation Failed");
            cancelEverythingTournament();
            break;
        case 'leaveError':
            // Tried to leave a lobby that wasn't found
            displayToast("You tried to leave a tournament that no longer exist. Back to menu.", "Tournament Leave Failed");
            cancelEverythingTournament();
            break;
        case 'spotError':
            // Tried to leave a lobby you're not in
            displayToast("You tried to leave a tournament that you're not in. Back to menu.", "Tournament Leave Failed");
            cancelEverythingTournament();
            break;
        case 'cancelError':
            // Tried canceling a tournament that doesn't exist
            displayToast("You tried to cancel a tournament that no longer exist. Back to menu.", "Tournament Cancel Failed");
            cancelEverythingTournament();
            break;
        default:
            console.error("Ayo wtf is this error: " + action)
            break;
    }
}

function abortTournament() {
    if (!World._instance.match) return;
    World._instance.match.endMatch();
}

function isUserInCurrentTournament(myID, players = null) {
    if (!players) {
        players = {};
        const bracket = document.getElementById('tournamentBracket');
        for (let i = 1; i <= 4; i++) {
            players[`player${i}`] = bracket.querySelector(`#r1-p${i}`);
        }
    }
    if (Object.values(players).some(player => player.dataset.id == myID)) {
        return true;
    }
    return false;
}

async function finalMatchEnd(winnerUserID) {
    const myID = getMyID();
    if (!myID) return ;


    if (!isUserInCurrentTournament(myID)) return;
    let players = {};
    for (let i = 1; i <= 2; i++) {
        players[`player${i}`] = bracket.querySelector(`#r2-p${i}`);
    }

    const response = await fetchMatchHistory('GET', null, {'id': winnerUserID}, 'tournament/');
    const data = await assembler(response);
    if (data) {
        const { winner, loser } = determineTournamentWinner(players, data);
        appendScores(winner, loser, data);
    }

    function determineTournamentWinner(players, data) {
        let winner, loser;
        if (data.winner_username === players.player1.textContent) {
            winner = players.player1;
            loser = players.player2;
        } else if (data.winner_username === players.player2.textContent) {
            winner = players.player2;
            loser = players.player1;
        }
        return { winner, loser };
    }

}

async function tournamentMatchEnd(winnerUserID) {
    const myID = getMyID();
    if (!myID) 
        return;
    
    const bracket = document.getElementById('tournamentBracket');
    let players = {};
    for (let i = 1; i <= 4; i++) {
        players[`player${i}`] = bracket.querySelector(`#r1-p${i}`);
    }
    if (!isUserInCurrentTournament(myID, players))
        return;
    else
        await updateOnGoingBracket(players, myID, winnerUserID);
}

async function updateOnGoingBracket(players, myID, winnerUserID) {
    const playerValues = Object.values(players);
    const myPlace = playerValues.findIndex(player => player.dataset.id == myID);
    if (myPlace === -1 || myPlace >= playerValues.length) {
        return;
    }
    const myOpponentPlace = getOpponentID(playerValues[myPlace].id);
    const myOpponent = document.getElementById(myOpponentPlace);
    if (!myOpponent || myOpponent.dataset.id == winnerUserID || myID == winnerUserID) {
        return;
    }

    let data = null
    if ([players.player3, players.player4].some(player => player.dataset.id == myID) ) {
        const response = await fetchMatchHistory('GET', null, {'id': players.player1.dataset.id}, 'tournament/');
        data = response && await assembler(response);
    } else if ([players.player1, players.player2].some(player => player.dataset.id == myID)) {
        const response = await fetchMatchHistory('GET', null, {'id': players.player3.dataset.id}, 'tournament/');
        data = response && await assembler(response);
    }

    if (data) {
        const { winner, loser } = determineWinnerAndLoser(players, data);
        appendScores(winner, loser, data);
        preparationFinal(winner, players, myID)
    }
}

function preparationFinal(winner, players, myID) {
    if (!winner) return;
    if ([players.player3, players.player4].some(player => player.dataset.id == myID) ) {
        document.getElementById('r2-p1').textContent = winner.textContent.slice(0, -1);
    } else if ([players.player1, players.player2].some(player => player.dataset.id == myID)) {
        document.getElementById('r2-p2').textContent = winner.textContent.slice(0, -1);
    }
}

function determineWinnerAndLoser(players, data) {
    let winner, loser;
    if (data.winner_username === players.player1.textContent) {
        winner = players.player1;
        loser = players.player2;
    } else if (data.winner_username === players.player2.textContent) {
        winner = players.player2;
        loser = players.player1;
    } else if (data.winner_username === players.player3.textContent) {
        winner = players.player3;
        loser = players.player4;
    }
    else if (data.winner_username === players.player4.textContent) {
        winner = players.player4;
        loser = players.player3;
    }
    return { winner, loser };
}

function appendScores(winner, loser, data) {
    if (!winner) return;
    winner.classList.add('winner');
    appendScore(winner, data.winner_score);
    appendScore(loser, data.loser_score);
}

function appendScore(player, score) {
    if (!player.querySelector('span')) {
        const newElement = document.createElement('span');
        newElement.textContent = score;
        player.appendChild(newElement);
    }
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
        removeInfoLobbyModal()
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
    if (isModalShown('joinTournamentModal') && !isUserInTournament(ownerTournamentID)) {
        updateTournamentListNbr('remove', ownerTournamentID);
    } else if (isUserInTournament(ownerTournamentID)) {
        updateParticipantList()
    }
}

// Quand quelqu'un rejoins le tournoi - Envoyé par le Socket de celui qui join
function someoneJoinLobby(ownerTournamentID) {
    if (isModalShown('joinTournamentModal') && !isUserInTournament(ownerTournamentID)) {
        updateTournamentListNbr('add', ownerTournamentID);
    } else if (isUserInTournament(ownerTournamentID)) {
        if (!isModalShown('lobbyTournamentModal')) {
            switchModals('joinTournamentModal', 'lobbyTournamentModal')
        }
        updateParticipantList()
    }
}

function tournamentStarting(ownerTournamentID) {
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
    hideElementById('startTournamentBtn')
    lobbyModalEl.dataset.id = myID

    interactiveSocket.sendMessageSocket(JSON.stringify({ "type": "Tournament", "action": "Create" }));

    const cancelBtn = document.getElementById('cancelTournamentBtn');
    cancelBtn.textContent = 'Cancel Tournament';
}

// Quand je suis owner et cancel mon tournoi - Trigger par event listener
export function cancelTournament() {
    // Socket doit envoyer: cancelTournament
    interactiveSocket.sendMessageSocket(JSON.stringify({ "type": "Tournament", "action": "Cancel" }));
    document.getElementById('lobbyTournamentModal').removeEventListener('hide.bs.modal', cancelTournament);
    document.getElementById('startTournamentBtn').removeEventListener('click', startTournament);
    document.getElementById('cancelTournamentBtn').removeEventListener('click', cancelTournament);
    document.getElementById('startTournamentBtn').classList.add('d-none');
    switchModals('lobbyTournamentModal', 'gameMenuModal')
    displayToast('The tournament has been cancelled successfully.', 'Tournament Cancelled')
    removeInfoLobbyModal()
    cleanBracket()
}

// Quand je quitte le tournoi - Trigger par event listener
export async function leftTournament(event) {
    interactiveSocket.sendMessageSocket(JSON.stringify({ "type": "Tournament", "action": "Leave" }));
    document.getElementById('lobbyTournamentModal').removeEventListener('hide.bs.modal', leftTournament);
    switchModals('lobbyTournamentModal', 'joinTournamentModal')
    removeInfoLobbyModal()
    updateTournamentList()
    cleanBracket()
}

// Quand je rejoins un tournoi - Trigger par event listener
export async function joinTournament(event) {
    const currentElement = event.currentTarget
    const ownerID = currentElement.dataset.id

    const lobbyModalEl = document.getElementById('lobbyTournamentModal')
    lobbyModalEl.addEventListener('hide.bs.modal', leftTournament)
    lobbyModalEl.dataset.id = ownerID;

    // Socket doit envoyer: joinTournament -> owner ID
    interactiveSocket.sendMessageSocket(JSON.stringify({ "type": "Tournament", "action": "Join", "owner_id": ownerID }));

    const leaveBtn = document.getElementById('cancelTournamentBtn');
    leaveBtn.textContent = 'Leave Tournament';
}

// Quand le owner start le tournoi - Trigger par event listener
export function startTournament(event) {
    interactiveSocket.sendMessageSocket(JSON.stringify({ "type": "Tournament", "action": "Start" }));
}

export function transferToTournament() {
    const startTournamentBtn = document.getElementById('startTournamentBtn');
    startTournamentBtn.removeEventListener('click', startTournament);
    startTournamentBtn.classList.add('d-none');
    document.getElementById('lobbyTournamentModal').removeEventListener('hide.bs.modal', leftTournament);
    document.getElementById('lobbyTournamentModal').removeEventListener('hide.bs.modal', cancelTournament);
    document.getElementById('cancelTournamentBtn').removeEventListener('click', cancelTournament);
    document.getElementById('leaveTournament').classList.toggle('d-none', true);
    hideAllUI();
    World._instance.camera.viewTable(1, null);


    setTimeout(function () {
        document.getElementById('result').classList.remove('d-none')
        document.getElementById('bracket').classList.remove('d-none')
    }, 1000);
    removeInfoLobbyModal();
}

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
