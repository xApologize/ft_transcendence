import { createRenderer } from './systems/renderer.js';
import { MainCamera } from './components/camera.js';
import { createLights } from './components/lights.js';
import { createScene } from './components/scene.js';

import { Resizer } from './systems/Resizer.js';
import { Loop } from './systems/Loop.js';
import { InputManager } from './systems/InputManager.js';

import { Terrain } from './components/Terrain.js';
import { Ball } from './components/Ball.js';
import { Player } from './components/Player.js';
import { Opponent } from './components/Opponent.js';
import { Score3D } from './components/3DScore.js';
import { airHockeyTable } from './systems/Loader.js';

import {
	CapsuleGeometry,
	MeshStandardMaterial,
	SphereGeometry,
	Vector2,
	Vector3
} from 'three';
import interactiveSocket from '../../home/socket.js';

const GameState = {
	InMenu: "inMenu",
	InMatch: "inGame",
	MatchEnding: "matchEnding",
	LookingForPlayer: "lookingForPlayer",
	Connecting: "connecting"
}

class World {
	constructor( container ) {
		if (World._instance) {
			World._instance.deleteGame();
			World._instance.createContainer( container );
			World._instance.createGame();
			return World._instance;
		}
		this.createInstance();

		this.createContainer( container );
		this.createGame();

		/// DEBUG TEMP
		document.addEventListener('keydown', (event) => {
			// if ( event.code == "KeyR" ) {
			// 	console.warn("-- DELETION! --");
			// 	World._instance.deleteGame();
			// }
			// if ( event.code == "KeyE" ) {
			// 	console.warn("-- RESUME! --");
			// 	World._instance.createGame();
			// }
			if ( event.code == "Space" && this.currentGameState == GameState.InMenu ) {
				if ( !interactiveSocket.interactive_socket )
					return console.error("interactiveSocket not up");
				console.log("-- Waiting for Opponent --");
				this.currentGameState = GameState.LookingForPlayer;
				interactiveSocket.sendMessageSocket(JSON.stringify({"type": "Find Match"}));
			}
		}, false);

		World._instance.wsPath = undefined;
		World._instance.side = undefined;
	}

	joinMatch( wsPath, side ) {
		// HOST
		if ( side == "A" ) {
			console.log("-- Becoming Host --");
			this.createSocket( '/' + wsPath, 7.2, this.terrain.rightGoalZone, this.terrain.leftGoalZone );
		}
		// CLIENT
		else if ( side == "B" ) {
			console.log("-- Becoming Client --");
			this.createSocket( '/' + wsPath, -7.2, this.terrain.leftGoalZone, this.terrain.rightGoalZone );
		}

	}

	createSocket( path, xpos, goalZone, opponentGoalZone ) {
		console.log("-- Socket Created! --");
		this.currentGameState = GameState.Connecting;

		this.socket = new WebSocket('wss://' + window.location.host + path);

		this.player = new Player( this.g_caps, new MeshStandardMaterial(), new Vector3(  xpos, 0, 0 ), this.socket );
		this.player.position.setZ(-1);
		goalZone.paddle = this.player;

		this.opponent = new Opponent( this.g_caps, new MeshStandardMaterial(), new Vector3( -xpos, 0, 0 ), this.socket );
		this.opponent.position.setZ(-1);
		opponentGoalZone.paddle = this.opponent;

		this.initMatch();
	}

	createInstance() {
		World._instance = this;

		this.camera = new MainCamera();
		this.scene = createScene();
		this.renderer = createRenderer();
		this.loop = new Loop( this.camera, this.scene, this.renderer );
		this.score = new Score3D();
		this.input = new InputManager();

		const { ambientLight, mainLight } = createLights();

		this.scene.add( ambientLight, mainLight );
	}
	
	createContainer( container ) {
		container.append( this.renderer.domElement );
		this.resizer = new Resizer( container, this.camera, this.renderer );
	}
	
	createGame() {
		this.currentGameState = GameState.InMenu;

		this.scene.add( airHockeyTable.scene );
		airHockeyTable.scene.scale.set( 0.07, 0.07, 0.07 );
		airHockeyTable.scene.rotation.set( Math.PI / 2, 0, 0 );
		airHockeyTable.scene.position.set( 3, 26, -5.5 );

		this.terrain = new Terrain( new Vector2(18, 11), 0.5, 0.4 );

		this.g_caps = new CapsuleGeometry( 0.2, 2.4 );
		this.g_sphere = new SphereGeometry( 0.2 );
		this.m_white = new MeshStandardMaterial({ color: 'white' });

		this.balls = new Ball( this.g_sphere, this.m_white, 2 );
		
		this.camera.viewLarge( 0 );
		this.loop.start();
	}

	initMatch() {
		this.balls.resetAll();
		this.score.reset();
		this.player.position.setZ(0)
		this.opponent.position.setZ(0)
		this.balls.renderer.setEnabled(true);
		this.camera.viewTable( 1, function() {
			this.balls.init();
			this.balls.updatable.setEnabled(true);
		}.bind( this ) );

		this.socket.addEventListener("message", (event) => {
			const msg = JSON.parse( event.data );
			if ( this.opponent != undefined )
				this.opponent.position.copy( msg.pos );
			if ( msg.ballInst != undefined ) {
				if ( msg.scored == true ) {
					this.score.add( msg.goalScoredId );
					this.balls.initInst( this.balls.ballInst[ msg.ballInst.id ] );
				}
				else
					this.balls.overwriteInst( msg.ballInst );
			}
		})

		console.log("-- Starting Match --");
		this.currentGameState = GameState.InMatch;
	}

	endMatch() {
		this.camera.viewLarge( 1 );
		this.player.delete();
		this.player = undefined;
		this.opponent.delete();
		this.opponent = undefined;
		this.balls.updatable.setEnabled(false);
		this.balls.renderer.setEnabled(false);

		if ( this.socket != undefined)
			this.socket.close();
		this.currentGameState = GameState.InMenu;
	}

	deleteGame() {
		this.scene.remove( airHockeyTable.scene );
		this.balls.delete();
		if ( this.player != undefined ) {
			this.player.delete();
			this.player = undefined;
		}
		if ( this.opponent != undefined ) {
			this.opponent.delete();
			this.opponent = undefined;
		}
		this.score.reset();
		this.terrain.delete();
		this.renderer.renderLists.dispose();
		this.resizer.delete();
		this.camera.viewLarge( 0 );
		this.loop.stop();

		if ( this.socket != undefined)
			this.socket.close();
	}
}

export { World };
