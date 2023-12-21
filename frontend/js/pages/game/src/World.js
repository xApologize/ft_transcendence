import { createRenderer } from './systems/renderer.js';
import { createComposer } from './systems/PostProcess.js';
import { MainCamera } from './components/camera.js';
import { createLights } from './components/lights.js';
import { createScene } from './components/scene.js';

import { Resizer } from './systems/Resizer.js';
import { Loop } from './systems/Loop.js';
import { InputManager } from './systems/InputManager.js';
import { Match } from './systems/Match.js';
import { GameState } from './systems/GameStates.js';

import { Terrain } from './components/Terrain.js';
import { Ball } from './components/Ball.js';
import { Score } from './components/Score.js';

import {
	MeshStandardMaterial,
	SphereGeometry,
	Vector2
} from 'three';
import interactiveSocket from '../../home/socket.js';

const _ballCount = 1;
const _ballSize = 0.2;

// Wall Collider position
const _terrainSize = new Vector2(18, 11);
// Dynamic Terrain Line and Margin (depreciated)
const _terrainLine = 0.5;
const _terrainMargin = 0.4;

class World {
	constructor( container ) {
		if (World._instance) {
			World._instance.appendCanvas( container );
			return World._instance;
		}
		this.createInstance();
		this.appendCanvas( container );

		// TBD via backend ?
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

	joinMatch( wsPath, side, myNickname, opponentNickname ) {
		this.match = new Match( '/' + wsPath, side == "A" ? 0 : 1, myNickname, opponentNickname );
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

		const { ambientLight, mainLight } = createLights();

		this.scene.add( ambientLight, mainLight );

		this.currentGameState = GameState.InMenu;
	
		this.terrain = new Terrain( _terrainSize, _terrainLine, _terrainMargin );
	
		this.g_sphere = new SphereGeometry( _ballSize );
		this.m_white = new MeshStandardMaterial({ color: 'white' });
	
		this.balls = new Ball( this.g_sphere, this.m_white, _ballCount );
		
		this.camera.viewLarge( 0 );
		this.loop.start();
	}
	
	appendCanvas( container ) {
		container.append( this.renderer.domElement );
		this.resizer = new Resizer( container, this.camera, this.renderer, this.composer );
	}

	get socket() {
		return this.match.socket;
	}
}

export { World };
