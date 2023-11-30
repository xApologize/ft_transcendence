import { Updatable } from "../modules/Updatable.js";
import { PerspectiveCamera, MathUtils, Vector3 } from "three";
import { Tween } from "../systems/Tween.js";

let delay = 1;

class MainCamera extends PerspectiveCamera {
	constructor() {
		super( 30, 1, 0.1, 1000 );
		this.updatable = new Updatable( this );

		this.position.set( 0, -35, 10 );
		this.rotation.set( MathUtils.degToRad( 70 ), 0, 0 );
		
		this.viewTable();
		
		// const camera = new OrthographicCamera( -r, r, -r * aspect, r * aspect, 0.01, 100 );
		// camera.position.set(0, 0, 10);


		document.addEventListener('keydown', (event) => {
			if ( event.code == "KeyT" ) {
				this.viewTable();
			}
			if ( event.code == "KeyY" ) {
				this.viewLarge();
			}
		}, false);
	}

	viewLarge() {
		new Tween( this.position, new Vector3( 0, -35, 10 ), 0.8 );
		new Tween( this.rotation, new Vector3( MathUtils.degToRad( 70 ), 0, 0 ), 0.8 );
	}

	viewTable() {
		new Tween( this.position, new Vector3( 0, 0, 20 ), 0.8 );
		new Tween( this.rotation, new Vector3( 0, 0, 0 ), 0.8 );
	}

	update( dt ) {

	}
}

export { MainCamera };
