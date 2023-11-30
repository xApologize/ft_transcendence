import { World } from "../World.js";
import { Component } from "./Component.js";

class Renderer extends Component {
	setLayers( ...layers ) {
		this.obj.traverse(function(child) {
			child.layers.disableAll(0);
			layers.forEach(layer => {
				child.layers.enable(layer);
			});
		});
	}

	_onEnabled() {
		World.add( this.obj );
	}

	_onDisabled() {
		World.remove( this.obj );
	}

	delete() {
		super.delete();
		this.obj.traverse(function(child) {
			child.material.dispose();
			child.geometry.dispose();
		});
	}
}

export { Renderer };
