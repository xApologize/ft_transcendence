import { Vector3 } from 'three';
import { World } from '../World.js';
import { Player } from '../components/Player.js';
import { Opponent } from '../components/Opponent.js';
import { GameState } from './GameStates.js';
import { Updatable } from '../modules/Updatable.js';
import { fetchMatchHistory } from '../../../../api/fetchData.js';
import { assembler } from '../../../../api/assembler.js';
import { displayMatchHistory } from '../../../../components/matchHistory/matchHistory.js';
import interactiveSocket from '../../../home/socket.js';
import { updateUserCard } from '../../../../components/userCard/userCard.js';
import { getMyID, hideElementById, resetInnerHTMLById, showElementById } from '../../../home/utils.js';
import { cleanBracket } from '../../../home/tournament.js';

let world;
let lastSocketTime;
const maxScore = 3;

const divNicknames = ['left-player-name', 'right-player-name'];

class Match {
	constructor(path, myId, myNickname, opponentNickname, tournamentStage) {
		world = World._instance;

		world.currentGameState = GameState.Connecting;
		this.waitingForGoal = false;

		this.socket = new WebSocket('wss://' + window.location.host + path);

		this.participants = [];

		for (let i = 0; i < 2; i++) {
			if (i == myId) {
				this.participants.push(new Player(new Vector3(-7.2 + 14.4 * i, 0, 0), i));
				this.participants[i].nickname = myNickname;
				this.self = this.participants[i];
			} else {
				this.participants.push(new Opponent(new Vector3(-7.2 + 14.4 * i, 0, 0), i));
				this.participants[i].nickname = opponentNickname;
				this.opponent = this.participants[i];
			}
			this.participants[i].sideId = i;
			this.participants[i].position.setZ(-1);
			document.getElementById(divNicknames[i]).classList.remove("d-none");
			document.getElementById(divNicknames[i]).innerHTML = this.participants[i].nickname;
		}
		world.terrain.leftGoalZone.paddle = this.participants[0];
		world.terrain.rightGoalZone.paddle = this.participants[1];

		this.initMatch();
		document.getElementById('lfp').classList.add("d-none");

		this.updatable = new Updatable(this);
		lastSocketTime = Date.now();
		this.loading = false;

		this.tournamentStage = tournamentStage; // 0 = no tournament, 1 = final, 2 = demi
	}

	update() { }

	fixedUpdate() {
		if (Date.now() - lastSocketTime > 3000) {
			this.endMatch();
			document.getElementById("loading").classList.add("d-none");
			console.error("Disconnected");
			this.loading = false;
		} else if (Date.now() - lastSocketTime > 500) {
			if (!this.loading) {
				console.warn("Instable Connection");
				document.getElementById("loading").classList.remove("d-none");
				this.loading = true;
			}
		}
		else if (this.loading) {
			document.getElementById("loading").classList.add("d-none");
			this.loading = false;
		}
	}

	initMatch() {
		// console.log("-- Starting Match --");
		world.currentGameState = GameState.InMatch;
		document.getElementById("coin").play();

		world.balls.hide();
		world.score.reset();
		this.participants.forEach(element => {
			element.position.setZ(0);
		});
		world.balls.renderer.setEnabled(true);
		world.balls.updatable.setEnabled(true);
		world.camera.viewTable(1, function () {
			if (world.currentGameState === GameState.InMatch) {
				world.balls.init();
			}
		});
		this.onWebsocketReceivedEvent = (event) => this.onWebsocketReceived(event);
		this.socket.addEventListener("message", this.onWebsocketReceivedEvent);
	}

	onWebsocketReceived(event) {
		if (event.data === "Closing") {
			// console.log("Opponent Ragequited");
			this.endMatch();
			return;
		}

		const wsData = JSON.parse(event.data);
		if (!this.waitingForGoal || (wsData.scored && this.waitingForGoal)) {
			lastSocketTime = Date.now();
		}


		if (this.participants[wsData.id] != undefined && wsData.pos != undefined)
			this.participants[wsData.id].position.copy(wsData.pos);
		if (wsData.smash != undefined) {
			this.opponent.smashAnimation(wsData.smash);
		}
		if (wsData.dashCount != undefined) {
			this.opponent.dashSpheresAnimation(wsData.dashCount);
		}
		if (wsData.ballInst != undefined) {
			if (wsData.scored == true) {
				this.waitingForGoal = false;
				if (world.terrain.leftGoalZone.paddle.isOpponent)
					world.terrain.leftGoalZone.goal(wsData.ballInst);
				if (world.terrain.rightGoalZone.paddle.isOpponent)
					world.terrain.rightGoalZone.goal(wsData.ballInst);
			}
			else
				world.balls.overwriteInst(wsData.ballInst);
		}
	}

	endMatch() {
		world.currentGameState = GameState.MatchEnding;

		if (this.tournamentStage > 0) {
			this.showResultTournamentUI();
		}
		else {
			this.showResultMatchUI();
			if (!document.getElementById('bracket').classList.contains('d-none'))
				document.getElementById('bracket').classList.add('d-none');
		}

		this.participants.forEach(element => {
			element.dashSpheresAnimation(0);
			element.delete();
		});
		this.participants = [];
		divNicknames.forEach(element => {
			if (document.getElementById(element))
				document.getElementById(element).classList.add("d-none");
		});

		world.balls.hide();
		world.balls.updatable.setEnabled(false);
		world.balls.renderer.setEnabled(false);

		if (this.socket != undefined)
			this.socket.close();
		this.socket.removeEventListener("message", this.onWebsocketReceivedEvent);

		this.updatable.delete();
	}

	showResultTournamentUI() {
		document.getElementById('result').classList.remove('d-none')
		document.getElementById('resultMatch').classList.remove('d-none')
		document.getElementById('bracket').classList.remove('d-none');

		document.getElementById('resultButton').classList.toggle('d-none', true);
		if (this.opponent.score >= maxScore || this.tournamentStage < 2) {
			document.getElementById('leaveTournament').addEventListener('click', this.backToMenu)
			document.getElementById('leaveTournament').classList.toggle('d-none', false)
		}

		this.setResultMatch();
		this.setBracketResult();
	}

	showResultMatchUI() {
		document.getElementById('result').classList.remove('d-none')
		document.getElementById('resultMatch').classList.remove('d-none')
		document.getElementById('bracket').classList.toggle('d-none', true)

		document.getElementById('leaveTournament').classList.toggle('d-none', true)
		document.getElementById('resultButton').classList.toggle('d-none', false);
		document.getElementById('resultButton').addEventListener('click', this.backToMenu)
		this.toggleLeaveBtn(false)
		this.setResultMatch();
	}

	increment(sideId) {
		this.participants[sideId - 1].score += 1;

		world.score.setText(
			(this.participants[0].score < 10 ? "0" : "") + this.participants[0].score,
			(this.participants[1].score < 10 ? "0" : "") + this.participants[1].score
		);

		if (this.self.score >= maxScore) {
			this.tryPostWin();
			this.endMatch();
		}
	}

	tryPostWin() {
		const data = {
			winner: this.self.nickname,
			winner_score: this.self.score,
			loser: this.opponent.nickname,
			loser_score: this.opponent.score
		}
		const response = fetchMatchHistory('POST', data);
		if (!response) return;

		if (this.tournamentStage > 0) {
			console.log("SEND FINAL")
			interactiveSocket.sendMessageSocket(JSON.stringify({ "type": "Tournament", "action": "Final" }));
		}
	}

	setResultMatch() {
		document.getElementById('leftName').innerHTML = this.participants[0].nickname;
		document.getElementById('leftScore').innerHTML = this.participants[0].score;
		document.getElementById('rightScore').innerHTML = this.participants[1].score;
		document.getElementById('rightName').innerHTML = this.participants[1].nickname;

		if (this.self.score < maxScore && this.opponent.score < maxScore) {
			document.getElementById("resultTitle").innerHTML = "Disconnected";
			if (this.tournamentStage > 0)
				this.toggleLeaveBtn(true)
		}
		if (this.self.score >= maxScore) {
			document.getElementById("fanfare").play();
			document.getElementById("resultTitle").innerHTML = "YOU WIN!";
		}
		if (this.opponent.score >= maxScore)
			document.getElementById("resultTitle").innerHTML = "YOU LOST!";
	}

	
	backToMenu(event) {
		event.currentTarget.removeEventListener('click', this.backToMenu);
		const elementsToHide = ['bracket', 'result', 'resultMatch'];
		elementsToHide.forEach(hideElementById);
		
		updateMatchHistory();
		world.camera.viewLarge(1, () => {
			showElementById('ui');
			showElementById('toastContainer')
			world.changeStatus("ONL");
			world.currentGameState = GameState.InMenu;
		});
		
		const elementsToReset = ['leftName', 'leftScore', 'rightScore', 'rightName', 'resultTitle', 'tournament-name-bracket'];
		elementsToReset.forEach(resetInnerHTMLById);
		
		cleanBracket();
	}

	toggleLeaveBtn(isTournament) {
		const backToMenuBtn = document.getElementById('resultButton');
		const leaveTournamentBtn = document.getElementById('leaveTournament');

		// Toggle visibility based on isTournament flag
		backToMenuBtn.classList.toggle('d-none', isTournament);
		leaveTournamentBtn.classList.toggle('d-none', !isTournament);
	}

	setBracketResult() {
		const myID = getMyID();
		if (!myID) return;
	
		const roundId = this.tournamentStage === 2 ? 'round-1' : 'round-2';
		const roundEl = document.getElementById(roundId);
		const myPlace = roundEl.querySelector(`[data-id="${myID}"]`);
	
		if (this.tournamentStage === 2) {
			this.updateFirstRound(roundEl, myPlace);
		} else if (this.tournamentStage === 1) {
			this.updateFinalRound(roundEl, myPlace);
		}
	}
	
	updateFirstRound(firstRoundEl, myPlace) {
		this.updateRound(firstRoundEl, myPlace, this.self.score);
		if (this.self.score >= maxScore) {
			myPlace.classList.add('winner');
			console.log("I'M THE WINNER, I AM SENDING TO SOCKET");
			setTimeout(() => {
				interactiveSocket.sendMessageSocket(JSON.stringify({ "type": "Tournament", "action": 'Tournament Match End', 'winner': myPlace.dataset.id }));
			}, 1000);
			this.setBracketFinal(myPlace, true)
		} else {
			this.setOpponentWinner(myPlace.id, firstRoundEl);
			this.setBracketFinal(myPlace, false)
		}
	}
	
	updateRound(roundEl, myPlace, score) {
		this.appendScore(myPlace, score);
		this.updateOpponentScore(myPlace.id, roundEl, this.opponent.score);
	}
	
	updateOpponentScore(myPlaceID, roundEl, score) {
		const opponentID = getOpponentID(myPlaceID);
		const opponentPlace = roundEl.querySelector(`#${opponentID}`);
		this.appendScore(opponentPlace, score);
	}
	
	setOpponentWinner(myPlaceID, roundEl) {
		const opponentID = getOpponentID(myPlaceID);
		const opponentPlace = roundEl.querySelector(`#${opponentID}`);
		opponentPlace.classList.add('winner');
	}
	
	appendScore(place, score) {
		const newElement = document.createElement('span');
		newElement.textContent = score;
		place.appendChild(newElement);
	}


	setBracketFinal(myPlace, isWinner) {
		console.log("IN SET BRACKET FINAL", myPlace, isWinner)
		if (myPlace.id == 'r1-p1' || myPlace.id == 'r1-p2') {
			const finalPlace = document.getElementById('r2-p1');
			console.log("FINAL PLACE", finalPlace)
			if (!finalPlace) return;
			if (isWinner) {
				finalPlace.textContent = myPlace.textContent.slice(0, -1);
				finalPlace.dataset.id = myPlace.dataset.id;
			} else {
				const opponentWinner =  getOpponentID(myPlace.id);
				console.log("OPPONENT ID", opponentWinner, " MY PLACE ID", myPlace.id)
				console.log("OPPONENT WINNER", opponentWinner)
				if (!opponentWinner) return;
				const opponentPlace = document.getElementById(opponentWinner);
				finalPlace.textContent = opponentPlace.textContent.slice(0, -1);
				finalPlace.dataset.id = opponentPlace.dataset.id;	
			}
		} else if (myPlace.id == 'r1-p3' || myPlace.id == 'r1-p4') {
			const finalPlace = document.getElementById('r2-p2');
			console.log("FINAL PLACE", finalPlace)
			if(!finalPlace) return;
			if (isWinner) {
				finalPlace.textContent = myPlace.textContent.slice(0, -1);
				finalPlace.dataset.id = myPlace.dataset.id;
			} else {
				const opponentWinner =  getOpponentID(myPlace.id);
				console.log("OPPONENT ID ", opponentWinner, " MY PLACE ID", myPlace.id)
				console.log("OPPONENT WINNER", opponentWinner)
				if (!opponentWinner) return;
				const opponentPlace = document.getElementById(opponentWinner);
				finalPlace.textContent = opponentPlace.textContent.slice(0, -1);
				finalPlace.dataset.id = opponentPlace.dataset.id;
			}
		}
	}

	updateFinalRound(finalEl, myPlace) {
		console.log('UPDATE FINAL ROUND', finalEl, myPlace)
		this.updateRound(finalEl, myPlace, this.self.score);
		if (this.self.score >= maxScore) {
			myPlace.classList.add('winner');
			console.log("I'M THE WINNER, I AM SENDING TO SOCKET");
			setTimeout(() => {
				interactiveSocket.sendMessageSocket(JSON.stringify({ "type": "Tournament", "action": 'Final Match End', 'winner': myPlace.dataset.id }));
			}, 1000);
		} else {
			this.setOpponentWinner(myPlace.id, finalEl);
		}
	}
}

export { Match };

async function updateMatchHistory() {
	const response = await fetchMatchHistory('GET');
	if (!response) return;
	const data = await assembler(response)
	displayMatchHistory(data)
	updateUserCard(data)
}

export function getOpponentID(myPlaceID) {
	const opponentMapping = {
		'r1-p1': 'r1-p2',
		'r1-p2': 'r1-p1',
		'r1-p3': 'r1-p4',
		'r1-p4': 'r1-p3',
		'r2-p1': 'r2-p2',
		'r2-p2': 'r2-p1',
	};
	return opponentMapping[myPlaceID];
}