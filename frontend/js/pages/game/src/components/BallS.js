import { Collider } from '../modules/Collider.js';
import { Renderer } from '../modules/Renderer.js';
import { Updatable } from '../modules/Updatable.js';
import { Layers } from '../systems/Layers.js';
import {
	InstancedMesh,
	Matrix4,
	Mesh,
	Quaternion,
	Raycaster,
	Vector3
} from 'three';

class Ball extends Mesh {
	constructor( geometry, material, count ) {
		super( geometry, material, count );

		this.renderer = new Renderer( this );
		this.renderer.setLayers( Layers.Default, Layers.Ball );
		this.updatable = new Updatable( this );

		this.radius = this.geometry.parameters.radius;
		this.pos = new Vector3();
		this.dir = new Vector3();
		this.speed = 0;
		this.colliding = 0;
		
		this.reset();
		
		this.ray = new Raycaster();
		this.ray.layers.enable( Layers.Goal );
		this.ray.layers.enable( Layers.Solid );

		this.matrix = new Matrix4();

		this.lastFixedUpdate = new Date().getTime();
	}

	calcCollision( ballInst, dist, maxRecursion ) {
		// Generate Rays
		let closerHit = undefined;
		let offset = undefined;
		for (let i = 0; i < 8; i++) {
			const origin = new Vector3( Math.cos( i * (Math.PI / 4) ) * this.radius, Math.sin( i * (Math.PI / 4) ) * this.radius, 0 );
			origin.add( this.position );
			this.ray.set( origin, this.dir );
			this.ray.far = dist;
			const hits = this.ray.intersectObjects( Collider.getSolids() );
			if ( hits.length > 0 ) {
				if (closerHit == undefined || hits[0].distance < closerHit.distance ) {
					closerHit = hits[0];
					offset = new Vector3( Math.cos( i * (Math.PI / 4) ) * this.radius, Math.sin( i * (Math.PI / 4) ) * this.radius, 0 );
					continue;
				}
			}
		}

		// Process collision on closerHit
		if ( closerHit != undefined && this.colliding != closerHit.object ) {
			this.colliding = closerHit.object;
			if ( closerHit.object.layers.isEnabled( Layers.Goal ) ) {
				if ( typeof closerHit.object.onCollision === "function" )
				closerHit.object.onCollision( this );
				this.reset();
				return;
			}
			closerHit.normal.setZ( 0 );
			
			this.dir.reflect( closerHit.normal );
			if ( closerHit.object.layers.isEnabled( Layers.Player ) ) {
				if ( this.dir.dot( closerHit.object.dir ) < 0 ) {
					this.speed *= 1.2;
					this.dir.y += closerHit.point.y - closerHit.object.position.y;
				}
			}
			this.dir.normalize();
			this.position.copy( closerHit.point.clone().sub(offset) );

			if ( typeof closerHit.object.onCollision === "function" )
				closerHit.object.onCollision();

			return this.calcCollision( dist - closerHit.distance, maxRecursion - 1 );
		}

		//No Collision
		this.colliding = undefined;
		this.position.add( ballInst.dir.clone().multiplyScalar( dist ) );
	}

	update( dt ) {
		const lag = (new Date().getTime() - this.lastFixedUpdate) / 1000;
		this.position.set( this.pos.clone.add( this.dir.clone().multiplyScalar( lag * this.speed ) ) );
		// Rotate toward movement
		this.quaternion.set( new Quaternion().setFromUnitVectors( new Vector3( 1, 0, 0 ), this.dir ) );
	}

	fixedUpdate( dt ) {
		this.calcCollision( this.ballInst[i], this.speed * dt, 5 );

		// Reset if OOB
		if ( Math.abs( this.position.x ) > 8 || Math.abs( this.position.y ) > 5 ) {
			console.error( "OOB" );
			this.reset( i );
		}
		this.lastFixedUpdate = new Date().getTime();
	}

	reset( ballInst ) {
		ballInst.pos.set( 0, 0, -1 );
		ballInst.dir.set( 1, 1, 0 );
		ballInst.dir.normalize();
		ballInst.speed = 0;
		ballInst.colliding = undefined;

		// let promise = new Promise( function (resolve, reject) {
		// 	setTimeout(() => resolve(ballInst), 1000);
		// });
		let promise = new Promise( resolve => {
			setTimeout(() => resolve(this), 2000);
		})
		// promise.then(this.test);
		promise.then(
			function(result) {
				console.log(result);
				ballInst.pos.set( 0, 0, 0 );
				ballInst.speed = 5;

				// result.matrix.compose(
				// 	ballInst.pos,
				// 	new Quaternion(),
				// 	new Vector3( 1, 1, 1 )
				// );
				// result.setMatrixAt( ballInst.id, result.matrix );
				// result.instanceMatrix.needsUpdate = true;
			}
		)
	}

	overwriteInst( inst ) {
		this.ballInst[inst.id].pos.copy( inst.pos );
		this.ballInst[inst.id].dir.copy( inst.dir );
		this.ballInst[inst.id].speed = inst.speed;
	}

	delete() {
		this.renderer.delete();
		this.updatable.delete();
	}

}

export { Ball };
