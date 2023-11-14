import { DynamicObject } from '../systems/DynamicObject.js';
import {
	BoxGeometry,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	Vector3
} from 'three';

let g_movement = 0;
let g_speed = 5;

class Player extends DynamicObject {
	start( position, size ) {
		const g_box = new BoxGeometry( 0.3, 2.4, 2 );
		const m_white = new MeshStandardMaterial({ color: 'white' });
		this.object = new Mesh( g_box, m_white );
		this.object.position.copy( position );

		document.onkeydown = function(e) {
			if ( e.key == "w" )
				g_movement = 1;
			if ( e.key == "s" )
				g_movement = -1;
		}
		document.onkeyup = function(e) {
			if ( e.key == "w" && g_movement > 0 )
				g_movement = 0;
			if ( e.key == "s" && g_movement < 0 )
				g_movement = 0;
		}
	}

	update( dt ) {
		this.object.position.y += g_movement * dt * g_speed;
	}
}

export { Player };
