import { createRenderer } from './systems/renderer.js';
import { createCamera } from './components/camera.js';
import { createLights } from './components/lights.js';
import { createScene } from './components/scene.js';

import { Resizer } from './systems/Resizer.js';
import { Loop } from './systems/Loop.js';
import { Player1InputMap, Player2InputMap } from './systems/InputMaps.js';

import { Terrain } from './components/Terrain.js';
import { Ball } from './components/Ball.js';
import { Player } from './components/Player.js';
import { Score } from './components/Score.js';
import { CapsuleGeometry, MeshStandardMaterial, SphereGeometry, Vector2, Vector3 } from 'three';

let scene;
let camera;
let renderer;
let loop;
let scoreUI;

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

		document.addEventListener('keydown', (event) => {
			if ( event.code == "KeyR" ) {
				console.warn("-- DELETION! --");
				World._instance.deleteGame();
			}
		}, false);
	}

	createInstance() {
		World._instance = this;

		camera = createCamera();
		scene = createScene();
		renderer = createRenderer();
		loop = new Loop(camera, scene, renderer);
		scoreUI = new Score();
	}

	createContainer( container ) {
		container.append(renderer.domElement);
		container.parentElement.append( scoreUI.div );
		const resizer = new Resizer(container, camera, renderer);
	}

	createGame() {
		this.terrain = new Terrain( new Vector2(16, 10), 0.1, 0.4 );

		this.g_caps = new CapsuleGeometry( 0.2, 2.4 );
		this.g_sphere = new SphereGeometry( 0.2 );
		this.m_white = new MeshStandardMaterial({ color: 'white' });

		this.players = [];
		this.players.push( new Player( this.g_caps, this.m_white, new Vector3( -7.2, 0, 0 ), Player1InputMap ) );
		this.players.push( new Player( this.g_caps, this.m_white, new Vector3(  7.2, 0, 0 ), Player2InputMap ) );

		this.balls = [];
		for (let i = 0; i < 2; i++) {
			this.balls.push(new Ball( this.g_sphere, this.m_white ));
		}
		
		const { ambientLight, mainLight } = createLights();

		scene.add( ambientLight, mainLight );
	}

	deleteGame() {
		for (let i = 0; i < this.balls.length; i++)
			this.balls[i].delete();
		for (let i = 0; i < this.players.length; i++)
			this.players[i].delete();
		scoreUI.reset();
		this.terrain.delete();
		renderer.renderLists.dispose();
	}

	static add( mesh ) {
		scene.add( mesh )
	}

	static remove( mesh ) {
		scene.remove( mesh );
	}

	static addScore() {
		
	}
}

export { World };
