import { Updatable } from "../modules/Updatable.js";
import { PerspectiveCamera, MathUtils } from "three";

class MainCamera extends PerspectiveCamera {
	constructor() {
		super( 30, 1, 0.1, 1000 );
		this.updatable = new Updatable( this );
		// this.renderer = new RendererModule();
		// this.collider = new ColliderModule();

		// camera.position.set(0, 0, 20);
		this.position.set( 0, -35, 10 );
		this.rotation.set( MathUtils.degToRad(70), 0, 0 );
	
		
		// const camera = new OrthographicCamera( -r, r, -r * aspect, r * aspect, 0.01, 100 );
		// camera.position.set(0, 0, 10);
	}

	update( dt ) {
		if (this.rotation.x > 0)
			this.rotation.x -= dt * MathUtils.degToRad(70);
		if (this.position.y < 0)
			this.position.y += dt * 35;
		if (this.position.z < 20)
			this.position.z += dt * 10;
	}
}

export { MainCamera };
