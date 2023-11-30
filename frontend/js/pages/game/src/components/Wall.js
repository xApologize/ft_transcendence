import { Layers } from '../systems/Layers.js';
import { Renderer } from '../modules/Renderer.js';
import { Collider } from '../modules/Collider.js';
import { Mesh } from 'three';

class Wall extends Mesh {
	constructor( geometry, material ) {
		super( geometry, material );
		this.collider = new Collider( this );
		this.renderer = new Renderer( this );
		this.renderer.setLayers( Layers.Solid );
	}

	delete() {
		this.collider.delete();
		this.renderer.delete();
	}
}

export { Wall };
