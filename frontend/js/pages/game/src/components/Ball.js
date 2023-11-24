import { Collider } from '../modules/Collider.js';
import { Renderer } from '../modules/Renderer.js';
import { Updatable } from '../modules/Updatable.js';
import { Layers } from '../systems/Layers.js';
import {
	InstancedMesh,
	MathUtils,
	Matrix4,
	Quaternion,
	Raycaster,
	Vector3
} from 'three';

class Ball extends InstancedMesh {
	constructor( geometry, material, count ) {
		super( geometry, material, count );

		this.renderer = new Renderer( this );
		this.renderer.setLayers( Layers.Default, Layers.Ball );
		this.updatable = new Updatable( this );

		this.radius = this.geometry.parameters.radius;

		this.vars = [];
		for (let i = 0; i < this.count; i++) {
			var x = {
				pos: new Vector3( MathUtils.randFloat( -4, 4 ), MathUtils.randFloat( -2, 2 ), 0 ),
				dir: new Vector3( MathUtils.randFloat( -1, 1 ), MathUtils.randFloat( -0.5, 0.5 ), 0 ).normalize(),
				speed: 5,
				colliding: undefined
			}
			this.vars[i] = x;
		}
		
		
		this.ray = new Raycaster();
		this.ray.layers.enable( Layers.Goal );
		this.ray.layers.enable( Layers.Solid );

		this.matrix = new Matrix4();
	}

	// Recursion error quand vitesse extreme
	calcCollision( vars, dist, maxRecursion ) {
		// if (dist < 0)
		// 	dist = 0;

		if ( maxRecursion <= 0 ) {
			console.warn( "Collision Recursion forced stop" );
			return;
		}

		// Generate Rays
		let closerHit = undefined;
		let offset = undefined;
		for (let i = 0; i < 8; i++) {
			const origin = new Vector3( Math.cos( i * (Math.PI / 4) ) * this.radius, Math.sin( i * (Math.PI / 4) ) * this.radius, 0 );
			origin.add( vars.pos );
			this.ray.set( origin, vars.dir );
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

		if ( closerHit != undefined && vars.colliding != undefined )
			console.warn( "Avoided Too many collisions " );

		// Process collision on closerHit
		if ( closerHit != undefined && vars.colliding != closerHit.object ) {
			if ( typeof closerHit.object.onCollision === "function" )
				closerHit.object.onCollision( this );
			vars.colliding = closerHit.object;
			// if ( closerHit.object.layers.isEnabled( Layers.Player ) ) {
			// 	if ( vars.dir.dot( closerHit.object.dir ) > 0 ) {
			// 		vars.dir.set( -Math.sign(vars.dir.x), closerHit.point.y - closerHit.object.position.y, 0 );
			// 		vars.dir.normalize();
					vars.speed += 1;
			// 	}
			// 	vars.pos.add( vars.dir.clone().multiplyScalar( dist ) );
			// 	return;
			/*} else*/ if ( closerHit.object.layers.isEnabled( Layers.Goal ) ) {
				vars.dir = new Vector3(MathUtils.randFloat( -1, 1 ), MathUtils.randFloat( -0.5, 0.5 ), 0);
				vars.dir.normalize();
				vars.speed = 5;
				vars.pos.set( MathUtils.randFloat( -2, 2 ), MathUtils.randFloat( -1, 1 ), 0 );
				return;
			} else {
				closerHit.normal.setZ( 0 );
				vars.dir.reflect( closerHit.normal );
				vars.dir.normalize();
			}
			vars.pos.copy( closerHit.point.clone().sub(offset) );
			return this.calcCollision( vars, dist - closerHit.distance, maxRecursion - 1 );
		}
		vars.colliding = undefined;

		vars.pos.add( vars.dir.clone().multiplyScalar( dist ) );
	}

	update( dt ) {
		for (let i = 0; i < this.count; i++) {
			this.calcCollision( this.vars[i], this.vars[i].speed * dt, 5 );
			this.matrix.compose(
				this.vars[i].pos,
				new Quaternion(),
				// this.lookAt(this.dir.clone().add(this.position));
				new Vector3( 1 + this.vars[i].speed / 200, 2 - (1 + this.vars[i].speed / 200), 1 )
			);
			this.matrix.set
			this.setMatrixAt( i, this.matrix );
			this.instanceMatrix.needsUpdate = true;
	
			// Reset if OOB
			if ( Math.abs( this.vars[i].pos.x ) > 8 || Math.abs( this.vars[i].pos.y ) > 5 ) {
				console.error( "OOB" );
				this.reset( i );
			}
		}
	}

	reset( i ) {
		console.log( this.vars[i] );
		this.vars[i].pos.set(MathUtils.randFloat( -2, 2 ), MathUtils.randFloat( -1, 1 ), -2);
		this.vars[i].dir = new Vector3(MathUtils.randFloat( -1, 1 ), MathUtils.randFloat( -0.5, 0.5 ), 0);
		this.vars[i].dir.normalize();
		this.vars[i].speed = 5;
	}

	delete() {
		this.renderer.delete();
		this.updatable.delete();
	}

}

export { Ball };
