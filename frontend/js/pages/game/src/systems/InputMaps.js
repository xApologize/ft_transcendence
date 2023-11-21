class InputMap {
	constructor(pos, neg, boost) {
		this.pos = pos;
		this.neg = neg;
		this.boost = boost;
	}
}

const Player1InputMap = new InputMap( "KeyW", "KeyS", "ShiftLeft" );
const Player2InputMap = new InputMap( "ArrowUp", "ArrowDown", "ShiftRight" );

export { InputMap, Player1InputMap, Player2InputMap };