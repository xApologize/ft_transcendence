import { Collider } from '../modules/Collider.js';
import { Renderer } from '../modules/Renderer.js';
import { Updatable } from '../modules/Updatable.js';
import { Layers } from '../systems/Layers.js';
import {
	InstancedMesh,
	MathUtils,
	Mesh,
	Raycaster,
	Vector3
} from 'three';

class Ball extends InstancedMesh {
	constructor( geometry, material ) {
		super( geometry, material, 1 );

		this.renderer = new Renderer( this );
		this.updatable = new Updatable( this );

		this.dir = new Vector3(MathUtils.randFloat( -1, 1 ), MathUtils.randFloat( -0.5, 0.5 ), 0);
		this.dir.normalize();
		this.speed = 5;
		this.radius = this.geometry.parameters.radius;
		
		this.position.set(MathUtils.randFloat( -4, 4 ), MathUtils.randFloat( -2, 2 ), 0);
		
		this.renderer.setLayers( Layers.Default, Layers.Ball );
		
		this.ray = new Raycaster();
		this.ray.layers.enable( Layers.Goal );
	}

	// Recursion error quand vitesse extreme
	calcCollision( pos, dist ) {
		// if (dist < 0)
		// 	dist = 0;

		// Generate Rays
		let closerHit = undefined;
		let offset = undefined;
		for (let i = 0; i < 8; i++) {
			const origin = new Vector3(Math.cos( i * (Math.PI / 4) ) * this.radius, Math.sin( i * (Math.PI / 4) ) * this.radius, 0);
			origin.add( pos );
			this.ray.set( origin, this.dir );
			this.ray.far = dist;
			const hits = this.ray.intersectObjects( Collider.getSolids() );
			if ( hits.length > 0 ) {
				if (closerHit == undefined || hits[0].distance < closerHit.distance ) {
					closerHit = hits[0];
					offset = new Vector3(Math.cos( i * (Math.PI / 4) ) * this.radius, Math.sin( i * (Math.PI / 4) ) * this.radius, 0);
				}
			}
		}

		// Process collision on closerHit
		if ( closerHit != undefined ) {
			if (closerHit.object.layers.isEnabled( Layers.Player )) {
				this.dir.set( -Math.sign(this.dir.x), closerHit.point.y - closerHit.object.position.y, 0 );
				this.dir.normalize();
				this.speed += 1;
				console.log("PlayerHit!");
			} else if (closerHit.object.layers.isEnabled( Layers.Goal )) {
				this.dir = new Vector3(MathUtils.randFloat( -1, 1 ), MathUtils.randFloat( -0.5, 0.5 ), 0);
				this.dir.normalize();
				this.speed = 5;
				closerHit.object.onCollision( this );
				return new Vector3( MathUtils.randFloat( -2, 2 ), MathUtils.randFloat( -1, 1 ), -2 );
			} else {
				this.dir.subVectors(this.dir, closerHit.normal.multiplyScalar(2 * (this.dir.dot(closerHit.normal))));
			}
			return this.calcCollision( closerHit.point.clone().sub(offset), dist - closerHit.distance );
		}

		// Return final position
		return new Vector3(
			pos.x + this.dir.x * dist,
			pos.y + this.dir.y * dist,
			0
		);
	}

	update( dt ) {
		this.position.copy( this.calcCollision( this.position, this.speed * dt ) );
		this.lookAt(this.dir.clone().add(this.position));
		this.scale.x = 1 + this.speed / 200;
		this.scale.y = 2 - this.scale.x;

		// Reset if OOB
		if ( Math.abs(this.position.x) > 8 || Math.abs(this.position.y) > 5 ) {
			this.reset();
		}
	}

	reset() {
		this.position.set(MathUtils.randFloat( -2, 2 ), MathUtils.randFloat( -1, 1 ), -2);
		this.dir = new Vector3(MathUtils.randFloat( -1, 1 ), MathUtils.randFloat( -0.5, 0.5 ), 0);
		this.dir.normalize();
		this.speed = 5;
	}

	delete() {
		this.renderer.delete();
		this.updatable.delete();
	}

}

export { Ball };
