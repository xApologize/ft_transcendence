import { Updatable } from '../modules/Updatable.js';
import { Renderer } from '../modules/Renderer.js';
import { Collider } from '../modules/Collider.js';
import { Layers } from '../systems/Layers.js';
import {
	Mesh,
	Vector2,
	Vector3
} from 'three';

class Paddle extends Mesh {
	constructor( geometry, material, position ) {
		super( geometry, material );

		this.updatable = new Updatable( this );
		this.renderer = new Renderer( this );
		this.collider = new Collider( this );

		this.position.copy( position );

		const from = new Vector2( this.position.x, this.position.y );
		this.rotation.set( 0, 0, from.angle() );
		this.dir = new Vector3( 1, 0, 0 );
		this.dir.applyQuaternion( this.quaternion );

		this.renderer.setLayers( Layers.Default, Layers.Player );
	}


	delete() {
		this.updatable.delete();
		this.renderer.delete();
		this.collider.delete();
	}
}

export { Paddle };
