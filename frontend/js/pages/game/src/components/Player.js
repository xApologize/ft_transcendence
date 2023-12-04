import { Collider } from '../modules/Collider.js';
import { Updatable } from '../modules/Updatable.js';
import { Layers } from '../systems/Layers.js';
import { InputMap } from '../systems/InputManager.js';
import { Paddle } from './Paddle.js';
import {
	Color,
	Raycaster,
	Vector3
} from 'three';

class Player extends Paddle {
	constructor( geometry, material, position, socket ) {
		super( geometry, material, position );

		this.speed = 5;

		this.ray = new Raycaster();
		this.ray.layers.set( Layers.Solid );

		this.msg = {
			pos: this.position,
			ballInst: undefined
		};

		this.socket = socket;
		this.socket.addEventListener("open", (event) => {
			this.material.color = new Color( 0x00aaff );
			this.socket.send("Joined");
		});

		this.collider = new Collider( this );
		this.updatable = new Updatable( this );

		//TEMP WARNING NOT DESTROYED
		document.addEventListener("boostButtonPressed", (e) => {
			this.speed = 10;
		});
		document.addEventListener("boostButtonReleased", (e) => {
			this.speed = 5;
		});
	}

	update( dt ) {
		if ( InputMap.movementAxis.value === 0 )
			return;
		// if ( InputMap.boostButton.value === true )
		// 	this.speed = 10;
		// else
		// 	this.speed = 5;

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
			this.socket.send( JSON.stringify( this.msg ) );
		}
	}

	onCollision( hit ) {
		if ( this.socket != undefined && this.socket.readyState === WebSocket.OPEN) {
			this.msg.ballInst = hit;
			this.socket.send( JSON.stringify( this.msg ) );
		}
		this.msg.ballInst = undefined;
	}

	delete() {
		super.delete();
		this.updatable.delete();
		this.collider.delete();
	}
}

export { Player };
