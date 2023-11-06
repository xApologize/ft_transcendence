import { World } from "../World.js";
import { Loop } from "./Loop.js";

class MonoBehaviour {
	constructor( ) {
		Loop.addUpdatable( this );
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

	update() {
		console.warn("MonoBehaviour: empty call");
	}
	
	delete() {
		World.remove( this.object );
		Loop.removeUpdatable( this );
	}
}

export { MonoBehaviour };
