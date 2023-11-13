import { World } from "../World.js";

class StaticObject {
	constructor( ) {
		this.start.apply( this, arguments );
		World.add( this.object );
	}

	SetLayers( ...layers ) {
		this.object.traverse(function(child) {
			child.layers.disableAll(0);
			layers.forEach(layer => {
				child.layers.enable(layer);
			});
		});
	}
	
	delete() {
		World.remove( this.object );
	}
}

export { StaticObject };
