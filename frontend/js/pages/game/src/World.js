import { createRenderer } from './systems/renderer.js';
import { createCamera } from './components/camera.js';
import { createLights } from './components/lights.js';
import { createScene } from './components/scene.js';

import { Resizer } from './systems/Resizer.js';
import { Loop } from './systems/Loop.js';
import { Player1InputMap, Player2InputMap } from './systems/InputMaps.js';

import { createArena } from './components/Terrain.js';
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
		camera = createCamera();
		scene = createScene();
		renderer = createRenderer();
		loop = new Loop(camera, scene, renderer);
		container.append(renderer.domElement);
		scoreUI = new Score();

		createArena( new Vector2(16, 10), 0.1, 0.4 );

		const g_caps = new CapsuleGeometry( 0.2, 2.4 );
		const g_sphere = new SphereGeometry( 0.2 );
		const m_white = new MeshStandardMaterial({ color: 'white' });

		const p1 = new Player( g_caps, m_white, new Vector3( -7.2, 0, 0 ), Player1InputMap );
		const p2 = new Player( g_caps, m_white, new Vector3( 7.2, 0, 0 ), Player2InputMap );

		const ball = new Ball( g_sphere, m_white );
		const balls = [];
		for (let i = 0; i < 1; i++) {
			balls.push(new Ball( g_sphere, m_white ));
		}
		const { ambientLight, mainLight } = createLights();

		scene.add( ambientLight, mainLight );

		const resizer = new Resizer(container, camera, renderer);

		this.render = function() { renderer.render(scene, camera); }
		this.start = function() { loop.start();	}
		this.stop = function() { loop.stop(); }
	}

	static add( mesh ) {
		scene.add( mesh )
	}

	static remove( mesh ) {
		mesh.geometry.dispose();		// unsure
		mesh.material.dispose();		// unsure
		scene.remove( mesh );
		renderer.renderLists.dispose();	// unsure
	}

	static addScore() {
		
	}
}

export { World };
