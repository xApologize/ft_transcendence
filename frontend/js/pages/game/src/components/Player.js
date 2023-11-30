import { Updatable } from '../modules/Updatable.js';
import { Renderer } from '../modules/Renderer.js';
import { Collider } from '../modules/Collider.js';
import { Layers } from '../systems/Layers.js';
import {
	Mesh,
	Raycaster,
	Vector2,
	Vector3
} from 'three';
import { InputMap, Player1InputMap } from '../systems/InputMaps.js';

class Player extends Mesh {
	constructor( geometry, material, position, inputMap ) {
		super( geometry, material );

		this.updatable = new Updatable( this );
		this.renderer = new Renderer( this );
		this.collider = new Collider( this );

		this.position.copy( position );

		const from = new Vector2( this.position.x, this.position.y );
		this.rotation.set( 0, 0, from.angle() );
		this.dir = new Vector3( 1, 0, 0 );
		this.dir.applyQuaternion( this.quaternion );

		this.speed = 5;

		this.setupInputs( inputMap );

		this.ray = new Raycaster();
		this.ray.layers.set( Layers.Solid );

		this.renderer.setLayers( Layers.Default, Layers.Player );

		if ( inputMap == Player1InputMap ) {
			this.playerSocket = new WebSocket('wss://' + window.location.host + '/ws/pong/UserA');
		}
		else {
			const socket = new WebSocket('wss://' + window.location.host + '/ws/pong/UserB');

			socket.addEventListener("open", (event) => {
				socket.send("Hello Server!");
			});			  
			socket.addEventListener("message", (event) => {
				console.log("Message from server ", event.data);
				console.log("Message from server ", event.data);
				this.position.setY(parseFloat( event.data ));
			});
		}
	}

	update( dt ) {
		let movement = undefined;

		if ( this.inputStrength.x > this.inputStrength.y )
			movement = new Vector3( 0, 1, 0 );
		else if ( this.inputStrength.x < this.inputStrength.y )
			movement = new Vector3( 0, -1, 0 );
		if ( movement === undefined )
			return;
		
		this.ray.set( this.position, movement );
		this.ray.far = 1.4 + this.speed * dt;
		const hits = this.ray.intersectObjects( Collider.getSolids() );
		if ( hits.length > 0 ) {
			this.position.add(movement.multiplyScalar( hits[0].distance - 1.4 ));
		} else {
			this.position.add(movement.multiplyScalar( this.speed * dt ));
		}

		if ( this.playerSocket != undefined && this.playerSocket.readyState === WebSocket.OPEN) {
			this.playerSocket.send( this.position.y );
		}
	}

	onCollision( hit ) {
		// console.log("hit");
		// hit.vars.dir.reflect( closerHit.normal );

	}

	onKeyDown( event, inputMap ) {
		if ( event.code == inputMap.pos )
			this.inputStrength.x = this.inputStrength.y + 1;
		if ( event.code == inputMap.neg )
			this.inputStrength.y = this.inputStrength.x + 1;
		if ( event.code == inputMap.boost )
			this.speed = 10;
	}

	onKeyUp( event, inputMap ) {
		if ( event.code == inputMap.pos )
			this.inputStrength.x = 0;
		if ( event.code == inputMap.neg )
			this.inputStrength.y = 0;
		if ( event.code == inputMap.boost )
			this.speed = 5;
	}

	setupInputs( inputMap ) {
		this.inputStrength = new Vector2( 0, 0 );

		this.onKeyDownEvent = (event) => this.onKeyDown( event, inputMap );
		this.onKeyUpEvent = (event) => this.onKeyUp( event, inputMap );

		document.addEventListener('keydown', this.onKeyDownEvent, false);
		document.addEventListener('keyup', this.onKeyUpEvent, false);
	}

	delete() {
		document.removeEventListener('keydown', this.onKeyDownEvent, false);
		document.removeEventListener('keyup', this.onKeyUpEvent, false);
		this.updatable.delete();
		this.renderer.delete();
		this.collider.delete();
	}
}

export { Player };
