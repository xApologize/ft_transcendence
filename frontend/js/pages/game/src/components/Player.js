import { Collider } from '../modules/Collider.js';
import { Updatable } from '../modules/Updatable.js';
import { Layers } from '../systems/Layers.js';
import { InputMap } from '../systems/InputManager.js';
import { Paddle } from './Paddle.js';
import {
	Raycaster,
	Vector3
} from 'three';
import { World } from '../World.js';

const initialSpeed = 5;
const initialBoostSpeed = 10;

class Player extends Paddle {
	constructor( geometry, material, position, id, nickname ) {
		super( geometry, material, position, id, nickname );

		this.isPlayer = true;

		this.speed = initialSpeed;
		this.movement = new Vector3( 0, 0, 0 );

		this.ray = new Raycaster();
		this.ray.layers.set( Layers.Solid );

		this.wsData = {
			id: this.participantId,
			pos: this.position,
			ballInst: undefined
		};

		this.collider = new Collider( this );
		this.updatable = new Updatable( this );

		this.boostButtonPressedEvent = (e) => {
			this.speed = initialBoostSpeed;
		};
		this.boostButtonReleasedEvent = (e) => {
			this.speed = initialSpeed;
		};
		document.addEventListener( "boostButtonPressed", this.boostButtonPressedEvent );
		document.addEventListener( "boostButtonReleased", this.boostButtonReleasedEvent );
	}

	fixedUpdate ( dt ) {
		if ( this.movement.y === 0 )
			return;
		
		if ( World._instance.socket != undefined && World._instance.socket.readyState === WebSocket.OPEN) {
			World._instance.socket.send( JSON.stringify( this.wsData ) );
		}
	}

	update( dt ) {
		this.movement = new Vector3( 0, InputMap.movementAxis.value, 0 );

		if ( this.movement.y === 0 )
			return;
		
		this.ray.set( this.position, this.movement );
		this.ray.far = this.length / 2 + this.speed * dt;
		const hits = this.ray.intersectObjects( Collider.getSolids() );
		if ( hits.length > 0 ) {
			this.position.add( this.movement.clone().multiplyScalar( hits[0].distance - this.length / 2 ) );
		} else {
			this.position.add( this.movement.clone().multiplyScalar( this.speed * dt ) );
		}
	}

	onCollision( hit ) {
		if ( World._instance.socket != undefined && World._instance.socket.readyState === WebSocket.OPEN) {
			this.wsData.ballInst = hit;
			World._instance.socket.send( JSON.stringify( this.wsData ) );
		}
		this.wsData.ballInst = undefined;
	}

	delete() {
		super.delete();
		this.updatable.delete();
		this.collider.delete();
		document.removeEventListener( "boostButtonPressed", this.boostButtonPressedEvent );
		document.removeEventListener( "boostButtonReleased", this.boostButtonReleasedEvent );
	}
}

export { Player };
