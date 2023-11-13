import { MonoBehaviour } from '../systems/MonoBehaviour.js';
import {
	BoxGeometry,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	Vector2
} from '../../../node_modules/three/build/three.module.js';

class Player extends MonoBehaviour {
	constructor( position, size ) {
		super();
		this.position = position;
		this.size = size;
	}

	get mesh() {
		const g_box = new BoxGeometry( size );
		const m_white = new MeshStandardMaterial({ color: 'white' });
		return paddle = new Mesh(g_box, m_white);
	}

	update() {

	}
}

export { Player };
