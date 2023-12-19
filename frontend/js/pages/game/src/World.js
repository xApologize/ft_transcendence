import { createRenderer } from './systems/renderer.js';
import { createComposer } from './systems/PostProcess.js';
import { MainCamera } from './components/camera.js';
import { createLights } from './components/lights.js';
import { createScene } from './components/scene.js';

import { Resizer } from './systems/Resizer.js';
import { Loop } from './systems/Loop.js';
import { InputManager } from './systems/InputManager.js';
import { Match } from './systems/Match.js';

import { Terrain } from './components/Terrain.js';
import { Ball } from './components/Ball.js';
import { Score } from './components/Score.js';

import {
	MeshStandardMaterial,
	SphereGeometry,
	Vector2
} from 'three';

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
			World._instance.appendCanvas( container );
			return World._instance;
		}
		this.createInstance();
		this.appendCanvas( container );
	}

	joinMatch( wsPath, side ) {
		this.match = new Match( '/' + wsPath, side == "A" ? 0 : 1 );
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
	
		this.terrain = new Terrain( new Vector2(18, 11), 0.5, 0.4 );
	
		this.g_sphere = new SphereGeometry( 0.2 );
		this.m_white = new MeshStandardMaterial({ color: 'white' });
	
		this.balls = new Ball( this.g_sphere, this.m_white, 2 );
		
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
