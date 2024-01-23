import { fetchAllLobbies, fetchMyLobby } from '../../api/fetchData.js';
import { assembler } from '../../api/assembler.js';
import { toggleStartBtnForOwner, joinTournament } from './tournament.js';

export function cleanBracket() {
    const playerIds = ['r1-p1', 'r1-p2', 'r1-p3', 'r1-p4', 'r2-p1', 'r2-p2'];

    playerIds.forEach(id => {
        const player = document.getElementById(id);
        if (player) {
            player.classList.remove('winner');
            player.innerHTML = '';
            player.dataset.id = '';
        }
    });
}

export function removeInfoLobbyModal() {
    const lobbyTournamentModal = document.getElementById('lobbyTournamentModal')
    lobbyTournamentModal.dataset.id = ''
    const participantList = lobbyTournamentModal.querySelector('#participantList')
    participantList.innerHTML = '';
}

export function isUserInTournament(ownerTournamentID) {
    const lobbyModalEl = document.getElementById('lobbyTournamentModal');
    if (lobbyModalEl.dataset.id == ownerTournamentID) {
        return true;
    }
    return false;
}

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
    title.textContent = `${tournament.owner.nickname}'s tournament`;

    const playerElements = {
        'r1-p1': tournament.owner,
        'r1-p2': tournament.player_2,
        'r1-p3': tournament.player_3,
        'r1-p4': tournament.player_4
    };

    Object.keys(playerElements).forEach(key => {
        const player = playerElements[key];
        const element = bracket.querySelector(`#${key}`);
        if (player && element) {
            element.textContent = player.nickname;
            element.dataset.id = player.id;
        }
    });
}