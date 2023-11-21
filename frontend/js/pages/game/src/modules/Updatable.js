import { Loop } from "../systems/Loop.js";

class Updatable {
	constructor( obj ) {
		this.obj = obj;
		Loop.addUpdatable( this.obj );
	}

	delete() {
		Loop.removeUpdatable( this.obj );
	}
}

export { Updatable };
