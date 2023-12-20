import { Renderer } from '../modules/Renderer.js';
import { Layers } from '../systems/Layers.js';
import {
	Mesh,
	Vector2,
	Vector3
} from 'three';

class Paddle extends Mesh {
	constructor( geometry, material, position, id, nickname ) {
		super( geometry, material );

		this.renderer = new Renderer( this );

		this.position.copy( position );
		this.length = geometry.parameters.length + geometry.parameters.radius * 2;
		this.participantId = id;
		this.participantNickname = nickname;

		const from = new Vector2( this.position.x, this.position.y );
		this.rotation.set( 0, 0, from.angle() );
		this.dir = new Vector3( 1, 0, 0 );
		this.dir.applyQuaternion( this.quaternion );

		this.renderer.setLayers( Layers.Default, Layers.Player );
	}


	delete() {
		this.renderer.delete();
	}
}

export { Paddle };
