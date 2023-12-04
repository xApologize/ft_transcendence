import { Layers } from '../systems/Layers.js';
import { Paddle } from './Paddle.js';
import { Loop } from '../systems/Loop.js';
import {
	Color
} from 'three';

class Opponent extends Paddle {
	constructor( geometry, material, position, socket ) {
		super( geometry, material, position );

		this.material.color = new Color( 0xff0000 );

		socket.addEventListener("message", (event) => {
			const msg = JSON.parse( event.data );
			this.position.copy( msg.pos );
			if ( msg.ballInst != undefined ) {
				Loop.getUpdatable().forEach(element => {
					if ( element.isObject3D && element.layers.isEnabled( Layers.Ball ) )
						element.overwriteInst( msg.ballInst );
				});
			}
		});
	}
}

export { Opponent };
