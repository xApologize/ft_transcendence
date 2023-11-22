import { Loop } from "../systems/Loop.js";
import { Component } from "./Component.js";

class Updatable extends Component {
	_onEnabled() {
		Loop.addUpdatable( this.obj );
	}

	_onDisabled() {
		Loop.removeUpdatable( this.obj );
	}
}

export { Updatable };
