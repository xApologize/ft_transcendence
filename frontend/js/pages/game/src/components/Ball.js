import { World } from '../World.js';
import { Collider } from '../modules/Collider.js';
import { Renderer } from '../modules/Renderer.js';
import { Updatable } from '../modules/Updatable.js';
import { GameState } from '../systems/GameStates.js';
import { Layers } from '../systems/Layers.js';
import {
	BoxGeometry,
	CylinderGeometry,
	InstancedMesh,
	Matrix4,
	MeshBasicMaterial,
	MeshStandardMaterial,
	Quaternion,
	Raycaster,
	SphereGeometry,
	Vector2,
	Vector3
} from 'three';
import { ParticleSystem } from './ParticleSystem.js';

const _baseSpeed = 5.0;
const _baseSize = 0.2;

const particles_geo = new BoxGeometry( 0.2, 0.2, 0.2 );
const particles_mat = new MeshBasicMaterial({ color: 'white' });
const hitParticlesParam = {
	duration: 0.4,
	position: new Vector3( 0, 0, 0 ),
	positionRandomRange: new Vector3( 0.1, 0.1, 0.1 ),
	direction: new Vector3( 0, 0, 0 ),
	directionRandomRange: new Vector3( 1, 1, 1 ),
	speed: 10,
	speedOverTime: 0,
	eulerRotation: new Vector3( 0, 0, 0 ),
	eulerRotationRandomRange: new Vector3( Math.PI, Math.PI, Math.PI ),
	scale: new Vector3( 1, 1, 1 ),
	scaleRandomRange: new Vector3( 2, 2, 2 ),
	scaleOverTime: new Vector3( 0, 0, 0 )
}

const trailparticles_mat = new MeshBasicMaterial({ color: 'white' });
const trailParticlesParam = {
	loop: true,
	duration: 0.4,
	position: new Vector3( 0, 0, 0 ),
	positionRandomRange: new Vector3( 0.1, 0.1, 0.1 ),
	direction: new Vector3( 0, 0, 0 ),
	directionRandomRange: new Vector3( 1, 1, 1 ),
	speed: 10,
	speedOverTime: 0,
	eulerRotation: new Vector3( 0, 0, 0 ),
	eulerRotationRandomRange: new Vector3( Math.PI, Math.PI, Math.PI ),
	scale: new Vector3( 1, 1, 1 ),
	scaleRandomRange: new Vector3( 2, 2, 2 ),
	scaleOverTime: new Vector3( 0, 0, 0 )
}


class Ball extends InstancedMesh {
	constructor( count ) {
		super(
			new CylinderGeometry( _baseSize, _baseSize, 0.4 ),
			// new SphereGeometry( 0.2 ),
			new MeshStandardMaterial({ color: 'white' }),
			// new MeshBasicMaterial({ color: 'white' }),
			count
		);
		this.geometry.rotateX( Math.PI / 2 );

		this.castShadow = true;
		this.receiveShadow = true;

		this.renderer = new Renderer( this );
		this.renderer.setLayers( Layers.Default, Layers.Ball, Layers.Buffer );
		this.updatable = new Updatable( this );

		this.ballInst = [];
		for (let i = 0; i < this.count; i++) {
			this.ballInst[i] = {
				id: i,
				pos: new Vector3(),
				dir: new Vector3(),
				spin: 0,
				speed: 0,
				colliding: undefined,
				smashed: false
			};
			this.hideInst( this.ballInst[i] );
		}

		this.trail = new ParticleSystem( particles_geo, trailparticles_mat, trailParticlesParam );
		// this.trail.renderer.setLayers( Layers.Buffer );
		
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
			const origin = new Vector3( Math.cos( i * (Math.PI / 4) ) * _baseSize, Math.sin( i * (Math.PI / 4) ) * _baseSize, 0 );
			origin.add( ballInst.pos );
			this.ray.set( origin, ballInst.dir );
			this.ray.far = dist;
			const hits = this.ray.intersectObjects( Collider.getSolids() );
			if ( hits.length > 0 ) {
				if (closerHit == undefined || hits[0].distance < closerHit.distance ) {
					closerHit = hits[0];
					offset = new Vector3( Math.cos( i * (Math.PI / 4) ) * _baseSize, Math.sin( i * (Math.PI / 4) ) * _baseSize, 0 );
					continue;
				}
			}
		}

		// Process collision on closerHit
		if ( closerHit != undefined && ballInst.colliding != closerHit.object ) {
			ballInst.colliding = closerHit.object;

			hitParticlesParam.position.copy( closerHit.point );
			this.particles = new ParticleSystem( particles_geo, particles_mat, 20, hitParticlesParam );
			this.particles.renderer.setLayers( Layers.Buffer );
			document.getElementById("hit").play();

			if ( closerHit.object.layers.isEnabled( Layers.Goal ) ) {
				if ( closerHit.object.paddle.isOpponent == true ) {
					ballInst.speed = 0;
					World._instance.match.waitingForGoal = true;
					return;
				}
				if ( typeof closerHit.object.onCollision !== "function" )
					console.error( "Missing onCollision method on Goal object" );
				closerHit.object.onCollision( ballInst );
				return;
			}
			closerHit.normal.setZ( 0 );
			
			if ( closerHit.object.layers.isEnabled( Layers.Player ) )
				this.playerCollision( ballInst, closerHit.point, closerHit.object );
			else
				ballInst.dir.reflect( closerHit.normal );

			ballInst.dir.normalize();
			ballInst.pos.copy( closerHit.point.clone().sub(offset) );

			if ( typeof closerHit.object.onCollision === "function" )
				closerHit.object.onCollision( ballInst );

			return this.calcCollision( ballInst, dist - closerHit.distance, maxRecursion - 1 );
		}

		//No Collision
		ballInst.colliding = undefined;
		ballInst.pos.add( ballInst.dir.clone().multiplyScalar( dist ) );
	}

	playerCollision( ballInst, point, object, smashed = false ) {
		if ( ballInst.dir.dot( object.dir ) > 0 ) {
			ballInst.dir.reflect( point.x < 0 ? new Vector3( 1, 0, 0 ) : new Vector3( -1, 0, 0 ) );

			ballInst.speed *= 1.1;
			ballInst.dir.y += ( point.y - object.position.y ) / ( object.length / 2 );
			ballInst.dir.y /= 2;

			// Match player velocity - break the game w/ Dash
			// const dot = ballInst.dir.dot( object.movement );
			// if ( ballInst.speed < dot * object.speed )
			// 	ballInst.speed = dot * object.speed;

			ballInst.smashed = smashed;
			ballInst.spin = 0;

			if ( smashed ) {
				hitParticlesParam.position.copy( ballInst.pos );
				hitParticlesParam.speed = 20;
				this.particles = new ParticleSystem( particles_geo, particles_mat, 80, hitParticlesParam );
				this.particles.renderer.setLayers( Layers.Buffer );
			}
		}
	}

	update( dt ) {
		trailParticlesParam.position.copy( this.ballInst[0].pos );
		
		for (let i = 0; i < this.count; i++) {
			const lag = (new Date().getTime() - this.lastFixedUpdate) / 1000;
			const newPos = this.ballInst[i].pos.clone().add(
				this.ballInst[i].dir.clone().multiplyScalar( lag * this.ballInst[i].speed * ( this.ballInst[i].smashed ? 2 : 1 ) )
			);

			// Rotate toward movement
			let rot = new Quaternion().setFromUnitVectors( new Vector3( 1, 0, 0 ), this.ballInst[i].dir );
			this.matrix.compose(
				newPos,
				rot,
				new Vector3( -Math.pow( 2, -this.ballInst[i].speed / 60 ) + 2, 1, 1 )
			);
			this.setMatrixAt( i, this.matrix );
			this.instanceMatrix.needsUpdate = true;
		}
		World._instance.terrain.panel.bufferMat.uniforms.refPos.value = new Vector2(
				this.ballInst[0].pos.x + this.ballInst[0].dir.x * this.ballInst[0].speed * dt,
				this.ballInst[0].pos.y + this.ballInst[0].dir.y * this.ballInst[0].speed * dt
			);	
	}

	fixedUpdate( dt ) {
		for (let i = 0; i < this.count; i++) {
			this.ballInst[i].dir.applyAxisAngle( new Vector3( 0, 0, 1 ), Math.cos( new Date().getTime() / 1000 ) * this.ballInst[i].spin * dt )

			this.calcCollision( this.ballInst[i], this.ballInst[i].speed * ( this.ballInst[i].smashed ? 2 : 1 ) * dt, 5 );
	
			// Reset if OOB
			if ( Math.abs( this.ballInst[i].pos.x ) > 12 || Math.abs( this.ballInst[i].pos.y ) > 8 ) {
				console.error( "OOB" );
				this.initInst( this.ballInst[i] );
			}
		}
		this.lastFixedUpdate = new Date().getTime();
	}

	hide() {
		for (let i = 0; i < this.count; i++) {
			this.hideInst(this.ballInst[i]);
		}

		World._instance.terrain.panel.bufferMat.uniforms.refPos.value = new Vector2( 0, 0 );
	}

	hideInst( ballInst ) {
		ballInst.pos.set( 0, 0, -1 );
		ballInst.speed = 0;
		ballInst.colliding = undefined;
	}

	init() {
		for (let i = 0; i < this.count; i++) {
			this.initInst(this.ballInst[i]);
		}
	}

	initInst( ballInst, side = 1 ) {
		ballInst.pos.set( 0, 0, 0 );
		ballInst.dir.set( side, Math.cos( ballInst.id ), 0 );
		ballInst.dir.normalize();
		ballInst.speed = 0;
		ballInst.smashed = false;
		ballInst.spin = 0;
		ballInst.colliding = undefined;

		this.matrix.compose(
			ballInst.pos,
			new Quaternion(),
			new Vector3( 1, 1, 1 )
		);
		this.setMatrixAt( ballInst.id, this.matrix );
		this.instanceMatrix.needsUpdate = true;

		new Promise( resolve => {
			setTimeout(() => resolve(this), 1000);
		})
		.then(
			function() {
				if ( World._instance.currentGameState == GameState.InMatch )
					ballInst.speed = _baseSpeed;
			}
		)
	}

	overwriteInst( inst ) {
		this.ballInst[inst.id].pos.copy( inst.pos );
		this.ballInst[inst.id].dir.copy( inst.dir );
		this.ballInst[inst.id].speed = inst.speed;
		this.ballInst[inst.id].smashed = inst.smashed;
		this.ballInst[inst.id].spin = inst.spin;


		hitParticlesParam.position.copy( inst.pos );
		if (inst.smashed) {
			hitParticlesParam.speed = 20;
			this.particles = new ParticleSystem( particles_geo, particles_mat, 80, hitParticlesParam );
			document.getElementById("crash").play();
		} else {
			hitParticlesParam.speed = 10;
			this.particles = new ParticleSystem( particles_geo, particles_mat, 20, hitParticlesParam );
			document.getElementById("hit").play();
		}
		this.particles.renderer.setLayers( Layers.Buffer );
		World._instance.match.waitingForGoal = false;
	}

	delete() {
		this.renderer.delete();
		this.updatable.delete();
	}
}

export { Ball };
