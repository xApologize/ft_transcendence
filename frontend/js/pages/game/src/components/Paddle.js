import { Renderer } from '../modules/Renderer.js';
import { Layers } from '../systems/Layers.js';
import {
	CapsuleGeometry,
	Mesh,
	MeshStandardMaterial,
	Vector2,
	Vector3
} from 'three';

class Paddle extends Mesh {
	constructor( position, id, nickname ) {
		super( new CapsuleGeometry( 0.2, 2.0 ), new MeshStandardMaterial() );
		this.castShadow = true;
		this.receiveShadow = true;

		this.renderer = new Renderer( this );

		this.position.copy( position );
		this.length = this.geometry.parameters.length + this.geometry.parameters.radius * 2;
		this.sideId = id;
		this.nickname = nickname;
		this.score = 0;

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
