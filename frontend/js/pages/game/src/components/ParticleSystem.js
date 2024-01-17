import { Collider } from '../modules/Collider.js';
import { Renderer } from '../modules/Renderer.js';
import { Updatable } from '../modules/Updatable.js';
import { Layers } from '../systems/Layers.js';
import {
	Euler,
	InstancedMesh,
	Matrix4,
	Quaternion,
	Raycaster,
	Vector3
} from 'three';

const ParametersDefault = {
	loop: false,
	duration: 1,
	position: new Vector3( 0, 0, 0 ),
	positionRandomRange: new Vector3( 0, 0, 0 ),
	direction: new Vector3( 0, 0, 0 ),
	directionRandomRange: new Vector3( 0, 0, 0 ),
	speed: 0,
	speedOverTime: 0,
	eulerRotation: new Vector3( 0, 0, 0 ),
	eulerRotationRandomRange: new Vector3( 0, 0, 0 ),
	scale: new Vector3( 1, 1, 1 ),
	scaleRandomRange: new Vector3( 0, 0, 0 ),
	scaleOverTime: new Vector3( 0, 0, 0 )
}

class ParticleSystem extends InstancedMesh {
	constructor( geometry, material, count, parameters = ParametersDefault ) {
		super( geometry, material, count );

		this.parameters = parameters;
		this.count = count;
		this.duration = parameters.duration;
		this.time = 0;

		this.matrix = new Matrix4();
		this.inst = [];
		for (let i = 0; i < count; i++) {
			this.resetInst(i);
		}

		this.renderer = new Renderer( this );
		this.renderer.setLayers( Layers.Default );
		this.updatable = new Updatable( this );
	}

	resetInst( i ) {
		this.inst[i] = {
			id: i,
			pos: new Vector3(),
			// direction: new Vector3().randomDirection(),
			direction: this.parameters.direction.clone().add(
				this.parameters.directionRandomRange.clone().multiply( new Vector3().randomDirection() )
				),
			speed: this.parameters.speed * (0.2 + Math.random() * 0.8),
			speedOverTime: this.parameters.speedOverTime * Math.random(),
			colliding: undefined,
			time: 0
		};
		const initialPosition = this.parameters.position.clone().add(
			this.parameters.positionRandomRange.clone().multiply( new Vector3().randomDirection() )
			);
		const initialEulerRotation = new Euler().setFromVector3( this.parameters.eulerRotation.clone().add(
			this.parameters.eulerRotationRandomRange.clone().multiply( new Vector3().randomDirection() )
			) );
		const initialScale = this.parameters.scale.clone().add(
			this.parameters.scaleRandomRange.clone().multiply( new Vector3().randomDirection() )
			);
		const initialDirection = this.parameters.direction.clone().add(
			this.parameters.directionRandomRange.clone().multiply( new Vector3().randomDirection() )
			);
		this.matrix.compose( initialPosition, new Quaternion().setFromEuler( initialEulerRotation ), initialScale );
		this.setMatrixAt( i, this.matrix );
		this.instanceMatrix.needsUpdate = true;
	}

	update( dt ) {
		if ( this.time == this.duration && !this.parameters.loop )
			this.delete();
		this.time += dt;
		if ( this.time > this.duration )
			this.time = this.duration;

		const scale = this.parameters.scaleOverTime.clone().sub( this.parameters.scale ).multiplyScalar( this.time / this.duration ).add( this.parameters.scale )
		
		for (let i = 0; i < this.count; i++) {
			const speed = ( this.inst[i].speedOverTime - this.inst[i].speed ) * ( this.time / this.duration) + this.inst[i].speed;
			
			this.getMatrixAt( i, this.matrix );
			let pos = new Vector3();
			let rot = new Quaternion();
			let sca = new Vector3();
			this.matrix.decompose( pos, rot, sca );
			pos.add(this.inst[i].direction.clone().multiplyScalar( dt * speed ));
			sca.copy( scale );
			this.matrix.compose( pos, rot, sca );
			this.setMatrixAt( i, this.matrix );
			this.instanceMatrix.needsUpdate = true;
			this.inst[i].time += dt;
			if ( this.inst[i].time >= this.parameters.duration && this.parameters.loop ) {
				console.log("called");
				this.resetInst( i );
				this.inst[i].time = 0;
				this.time = 0;
			}
		}
	}

	delete() {
		this.renderer.delete();
		this.updatable.delete();
	}
}

export { ParticleSystem };
