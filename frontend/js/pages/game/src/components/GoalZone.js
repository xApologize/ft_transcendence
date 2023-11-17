import { StaticObject } from '../systems/StaticObject.js';
import { addSolid, removeSolid } from '../systems/Solid.js';
import { Layers } from '../systems/Layers.js';
import { Score } from './Score.js';

class GoalZone extends StaticObject {	
	start( playerId ) {
		this.playerId = playerId;
		this.setLayers( Layers.Goal );
		addSolid( this );
	}

	onCollision() {
		console.log("GOAL! Player " + this.playerId + " missed the ball.");
		Score.scoreAdd( this.playerId );
	}

	delete() {
		super.delete();
		removeSolid( this );
	}
}

export { GoalZone };
