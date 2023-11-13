import { World } from "../World.js";

class MeshRenderer {
	constructor( ) {
		this.mesh = null;
		this.start();
		if ( !isStatic )
			Loop.addUpdatable( this );
	}
	
	start() {
		
	}

	update( dt ) {

	}
}

export { MeshRenderer };
