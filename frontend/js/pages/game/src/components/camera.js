import { Updatable } from "../modules/Updatable.js";
import { PerspectiveCamera, MathUtils, Vector3 } from "three";
import { Tween } from "../systems/Tween.js";

let delay = 1;

class MainCamera extends PerspectiveCamera {
	constructor() {
		super( 35, 1, 0.1, 1000 );
		this.updatable = new Updatable( this );

		this.position.set( 0, -35, 10 );
		this.rotation.set( MathUtils.degToRad( 70 ), 0, 0 );
		
		// this.viewTable( 0 );

		document.addEventListener('keydown', (event) => {
			if ( event.code == "KeyT" ) {
				this.viewTable( 1 );
			}
			if ( event.code == "KeyY" ) {
				this.viewLarge( 1 );
			}
		}, false);
	}

	viewLarge( duration ) {
		new Tween( this.position, new Vector3( 0, -35, 10 ), duration );
		new Tween( this.rotation, new Vector3( MathUtils.degToRad( 70 ), 0, 0 ), duration );
	}

	viewTable( duration ) {
		new Tween( this.position, new Vector3( 0, 0, 20 ), duration );
		new Tween( this.rotation, new Vector3( 0, 0, 0 ), duration );
	}

	update( dt ) {

	}
}

export { MainCamera };
