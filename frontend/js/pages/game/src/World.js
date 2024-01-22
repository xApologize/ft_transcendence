import { createRenderer } from './systems/renderer.js';
import { createComposer } from './systems/PostProcess.js';
import { MainCamera } from './components/camera.js';
import { Lights } from './components/lights.js';
import { createScene } from './components/scene.js';

import { Resizer } from './systems/Resizer.js';
import { Loop } from './systems/Loop.js';
import { InputManager } from './systems/InputManager.js';
import { Match } from './systems/Match.js';
import { GameState } from './systems/GameStates.js';

import { Terrain } from './components/Terrain.js';
import { Ball } from './components/Ball.js';
import { Score } from './components/Score.js';

import { Vector2 } from 'three';

import interactiveSocket from '../../home/socket.js';
import { fetchUser } from '../../../api/fetchData.js';

let _status = "ONL";

const _ballCount = 1;

// Wall Collider position
const _terrainSize = new Vector2(18, 11);
// Dynamic Terrain Line and Margin (depreciated)
const _terrainLine = 0.5;
const _terrainMargin = 0.2;


class World {
	constructor( container ) {
		if (World._instance) {
			World._instance.appendCanvas( container );
			return World._instance;
		}
		this.createInstance();
		this.appendCanvas( container );

		this.onDisconnectionEvent = (event) => this.forceQuit( event );
		window.addEventListener( "beforeunload", this.onDisconnectionEvent );
		window.addEventListener( "popstate", this.onDisconnectionEvent );
	}

	forceQuit() {
		this.resizer.delete();
		if ( this.currentGameState == GameState.InMatch ) {
			this.socket.send("Closing");
			this.match.endMatch();
		} 
		interactiveSocket.closeSocket();
		this.currentGameState == GameState.Disconnected;
	}

	joinMatch( wsPath, side, myNickname, opponentNickname, mode, tournamentStage = 0 ) {
		this.currentGameMode = mode;
		this.match = new Match( '/' + wsPath, side == "A" ? 0 : 1, myNickname, opponentNickname, tournamentStage );
		this.changeStatus( "ING" );
	}

	createInstance() {
		World._instance = this;

		this.camera = new MainCamera();
		this.scene = createScene();
		this.renderer = createRenderer();
		this.composer = createComposer( this.renderer, this.scene, this.camera );

		this.loop = new Loop( this.camera, this.scene, this.renderer, this.composer );
		this.score = new Score();
		this.input = new InputManager();
		
		document.getElementById("ambient").volume = 0.2;

		this.lights = new Lights();

		this.currentGameState = GameState.InMenu;
		this.currentGameMode = "Upgraded";
		
		this.balls = new Ball( _ballCount );
		
		this.terrain = new Terrain( _terrainSize, _terrainLine, _terrainMargin );
	
		this.camera.viewLarge( 0 );
		this.loop.start();
	}
	
	appendCanvas( container ) {
		container.append( this.renderer.domElement );
		this.resizer = new Resizer( container, this.camera, this.renderer, this.composer );
	}

	changeStatus( status ) {
		if ( _status == status )
			return;
		_status = status;
		interactiveSocket.sendMessageSocket(JSON.stringify({type: 'Refresh', rType: status}))
		const data = {
			status: status
		};
		fetchUser( 'PATCH', null, data );
	}

	get socket() {
		return this.match.socket;
	}
}

export { World };
