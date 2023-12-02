import { Updatable } from '../modules/Updatable.js';
import { Renderer } from '../modules/Renderer.js';
import { Collider } from '../modules/Collider.js';
import { Layers } from '../systems/Layers.js';
import {
	Color,
	Mesh,
	Raycaster,
	Vector2,
	Vector3
} from 'three';
import { InputMap } from '../systems/InputManager.js';
import { Paddle } from './Paddle.js';
// import { ControlLocal } from '../modules/ControlLocal.js';

class Opponent extends Paddle {
	constructor( geometry, material, position, socket ) {
		super( geometry, material, position );

		this.material.color = new Color( 0xff0000 );

		// if ( inputMap == undefined ) {
		// 	this.playerSocket = new WebSocket('wss://' + window.location.host + '/ws/pong/UserA');
		// }
		// const socket = new WebSocket('wss://' + window.location.host + socketName);

		// socket.addEventListener("open", (event) => {
		// 	this.material.color = new Color( 0x55ff55 );
		// 	socket.send("Hello Server!");
		// });	  
		socket.addEventListener("message", (event) => {
			console.log("message received");
			this.position.setY(parseFloat( event.data ));
		});
	}

	update( dt ) {
		// if ( this.playerSocket != undefined && this.playerSocket.readyState === WebSocket.OPEN) {
		// 	this.playerSocket.send( this.position.y );
		// }
	}
}

export { Opponent };
