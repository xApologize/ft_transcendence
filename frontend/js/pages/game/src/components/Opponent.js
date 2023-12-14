import { Layers } from '../systems/Layers.js';
import { Paddle } from './Paddle.js';
import { Loop } from '../systems/Loop.js';
import {
	Color
} from 'three';

class Opponent extends Paddle {
	constructor( geometry, material, position, socket ) {
		super( geometry, material, position );

		this.isOpponent = true;

		//DEBUG COLOR
		this.material.color = new Color( 0xff0000 );
	}

	networkUpdate( data ) {

	}
}

export { Opponent };
