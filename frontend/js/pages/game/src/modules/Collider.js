import { Component } from "./Component.js";

const solids = []

class Collider extends Component {
	onCollision() {
		this.obj.onCollision();
	}

	_onEnabled() {
		solids.push( this.obj );
	}

	_onDisabled() {
		solids.splice( solids.indexOf(this.obj), 1 );
	}

	static getSolids() {
		return solids;
	}
}

export { Collider };
