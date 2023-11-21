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

class Player extends Mesh {
	constructor( geometry, material, position, inputMap ) {
		super( geometry, material );

		this.updatable = new Updatable( this );
		this.renderer = new Renderer( this );
		this.collider = new Collider( this );

		this.position.copy( position );
		this.speed = 5;

		this.setupInputs( inputMap );

		this.ray = new Raycaster();
		this.ray.layers.set( Layers.Solid );

		this.renderer.setLayers( Layers.Default, Layers.Player );
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
