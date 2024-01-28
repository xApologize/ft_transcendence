import { Loop } from "../systems/Loop.js";

class Component {
	constructor( obj ) {
		this.obj = obj;
		this.enabled = true;
		this._onEnabled();
	}

	_onEnabled() {
		console.warn("Undefined behaviour _onEnabled()");
	}

	_onDisabled() {
		console.warn("Undefined behaviour _onDisabled()");
	}

	setEnabled( is ) {
		if ( this.enabled && !is ) {
			this.enabled = false;
			this._onDisabled();
		}
		else if ( !this.enabled && is ) {
			this.enabled = true;
			this._onEnabled();
		}
	}

	delete() {
		if ( this.enabled )
			this._onDisabled();
	}
}

export { Component };
