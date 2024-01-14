import { Layers } from '../systems/Layers.js';
import { Collider } from '../modules/Collider.js';
import { Mesh } from 'three';

class SolidMesh extends Mesh {
	constructor( geometry, material, invisible ) {
		super( geometry, material );
		this.collider = new Collider( this );
		this.layers.enable( Layers.Solid );
		if ( invisible )
			this.layers.disable( Layers.Default );
	}

	delete() {
		this.collider.delete();
	}
}

export { SolidMesh };
