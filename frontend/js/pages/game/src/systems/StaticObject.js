import { Mesh } from "three";
import { World } from "../World.js";

class StaticObject extends Mesh {
	constructor( ...args ) {
		super( args[0], args[1] );
		this.start.apply( this, args.slice(2) );
		World.add( this );
	}

	start() {
		console.warn( "StaticObject: start() called while undefined!" );
	}
	
	setLayers( ...layers ) {
		this.traverse(function(child) {
			child.layers.disableAll(0);
			layers.forEach(layer => {
				child.layers.enable(layer);
			});
		});
	}
	
	delete() {
		this.material.dispose();
		this.geometry.dispose();
		World.remove( this );
	}
	
	onCollision() {
		console.warn( "StaticObject: onCollision() called while undefined!" );
	}
}

export { StaticObject };
