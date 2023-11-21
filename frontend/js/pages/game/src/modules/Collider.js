import { World } from "../World";

const solids = []

class Collider {
	constructor( obj ) {
		this.obj = obj;
		solids.push( this.obj );
	}

	onCollision() {
		this.obj.onCollision();
	}

	delete() {
		solids.pop( this.obj );
	}

	static getSolids() {
		return solids;
	}
}

export { Collider };
