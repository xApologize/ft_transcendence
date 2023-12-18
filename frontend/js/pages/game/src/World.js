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
import { Score } from './components/Score.js';
import { airHockeyTable } from './systems/Loader.js';

import {
	CapsuleGeometry,
	MeshStandardMaterial,
	SphereGeometry,
	Vector2,
	Vector3
} from 'three';

import { EffectComposer } from '/node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '/node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { BloomPass } from '/node_modules/three/examples/jsm/postprocessing/BloomPass.js';
import { UnrealBloomPass } from '/node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from '/node_modules/three/examples/jsm/postprocessing/FilmPass.js';
import { OutputPass } from '/node_modules/three/examples/jsm/postprocessing/OutputPass.js';
import { GlitchPass } from '/node_modules/three/examples/jsm/postprocessing/GlitchPass.js';
import { RenderPixelatedPass } from '/node_modules/three/examples/jsm/postprocessing/RenderPixelatedPass.js';

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
	}

	joinMatch( wsPath, side ) {
		// HOST
		if ( side == "A" ) {
			// console.log("-- Becoming Host --");
			this.createSocket( '/' + wsPath, 7.2, this.terrain.rightGoalZone, this.terrain.leftGoalZone );
		}
		// CLIENT
		else if ( side == "B" ) {
			// console.log("-- Becoming Client --");
			this.createSocket( '/' + wsPath, -7.2, this.terrain.leftGoalZone, this.terrain.rightGoalZone );
		}

	}

	createSocket( path, xpos, goalZone, opponentGoalZone ) {
		// console.log("-- Socket Created! --");
		this.currentGameState = GameState.Connecting;

		this.socket = new WebSocket('wss://' + window.location.host + path);

		this.player = new Player( this.g_caps, new MeshStandardMaterial(), new Vector3(  xpos, 0, 0 ), this.socket );
		this.player.position.setZ(-1);
		goalZone.paddle = this.player;

		this.opponent = new Opponent( this.g_caps, new MeshStandardMaterial(), new Vector3( -xpos, 0, 0 ), this.socket );
		this.opponent.position.setZ(-1);
		opponentGoalZone.paddle = this.opponent;

		this.initMatch();
		document.getElementById('lfp').classList.add("d-none");
	}

	createInstance() {
		World._instance = this;

		this.camera = new MainCamera();
		this.scene = createScene();
		this.renderer = createRenderer();

		this.composer = new EffectComposer( this.renderer);
		this.composer.addPass( new RenderPass( this.scene, this.camera ) );
		// this.composer.addPass( new RenderPixelatedPass( 2, this.scene, this.camera ) );
		// this.composer.addPass( new BloomPass( 1, 25, 4, 256 ) );
		this.composer.addPass( new UnrealBloomPass( 256, 0.5, 0.5, 0.5 ) );
		this.composer.addPass( new FilmPass( 0.15, false ) );
		// this.composer.addPass( new GlitchPass( 0 ) );
		this.composer.addPass( new OutputPass() );

		// this.loop = new Loop( this.camera, this.scene, this.renderer );
		this.loop = new Loop( this.camera, this.scene, this.renderer, this.composer );
		this.score = new Score();
		this.input = new InputManager();

		const { ambientLight, mainLight } = createLights();

		this.scene.add( ambientLight, mainLight );
	}
	
	createContainer( container ) {
		container.append( this.renderer.domElement );
		this.resizer = new Resizer( container, this.camera, this.renderer, this.composer );
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
		this.balls.updatable.setEnabled(true);
		this.camera.viewTable( 1, function() {
			if ( this.currentGameState === GameState.InMatch )
				this.balls.init();
		}.bind( this ) );

		this.socket.addEventListener("message", (event) => {
			if ( event.data === "Closing" ) {
				console.log("Opponent Ragequited");
				this.endMatch();
				return;
			}
			const msg = JSON.parse( event.data );
			if ( this.opponent != undefined && msg.pos != undefined )
				this.opponent.position.copy( msg.pos );
			if ( msg.ballInst != undefined ) {
				if ( msg.scored == true ) {
					if ( this.terrain.leftGoalZone.paddle.isOpponent )
						this.terrain.leftGoalZone.goal( msg.ballInst );
					if ( this.terrain.rightGoalZone.paddle.isOpponent )
						this.terrain.rightGoalZone.goal( msg.ballInst );
				}
				else
					this.balls.overwriteInst( msg.ballInst );
			}
		})

		// TBD via backend
		window.addEventListener("beforeunload", (event) => {
			this.socket.send("Closing");
			this.endMatch();
		})
		window.addEventListener("popstate", (event) => {
			this.socket.send("Closing");
			this.endMatch();
		})

		// console.log("-- Starting Match --");
		this.currentGameState = GameState.InMatch;
	}

	endMatch() {
		this.camera.viewLarge( 1 , function() {
			document.getElementById('ui').classList.remove("d-none");
		} );
		if ( this.player != undefined )
			this.player.delete();
		this.player = undefined;
		if ( this.opponent != undefined )
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
