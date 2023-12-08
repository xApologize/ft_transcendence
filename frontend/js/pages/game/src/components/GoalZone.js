import { Mesh } from 'three';
import { Layers } from '../systems/Layers.js';
import { Collider } from '../modules/Collider.js';
import { Renderer } from '../modules/Renderer.js';
import { World } from '../World.js';

class GoalZone extends Mesh {
	constructor( geometry, material, playerId ) {
		super( geometry, material );

		this.collider = new Collider( this );
		this.renderer = new Renderer( this );
		this.renderer.setLayers( Layers.Goal );

		this.playerId = playerId;
		this.paddle = undefined;
	}

	onCollision( hit ) {
		this.paddle.ballMissed( hit );
		// World.scoreAdd( this.playerId == 1 ? 2 : 1 );
	}

	delete() {
		this.collider.delete();
		this.renderer.delete();
	}
}

export { GoalZone };
