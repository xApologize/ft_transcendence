import { Updatable } from '../modules/Updatable.js';
import {
	Vector2
} from 'three';

const InputMap = {
	movementAxis : {
		value : 0,
		keyPositive : ["KeyW", "ArrowUp"],
		keyNegative : ["KeyS", "ArrowDown"]
	},
	boostButton : {
		value : false,
		key : ["ShiftLeft", "ShiftRight"],
		eventPressed: new Event("boostButtonPressed"),
		eventHold: new Event("boostButtonHold"),
		eventReleased: new Event("boostButtonReleased"),
	},
	reflectButton : {
		value : false,
		key : ["Space", "E"],
		eventPressed: new Event("reflectButtonPressed"),
		eventHold: new Event("reflectButtonHold"),
		eventReleased: new Event("reflectButtonReleased"),
	}
}

class InputManager {
	constructor() {
		this.setupInputs();
		this.updatable = new Updatable( this );
	}

	onKeyDown( event ) {
		if ( InputMap.movementAxis.keyPositive.includes( event.code ) )
			this.inputStrength.x = this.inputStrength.y + 1;
		if ( InputMap.movementAxis.keyNegative.includes( event.code ) )
			this.inputStrength.y = this.inputStrength.x + 1;
		if ( InputMap.boostButton.key.includes( event.code ) ) {
			InputMap.boostButton.value = true;
			document.dispatchEvent( InputMap.boostButton.eventPressed );
		}
		if ( InputMap.reflectButton.key.includes( event.code ) ) {
			InputMap.reflectButton.value = true;
			document.dispatchEvent( InputMap.reflectButton.eventPressed );
		}

		InputMap.movementAxis.value = this.inputStrength.x > this.inputStrength.y ? 1 :
							this.inputStrength.x < this.inputStrength.y ? -1 : 0;
	}

	onKeyUp( event ) {
		if ( InputMap.movementAxis.keyPositive.includes( event.code ) )
			this.inputStrength.x = 0;
		if ( InputMap.movementAxis.keyNegative.includes( event.code ) )
			this.inputStrength.y = 0;
		if ( InputMap.boostButton.key.includes( event.code ) ) {
			InputMap.boostButton.value = false;
			document.dispatchEvent( InputMap.boostButton.eventReleased );
		}
		if ( InputMap.reflectButton.key.includes( event.code ) ) {
			InputMap.reflectButton.value = false;
			document.dispatchEvent( InputMap.reflectButton.eventReleased );
		}

		InputMap.movementAxis.value = this.inputStrength.x > this.inputStrength.y ? 1 :
							this.inputStrength.x < this.inputStrength.y ? -1 : 0;
	}

	setupInputs() {
		this.inputStrength = new Vector2( 0, 0 );

		this.onKeyDownEvent = (event) => this.onKeyDown( event );
		this.onKeyUpEvent = (event) => this.onKeyUp( event );

		document.addEventListener('keydown', this.onKeyDownEvent, false);
		document.addEventListener('keyup', this.onKeyUpEvent, false);
	}

	update( dt ) {
		if ( InputMap.boostButton.value === true )
			document.dispatchEvent( InputMap.boostButton.eventHold );
		if ( InputMap.boostButton.value === true )
			document.dispatchEvent( InputMap.reflectButton.eventHold );
	}

	delete() {
		document.removeEventListener('keydown', this.onKeyDownEvent, false);
		document.removeEventListener('keyup', this.onKeyUpEvent, false);
		this.updatable.delete();
	}
}

export { InputManager, InputMap };