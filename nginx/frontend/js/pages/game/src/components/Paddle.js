import { Renderer } from '../modules/Renderer.js';
import { Layers } from '../systems/Layers.js';
import {
	CapsuleGeometry,
	Color,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	Vector2,
	Vector3
} from 'three';
import { Tween } from '../systems/Tween.js';
import { World } from '../World.js';

const smashAnimDuration = 0.18;

class Paddle extends Mesh {
	constructor( position, id, nickname ) {
		super( new CapsuleGeometry( 0.2, 2.0 ), new MeshStandardMaterial() );
		// super( new CapsuleGeometry( 0.2, 2.0 ), new MeshBasicMaterial() );
		this.castShadow = true;
		this.receiveShadow = true;

		this.renderer = new Renderer( this );

		this.position.copy( position );
		this.length = this.geometry.parameters.length + this.geometry.parameters.radius * 2;
		this.sideId = id;
		this.nickname = nickname;
		this.score = 0;
		this.dashSpheres = this.position.x < 0 ? World._instance.terrain.leftDashSpheres : World._instance.terrain.rightDashSpheres;

		const from = new Vector2( this.position.x, this.position.y );
		this.rotation.set( 0, 0, from.angle() );
		this.dir = new Vector3( 1, 0, 0 );
		this.dir.applyQuaternion( this.quaternion );

		this.renderer.setLayers( Layers.Default, Layers.Player, Layers.Buffer );
	}

	smashAnimation( dir ) {
		const oldRotation = this.rotation.clone();
		const rot = Math.PI * -dir * Math.sign( this.position.x );
		new Tween( this.rotation, new Vector3( this.rotation.x, this.rotation.y, this.rotation.z + rot ), smashAnimDuration ).then(
			() => { this.rotation.copy( oldRotation ); }
		);
	}

	dashSpheresAnimation( count ) {
		for (let i = 0; i < 3; i++) {
			if ( count >= i + 1 ) {
				this.dashSpheres[i].material.emissive = new Color( 0xffffff );
				this.dashSpheres[i].material.emissiveIntensity = 10;
			}
			else {
				this.dashSpheres[i].material.emissive = new Color( 0xff00ff + ( 0x00ff00 * ( count - i ) ) - (( 0x00ff00 * ( count - i ) ) % 0x000100) );
				this.dashSpheres[i].material.emissiveIntensity = ( count - i );
			}
		}		
	}

	delete() {
		this.renderer.delete();
	}
}

export { Paddle };
