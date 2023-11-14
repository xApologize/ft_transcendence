import { DynamicObject } from '../systems/DynamicObject.js';
import {
	ArrowHelper,
	Box3,
	MathUtils,
	Mesh,
	MeshStandardMaterial,
	Raycaster,
	Sphere,
	SphereGeometry,
	Vector3
} from 'three';

class Ball extends DynamicObject {	
	start( terrain ) {
		this.terrain = terrain;
		this.radius = 0.2;
		this.dir = new Vector3(MathUtils.randFloat( -1, 1 ), MathUtils.randFloat( -0.5, 0.5 ), 0);
		this.dir.normalize();
		this.speed = 5;

		const g_sphere = new SphereGeometry( this.radius );
		const m_white = new MeshStandardMaterial({ color: 'white' });
		this.object = new Mesh( g_sphere, m_white );
		
		this.object.position.set(MathUtils.randFloat( -4, 4 ), MathUtils.randFloat( -2, 2 ), -2);
		
		this.SetLayers( 0, 1, 2, 3 );
		
		this.ray = new Raycaster();

		// HELPERS
		// this.arrows = [];
		// for (let i = 0; i < 8; i++) {
		// 	this.arrows.push( new ArrowHelper( 0, new Vector3( 0, 0, 0 ), 0, '#FF0000' ) );
		// 	this.object.add( this.arrows[i] );	
		// }
	}

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
			const hits = this.ray.intersectObjects( this.terrain.colliders );
			if ( hits.length > 0 ) {
				if (closerHit == undefined || hits[0].distance < closerHit.distance ) {
					closerHit = hits[0];
					offset = new Vector3(Math.cos( i * (Math.PI / 4) ) * this.radius, Math.sin( i * (Math.PI / 4) ) * this.radius, 0);
				}
			}
		}

		// Process collision on closerHit
		if ( closerHit != undefined ) {
			this.dir.subVectors(this.dir, closerHit.normal.multiplyScalar(2 * (this.dir.dot(closerHit.normal))));
			// closerHit.object.material.color.set( MathUtils.randInt( 0, 0xFFFFFF ) );
			this.speed += 1;
			const truepos = closerHit.point;
			truepos.sub(offset);
			return this.calcCollision( truepos, dist - closerHit.distance );
		}

		// Return final position
		return new Vector3(
			pos.x + this.dir.x * dist,
			pos.y + this.dir.y * dist,
			0
		);
	}

	update( dt ) {
		this.object.position.copy( this.calcCollision( this.object.position, this.speed * dt ) );

		// DebugRay
		// for (let i = 0; i < 8; i++) {
		// 	this.arrows[i].position.set( Math.cos( i * (Math.PI / 4) ) * this.radius, Math.sin( i * (Math.PI / 4) ) * this.radius, 0 );
		// 	this.arrows[i].setDirection( this.dir );
		// 	this.arrows[i].setLength( this.speed * dt );
		// }

		// Reset if OOB
		if ( Math.abs(this.object.position.x) > 8 || Math.abs(this.object.position.y) > 5 ) {
			this.object.position.set(MathUtils.randFloat( -2, 2 ), MathUtils.randFloat( -1, 1 ), -2);
			this.dir = new Vector3(MathUtils.randFloat( -1, 1 ), MathUtils.randFloat( -0.5, 0.5 ), 0);
			this.dir.normalize();
			this.speed = 5;
		}
	}

}

export { Ball };
