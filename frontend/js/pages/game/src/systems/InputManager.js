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
		key : ["ShiftLeft", "ShiftRight"]
	}
}

class InputManager {
	constructor() {
		this.setupInputs();
	}

	onKeyDown( event ) {
		if ( event.code == InputMap.movementAxis.keyPositive[0] )
			this.inputStrength.x = this.inputStrength.y + 1;
		if ( event.code == InputMap.movementAxis.keyNegative[0] )
			this.inputStrength.y = this.inputStrength.x + 1;
		if ( event.code == InputMap.boostButton.key[0] )
			this.boostButton = true;

		InputMap.movementAxis.value = this.inputStrength.x > this.inputStrength.y ? 1 :
							this.inputStrength.x < this.inputStrength.y ? -1 : 0;
	}

	onKeyUp( event ) {
		if ( event.code == InputMap.movementAxis.keyPositive[0] )
			this.inputStrength.x = 0;
		if ( event.code == InputMap.movementAxis.keyNegative[0] )
			this.inputStrength.y = 0;
		if ( event.code == InputMap.boostButton.key[0] )
			this.boostButton = false;


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

	delete() {
		document.removeEventListener('keydown', this.onKeyDownEvent, false);
		document.removeEventListener('keyup', this.onKeyUpEvent, false);
	}
}

export { InputManager, InputMap };