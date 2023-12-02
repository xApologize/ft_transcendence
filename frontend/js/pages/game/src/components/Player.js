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

class Player extends Paddle {
	constructor( geometry, material, position, socket ) {
		super( geometry, material, position );

		this.speed = 5;

		this.ray = new Raycaster();
		this.ray.layers.set( Layers.Solid );

		// this.playerSocket = new WebSocket('wss://' + window.location.host + socketName);
		this.socket = socket;
		this.socket.addEventListener("open", (event) => {
			this.material.color = new Color( 0x00aaff );
			this.socket.send("Joined");
		});

		// if ( inputMap == undefined ) {
		// 	this.playerSocket = new WebSocket('wss://' + window.location.host + '/ws/pong/UserA');
		// }
		// else {
		// 	const socket = new WebSocket('wss://' + window.location.host + '/ws/pong/UserB');

		// 	socket.addEventListener("open", (event) => {
		// 		socket.send("Hello Server!");
		// 	});			  
		// 	socket.addEventListener("message", (event) => {
		// 		// console.log("Message from server ", event.data);
		// 		this.position.setY(parseFloat( event.data ));
		// 	});
		// }
	}

	update( dt ) {
		if ( InputMap.movementAxis.value === 0 )
			return;

		let movement = new Vector3( 0, InputMap.movementAxis.value, 0 );
		
		this.ray.set( this.position, movement );
		this.ray.far = 1.4 + this.speed * dt;
		const hits = this.ray.intersectObjects( Collider.getSolids() );
		if ( hits.length > 0 ) {
			this.position.add(movement.multiplyScalar( hits[0].distance - 1.4 ));
		} else {
			this.position.add(movement.multiplyScalar( this.speed * dt ));
		}

		if ( this.socket != undefined && this.socket.readyState === WebSocket.OPEN) {
			this.socket.send( this.position.y );
		}
	}
}

export { Player };
