import { Mesh } from 'three';
import { Layers } from '../systems/Layers.js';
import { Score } from './Score.js';
import { Collider } from '../modules/Collider.js';
import { Renderer } from '../modules/Renderer.js';

class GoalZone extends Mesh {
	constructor( geometry, material, playerId ) {
		super( geometry, material );

		this.collider = new Collider( this );
		this.renderer = new Renderer( this );
		this.renderer.setLayers( Layers.Goal );

		this.playerId = playerId;
	}

	onCollision() {
		// console.log("GOAL! Player " + this.playerId + " missed the ball.");
		Score.scoreAdd( this.playerId );
	}

	delete() {
		this.collider.delete();
		this.renderer.delete();
	}
}

export { GoalZone };
