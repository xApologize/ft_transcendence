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
	Color,
	DodecahedronGeometry,
	InstancedMesh,
	MathUtils,
	Matrix4,
	MeshStandardMaterial,
	SphereGeometry,
	Vector2,
	Vector3
} from 'three';

let scene;
let camera;
let renderer;
let loop;
let score;
let resizer;
let input;

const GameState = {
	InMenu: "inMenu",
	InMatch: "inGame",
	MatchEnding: "matchEnding",
	Matchmaking: "matchmaking",
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

		this.render = function() { renderer.render(scene, camera); }
		this.start = function() { loop.start();	}
		this.stop = function() { loop.stop(); }

		this.currentGameState = GameState.InMenu;

		/// DEBUG TEMP
		document.addEventListener('keydown', (event) => {
			if ( event.code == "KeyR" ) {
				console.warn("-- DELETION! --");
				World._instance.deleteGame();
			}
			if ( event.code == "KeyE" ) {
				console.warn("-- RESUME! --");
				World._instance.createGame();
			}
			if ( event.code == "KeyI" ) {
				console.warn("-- RESUME! --");
				World._instance.initMatch();
			}
			if ( event.code == "KeyA" && this.player == undefined )
				this.createSocket( '/ws/pong/UserA', -7.2, this.terrain.leftGoalZone, this.terrain.rightGoalZone );
			if ( event.code == "KeyB" && this.player == undefined )
				this.createSocket( '/ws/pong/UserB', 7.2, this.terrain.rightGoalZone, this.terrain.leftGoalZone );
		}, false);
	}

	createSocket( path, xpos, goalZone, opponentGoalZone ) {
		this.currentGameState = GameState.Matchmaking;
		console.log("-- Socket Created! --");
		console.log("-- Waiting for Opponent --");

		this.socket = new WebSocket('wss://' + window.location.host + path);

		this.player = new Player( this.g_caps, new MeshStandardMaterial(), new Vector3(  xpos, 0, 0 ), this.socket );
		this.player.position.setZ(-1);
		goalZone.paddle = this.player;

		this.socket.addEventListener("message", (event) => {
			if ( this.opponent != undefined )
				return;
			this.opponent = new Opponent( this.g_caps, new MeshStandardMaterial(), new Vector3( -xpos, 0, 0 ), this.socket );
			this.opponent.position.setZ(-1);
			opponentGoalZone.paddle = this.opponent;
			if ( event.data == "Joined" )
				this.socket.send("Joined Back");
			console.log("-- Opponent found --");
			this.initMatch();
		});
	}

	createInstance() {
		World._instance = this;

		camera = new MainCamera();
		scene = createScene();
		renderer = createRenderer();
		loop = new Loop(camera, scene, renderer);
		score = new Score3D();
		input = new InputManager();


		const { ambientLight, mainLight } = createLights();

		scene.add( ambientLight, mainLight );
	}
	
	createContainer( container ) {
		container.append( renderer.domElement );
		resizer = new Resizer(container, camera, renderer);
	}
	
	createGame() {
		scene.add( airHockeyTable.scene );
		airHockeyTable.scene.scale.set( 0.07, 0.07, 0.07 );
		airHockeyTable.scene.rotation.set( Math.PI / 2, 0, 0 );
		airHockeyTable.scene.position.set( 3, 26, -5.5 );

		this.terrain = new Terrain( new Vector2(18, 11), 0.5, 0.4 );

		this.g_caps = new CapsuleGeometry( 0.2, 2.4 );
		this.g_sphere = new SphereGeometry( 0.2 );
		this.m_white = new MeshStandardMaterial({ color: 'white' });

		this.balls = new Ball( this.g_sphere, this.m_white, 2 );
		
		camera.viewLarge( 0 );
		loop.start();
	}

	initMatch() {
		this.balls.resetAll();
		score.reset();
		this.player.position.setZ(0)
		this.opponent.position.setZ(0)
		this.balls.renderer.setEnabled(true);
		camera.viewTable( 1, function() {
			this.balls.init();
			this.balls.updatable.setEnabled(true);
		}.bind( this ) );

		this.socket.addEventListener("message", (event) => {
			const msg = JSON.parse( event.data );
			if ( this.opponent != undefined )
				this.opponent.position.copy( msg.pos );
			if ( msg.ballInst != undefined ) {
				if ( msg.scored == true ) {
					World.scoreAdd( msg.goalScoredId );
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
		camera.viewLarge( 1 );
		this.player.delete();
		this.player = undefined;
		this.opponent.delete();
		this.opponent = undefined;
		this.balls.updatable.setEnabled(false);
		this.balls.renderer.setEnabled(false);

		if ( this.socket != undefined)
			this.socket.close();
	}

	deleteGame() {
		scene.remove( airHockeyTable.scene );
		this.balls.delete();
		if ( this.player != undefined ) {
			this.player.delete();
			this.player = undefined;
		}
		if ( this.opponent != undefined ) {
			this.opponent.delete();
			this.opponent = undefined;
		}
		score.reset();
		this.terrain.delete();
		renderer.renderLists.dispose();
		resizer.delete();
		camera.viewLarge( 0 );
		loop.stop();

		if ( this.socket != undefined)
			this.socket.close();
	}

	static add( mesh ) {
		scene.add( mesh )
	}

	static remove( mesh ) {
		scene.remove( mesh );
	}

	static scoreAdd( playerId ) {
		score.add( playerId );
	}
}

export { World };
