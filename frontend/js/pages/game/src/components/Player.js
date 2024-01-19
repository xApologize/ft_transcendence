import { Collider } from '../modules/Collider.js';
import { Updatable } from '../modules/Updatable.js';
import { Layers } from '../systems/Layers.js';
import { InputMap } from '../systems/InputManager.js';
import { Paddle } from './Paddle.js';
import {
	Raycaster,
	Vector3
} from 'three';
import { World } from '../World.js';
import { Tween } from '../systems/Tween.js';

const initialSpeed = 6;
const initialBoostSpeed = 50;
const initialSmashCd = 0.4;
const initialDashCd = 4.2;

class Player extends Paddle {
	constructor( position, id, nickname ) {
		super( position, id, nickname );

		this.isPlayer = true;

		this.speed = initialSpeed;
		this.movement = new Vector3( 0, 0, 0 );
		this.smashCd = 0;
		this.lastDir = 1;
		this.dashCount = 3;

		this.ray = new Raycaster();
		this.ray.layers.set( Layers.Solid );

		this.wsData = {
			id: this.sideId,
			pos: this.position,
			ballInst: undefined,
			smash: undefined,
			dashCount: undefined
		};

		this.collider = new Collider( this );
		this.updatable = new Updatable( this );

		this.boostButtonPressedEvent = (e) => {
			if ( this.speed == initialSpeed && this.dashCount >= 1 ) {
				this.speed = initialBoostSpeed;
				this.dashCount -= 1;
			}
		};
		this.boostButtonReleasedEvent = (e) => {
			// this.speed = initialSpeed;
		};
		this.reflectButtonPressedEvent = (e) => {
			if ( this.smashCd > 0 )
				return;

			const ball = World._instance.balls.ballInst[0];
			this.smashAnimation( this.lastDir );
			this.smashCd = initialSmashCd;


			if ( World._instance.socket != undefined && World._instance.socket.readyState === WebSocket.OPEN) {
				this.wsData.smash = this.lastDir;
				World._instance.socket.send( JSON.stringify( this.wsData ) );
			}
			this.wsData.smash = undefined;

			if ( this.position.distanceTo( ball.pos ) > this.length * 0.7 )
				return;

			// if ( ball.pos.y < (this.position.y - this.length / 2) || ball.pos.y > (this.position.y + this.length / 2) )
			// 	return;
			// if ( Math.abs( ball.pos.x - this.position.x ) > 2 )
			// 	return;
			if ( Math.sign( ball.dir.x ) != Math.sign( position.x ) )
				return;

			const pos = new Vector3(
				this.position.x,
				World._instance.balls.ballInst[0].pos.y,
				this.position.z
			);
			document.getElementById("crash").play();
			World._instance.balls.ballInst[0].dir.y += this.lastDir;
			World._instance.balls.playerCollision( World._instance.balls.ballInst[0], pos, this, true );
			// World._instance.balls.ballInst[0].smashed = true;
			World._instance.balls.ballInst[0].dir.normalize();
			World._instance.balls.ballInst[0].spin = InputMap.movementAxis.value * Math.PI / 2;
			this.onCollision( World._instance.balls.ballInst[0] );
		};
		if ( World._instance.currentGameMode == "Upgraded" ) {
			document.addEventListener( "boostButtonPressed", this.boostButtonPressedEvent );
			document.addEventListener( "boostButtonReleased", this.boostButtonReleasedEvent );
			document.addEventListener( "reflectButtonPressed", this.reflectButtonPressedEvent );
		}
	}

	fixedUpdate ( dt ) {
		if ( World._instance.socket != undefined && World._instance.socket.readyState === WebSocket.OPEN) {
			World._instance.socket.send( JSON.stringify( this.wsData ) );
		}

		this.smashCd -= dt;

		
		if ( World._instance.currentGameMode == "Upgraded" ) {
			if ( this.dashCount < 3 )
				this.dashCount += dt / initialDashCd;
			else
				this.dashCount = 3;
			this.dashSpheresAnimation( this.dashCount );
			
			this.wsData.dashCount = this.dashCount;
		}
		else
			this.wsData.dashCount = undefined;
	}

	update( dt ) {
		this.movement = new Vector3( 0, InputMap.movementAxis.value, 0 );

		if ( this.speed > initialSpeed ) {
			this.speed -= initialBoostSpeed * dt * 8;
			if ( this.speed < initialSpeed )
				this.speed = initialSpeed;
		}
		// if ( this.movement.y === 0 )
		// 	return;
		if ( this.movement.y !== 0 )
			this.lastDir = this.movement.y;

		if ( this.speed > initialSpeed ) {
			this.movement = new Vector3( 0, this.lastDir, 0 );
		}
		
		this.ray.set( this.position, this.movement );
		this.ray.far = this.length / 2 + this.speed * dt;
		const hits = this.ray.intersectObjects( Collider.getSolids() );
		if ( hits.length > 0 ) {
			this.position.add( this.movement.clone().multiplyScalar( hits[0].distance - this.length / 2 ) );
		} else {
			this.position.add( this.movement.clone().multiplyScalar( this.speed * dt ) );
		}
	}

	onCollision( hit ) {
		if ( World._instance.socket != undefined && World._instance.socket.readyState === WebSocket.OPEN) {
			this.wsData.ballInst = hit;
			World._instance.socket.send( JSON.stringify( this.wsData ) );
		}
		this.wsData.ballInst = undefined;
	}

	delete() {
		super.delete();
		this.updatable.delete();
		this.collider.delete();
		if ( World._instance.currentGameMode == "Upgraded" ) {
			document.removeEventListener( "boostButtonPressed", this.boostButtonPressedEvent );
			document.removeEventListener( "boostButtonReleased", this.boostButtonReleasedEvent );
			document.removeEventListener( "reflectButtonPressed", this.reflectButtonPressedEvent );
		}
	}
}

export { Player };
