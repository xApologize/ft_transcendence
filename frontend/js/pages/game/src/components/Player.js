import { addSolid, getSolids } from '../systems/Solid.js';
import { DynamicObject } from '../systems/DynamicObject.js';
import { Layers } from '../systems/Layers.js';
import {
	Raycaster,
	Vector2,
	Vector3
} from 'three';

class Player extends DynamicObject {
	start( position, inputMap ) {
		this.position.copy( position );
		this.speed = 5;

		this.setupInputs( inputMap );

		this.ray = new Raycaster();
		this.ray.layers.set( Layers.Solid );

		this.setLayers( Layers.Default, Layers.Player );
		addSolid( this );
	}

	update( dt ) {
		let movement = undefined;

		if ( this.inputStrength.x > this.inputStrength.y )
			movement = new Vector3( 0, 1, 0 );
		else if ( this.inputStrength.x < this.inputStrength.y )
			movement = new Vector3( 0, -1, 0 );
		if ( movement === undefined )
			return;
		
		this.ray.set( this.position, movement );
		this.ray.far = 1.4 + this.speed * dt;
		const hits = this.ray.intersectObjects( getSolids() );
		if ( hits.length > 0 ) {
			this.position.add(movement.multiplyScalar( hits[0].distance - 1.4 ));
		} else {
			this.position.add(movement.multiplyScalar( this.speed * dt ));
		}
	}

	setupInputs( inputMap ) {
		this.inputStrength = new Vector2( 0, 0 );

		document.addEventListener('keydown', (event) => {
			if ( event.code == inputMap.pos )
				this.inputStrength.x = this.inputStrength.y + 1;
			if ( event.code == inputMap.neg )
				this.inputStrength.y = this.inputStrength.x + 1;
			if ( event.code == inputMap.boost )
				this.speed = 10;
		}, false);
		document.addEventListener('keyup', (event) => {
			if ( event.code == inputMap.pos )
				this.inputStrength.x = 0;
			if ( event.code == inputMap.neg )
				this.inputStrength.y = 0;
			if ( event.code == inputMap.boost )
				this.speed = 5;
		}, false);
	}
}

export { Player };
