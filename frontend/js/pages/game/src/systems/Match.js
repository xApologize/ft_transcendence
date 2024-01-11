import { Audio, AudioListener, CapsuleGeometry, MeshStandardMaterial, Vector3, WebGLRenderer } from 'three';
import { World } from '../World.js';
import { Player } from '../components/Player.js';
import { Opponent } from '../components/Opponent.js';
import { GameState } from './GameStates.js';
import { insertCoinSound } from './Loader.js';

let world;

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
				this.participants[i].participantNickname = myNickname;
				this.self = this.participants[i];
			} else {
				this.participants.push( new Opponent( new Vector3( -7.2 + 14.4 * i, 0, 0 ), i ) );
				this.participants[i].participantNickname = opponentNickname;
			}
			this.participants[i].participantId = i;
			this.participants[i].position.setZ( -1 );
			document.getElementById(divNicknames[i]).classList.remove("d-none");
			document.getElementById(divNicknames[i]).innerHTML = this.participants[i].participantNickname;
		}
		world.terrain.leftGoalZone.paddle = this.participants[0];
		world.terrain.rightGoalZone.paddle = this.participants[1];
		
		this.initMatch();
		document.getElementById('lfp').classList.add("d-none");

	}

	initMatch() {
		// console.log("-- Starting Match --");
		world.currentGameState = GameState.InMatch;

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


		this.audioListener = new AudioListener();
		world.camera.add( this.audioListener );
		this.sound = new Audio( this.audioListener );

		this.sound.setBuffer( insertCoinSound );
		// this.sound.setLoop( true );
		this.sound.setVolume( 0.5 );
		this.sound.play();
	}

	onWebsocketReceived( event ) {
		if ( event.data === "Closing" ) {
			console.log("Opponent Ragequited");
			this.endMatch();
			return;
		}
		const wsData = JSON.parse( event.data );
		if ( this.participants[wsData.id] != undefined && wsData.pos != undefined )
			this.participants[wsData.id].position.copy( wsData.pos );
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
		world.currentGameState = GameState.InMenu;

		world.camera.viewLarge( 1 , function() {
			if ( document.getElementById('ui') )
				document.getElementById('ui').classList.remove("d-none");
		} );
		this.participants.forEach(element => {
			element.delete();
		});
		this.participants = [];
		divNicknames.forEach(element => {
			if (document.getElementById(element))
				document.getElementById(element).classList.add("d-none");
		});

		world.balls.updatable.setEnabled(false);
		world.balls.renderer.setEnabled(false);
	
		if ( this.socket != undefined)
			this.socket.close();

		this.socket.removeEventListener( "message", this.onWebsocketReceivedEvent );

		world.changeStatus( "ONL" );
	}
}

export { Match };
