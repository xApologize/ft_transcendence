import { Vector3 } from 'three';
import { World } from '../World.js';
import { Player } from '../components/Player.js';
import { Opponent } from '../components/Opponent.js';
import { GameState } from './GameStates.js';
import { Updatable } from '../modules/Updatable.js';
import { fetchMatchHistory } from '../../../../api/fetchData.js';

let world;
let lastSocketTime;
const maxScore = 3;

const divNicknames = [ 'left-player-name', 'right-player-name' ];

class Match {
	constructor( path, myId, myNickname, opponentNickname ) {
		world = World._instance;

		world.currentGameState = GameState.Connecting;
		
		this.socket = new WebSocket('wss://' + window.location.host + path);

		this.participants = [];

		for (let i = 0; i < 2; i++) {
			if ( i == myId ) {
				this.participants.push( new Player( new Vector3( -7.2 + 14.4 * i, 0, 0 ), i ) );
				this.participants[i].nickname = myNickname;
				this.self = this.participants[i];
			} else {
				this.participants.push( new Opponent( new Vector3( -7.2 + 14.4 * i, 0, 0 ), i ) );
				this.participants[i].nickname = opponentNickname;
				this.opponent = this.participants[i];
			}
			this.participants[i].sideId = i;
			this.participants[i].position.setZ( -1 );
			document.getElementById(divNicknames[i]).classList.remove("d-none");
			document.getElementById(divNicknames[i]).innerHTML = this.participants[i].nickname;
		}
		world.terrain.leftGoalZone.paddle = this.participants[0];
		world.terrain.rightGoalZone.paddle = this.participants[1];
		
		this.initMatch();
		document.getElementById('lfp').classList.add("d-none");

		this.updatable = new Updatable( this );
		lastSocketTime = Date.now();
		this.loading = false;
	}

	update() {}

	fixedUpdate() {
		if ( Date.now() - lastSocketTime > 3000) {
			this.endMatch();
			document.getElementById("loading").classList.add("d-none");
			console.error("Disconnected");
			this.loading = false;
		} else if ( Date.now() - lastSocketTime > 500) {
			if (!this.loading) {
				console.warn("Instable Connection");
				document.getElementById("loading").classList.remove("d-none");
				this.loading = true;
			}
		}
		else if ( this.loading ) {
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
		world.camera.viewTable( 1, function() {
			if ( world.currentGameState === GameState.InMatch ) {
				world.balls.init();
			}
		});
	
		this.onWebsocketReceivedEvent = (event) => this.onWebsocketReceived( event );
		this.socket.addEventListener( "message", this.onWebsocketReceivedEvent );
	}

	onWebsocketReceived( event ) {
		if ( event.data === "Closing" ) {
			console.log("Opponent Ragequited");
			this.endMatch();
			return;
		}
		lastSocketTime = Date.now();

		const wsData = JSON.parse( event.data );
		if ( this.participants[wsData.id] != undefined && wsData.pos != undefined )
			this.participants[wsData.id].position.copy( wsData.pos );
		if ( wsData.smash != undefined ) {
			this.opponent.smashAnimation( wsData.smash );
		}
		if ( wsData.dashCount != undefined ) {
			this.opponent.dashSpheresAnimation( wsData.dashCount );
		}
		if ( wsData.ballInst != undefined ) {
			if ( wsData.scored == true ) {
				if ( world.terrain.leftGoalZone.paddle.isOpponent )
					world.terrain.leftGoalZone.goal( wsData.ballInst );
				if ( world.terrain.rightGoalZone.paddle.isOpponent )
					world.terrain.rightGoalZone.goal( wsData.ballInst );
			}
			else
				world.balls.overwriteInst( wsData.ballInst );
		}
	}

	endMatch() {
		world.currentGameState = GameState.MatchEnding;

		if ( world.currentGameMode === "Tournament" )
			this.showResultTournamentUI();
		else
			this.showResultMatchUI();

		this.participants.forEach(element => {
			element.dashSpheresAnimation( 0 );
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
	
		if ( this.socket != undefined)
			this.socket.close();
		this.socket.removeEventListener( "message", this.onWebsocketReceivedEvent );

		this.updatable.delete();
	}

	showResultMatchUI() {
		document.getElementById('result').classList.remove('d-none')

		document.getElementById('resultButton').onclick = function() {
			document.getElementById('result').classList.add('d-none')
			world.camera.viewLarge( 1 , function() {
				document.getElementById('ui').classList.remove("d-none");
				document.getElementById('toastContainer').classList.remove('d-none')
				world.changeStatus( "ONL" );
				world.currentGameState = GameState.InMenu;
			} );
		}

		document.getElementById('leftName').innerHTML = this.participants[0].nickname;
		document.getElementById('leftScore').innerHTML = this.participants[0].score;
		document.getElementById('rightScore').innerHTML = this.participants[1].score;
		document.getElementById('rightName').innerHTML = this.participants[1].nickname;
		if ( this.self.score < maxScore && this.opponent.score < maxScore )
			document.getElementById("resultTitle").innerHTML = "Disconnected";
		if ( this.self.score >= maxScore ) {
			document.getElementById("fanfare").play();
			document.getElementById("resultTitle").innerHTML = "YOU WIN!";
		}
		if ( this.opponent.score >= maxScore )
			document.getElementById("resultTitle").innerHTML = "YOU LOST!";
	}

	showResultTournamentUI() {
		
	}


	increment( sideId ) {
		this.participants[sideId - 1].score += 1;

		world.score.setText(
			( this.participants[0].score < 10 ? "0" : "" ) + this.participants[0].score, 
			( this.participants[1].score < 10 ? "0" : "" ) + this.participants[1].score
		);

		if ( this.self.score >= maxScore ) {
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
		const response = fetchMatchHistory( 'POST', data );
		if ( !response ) {
			console.error( "No response from POST MatchHistory" );
			return;
		}
	}
}

export { Match };
