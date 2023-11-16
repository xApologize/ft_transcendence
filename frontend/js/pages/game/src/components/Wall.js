import { StaticObject } from '../systems/StaticObject.js';
import { addSolid } from '../systems/Solid.js';
import { Layers } from '../systems/Layers.js';

class Wall extends StaticObject {	
	start( ) {
		this.setLayers( Layers.Default, Layers.Solid );
		addSolid( this );
	}
}

export { Wall };
