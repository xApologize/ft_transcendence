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
		solids.pop( this.obj );
	}

	static getSolids() {
		return solids;
	}
}

export { Collider };
