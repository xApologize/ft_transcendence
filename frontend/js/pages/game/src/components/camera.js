import { Updatable } from "../modules/Updatable.js";
import { Tween } from "../systems/Tween.js";
import { PerspectiveCamera, MathUtils, Vector3 } from "three";

class MainCamera extends PerspectiveCamera {
	constructor() {
		super( 35, 1, 0.1, 1000 );
		this.updatable = new Updatable( this );

		// this.viewLarge( 0 );
		this.position.set( 0, -35, 10 );
		this.rotation.set( MathUtils.degToRad( 70 ), 0, 0 );
	}

	viewLarge( duration, callback ) {
		new Tween( this.position, new Vector3( 0, -35, 10 ), duration );
		new Tween( this.rotation, new Vector3( MathUtils.degToRad( 70 ), 0, 0 ), duration ).then( callback );
	}

	viewTable( duration, callback ) {
		new Tween( this.position, new Vector3( 0, 0, 20 ), duration );
		new Tween( this.rotation, new Vector3( 0, 0, 0 ), duration ).then( callback );
	}

	update( dt ) {
		if ( this.screenShakeOrigin !== undefined ) {
			this.screenShakeTime -= dt;
			if ( this.screenShakeTime <= 0 ) {
				this.position.copy( this.screenShakeOrigin );
				this.screenShakeOrigin = undefined;
				return;
			}
			this.position.copy(
				this.screenShakeOrigin.clone().add(
					this.screenShakeAngle.clone().multiplyScalar(
						Math.cos( this.screenShakeTime * this.screenShakeStrength )
					)
				)
			);
		}
	}

	screeShake( angle, duration, strength ) {
		if ( this.screenShakeOrigin == undefined )
			this.screenShakeOrigin = this.position.clone();
		this.screenShakeAngle = angle ;
		this.screenShakeTime = duration;
		this.screenShakeStrength = strength;
	}
}

export { MainCamera };
