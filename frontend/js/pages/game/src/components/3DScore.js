import { Helvetiker } from '../systems/Fonts.js';
import { Renderer } from '../modules/Renderer.js';
import { Mesh, MeshStandardMaterial, ShapeGeometry } from 'three';
import { Updatable } from '../modules/Updatable.js';

let scoreTab = [0, 0];

class Score3D extends Mesh {
	constructor( font ) {
		const mat = new MeshStandardMaterial( { color: 'Purple' } );
		let geo = new ShapeGeometry();
		super( geo, mat );

		this.setText("0 : 0");

		this.position.set( 0, -3, 1 );
		
		this.renderer = new Renderer( this );

		this.score = 0;
	}
	
	setText( str ) {
		// console.log(str);
		const shape = Helvetiker.generateShapes( str, 1 );
		const geo = new ShapeGeometry( shape );
		
		geo.computeBoundingBox();
		const xMid = - 0.5 * ( geo.boundingBox.max.x - geo.boundingBox.min.x );
		geo.translate( xMid, 0, 0 );
	
		this.geometry = geo;
	}

	reset() {
		scoreTab = [0, 0];
		this.setText( "- Game Start -" );
	}

	add( playerId ) {
		while ( scoreTab.length < playerId )
			scoreTab.push( 0 );
		scoreTab[playerId - 1] += 1;

		this.setText( scoreTab[0] + " : " + scoreTab[1] );
		if (scoreTab[0] >= 6)
			this.setText( "Player 1 WIN!" );
		if (scoreTab[1] >= 6)
			this.setText( "Player 2 WIN!" );
	}
}

export { Score3D };
