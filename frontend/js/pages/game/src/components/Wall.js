import { StaticObject } from '../systems/StaticObject.js';
import { addSolid, removeSolid } from '../systems/Solid.js';
import { Layers } from '../systems/Layers.js';

class Wall extends StaticObject {	
	start( ) {
		this.setLayers( Layers.Default, Layers.Solid );
		addSolid( this );
	}

	delete() {
		super.delete();
		removeSolid( this );
	}
}

export { Wall };
