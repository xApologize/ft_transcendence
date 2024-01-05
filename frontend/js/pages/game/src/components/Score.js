import { digitalFont } from '../systems/Loader.js';
import { Renderer } from '../modules/Renderer.js';
import { World } from '../World.js';
import { Color, Mesh, MeshStandardMaterial, Object3D, ShapeGeometry } from 'three';
import { fetchMatchHistory } from '../../../../api/fetchData.js';

let scoreTab = [0, 0];
const maxScore = 3;

class Score extends Object3D {
	constructor() {
		super();

		const mat = new MeshStandardMaterial( { color: 'Orange' } );
		mat.emissive = new Color( 0xffff00 );
		const mat_shade = new MeshStandardMaterial( { color: 'Brown' } );
		const shape = digitalFont.generateShapes( "88", 1 );
		let geo = new ShapeGeometry( shape );
		this.leftScore = new Mesh( geo, mat );
		this.rightScore = new Mesh( geo, mat );
		this.leftScoreShadow = new Mesh( geo, mat_shade );
		this.leftScoreShadow.receiveShadow = true;
		this.rightScoreShadow = new Mesh( geo, mat_shade );
		this.rightScoreShadow.receiveShadow = true;
		this.add( this.leftScore, this.rightScore );
		this.add( this.leftScoreShadow, this.rightScoreShadow );
		
		this.setText( "00", "00" );

		this.leftScore.position.set( -4, -2, 0.02 );
		this.rightScore.position.set( 1, -2, 0.02 );
		this.leftScoreShadow.position.set( -4, -2, 0.01 );
		this.rightScoreShadow.position.set( 1, -2, 0.01 );
		
		this.renderer = new Renderer( this );
	}
	
	setText( l, r ) {
		const l_shape = digitalFont.generateShapes( l, 1 );
		const l_geo = new ShapeGeometry( l_shape );
		this.leftScore.geometry = l_geo;

		const r_shape = digitalFont.generateShapes( r, 1 );
		const r_geo = new ShapeGeometry( r_shape );
		this.rightScore.geometry = r_geo;
	}

	reset() {
		scoreTab = [0, 0];
		this.setText( "00", "00" );
	}

	increment( playerId ) {
		while ( scoreTab.length < playerId )
			scoreTab.push( 0 );
		scoreTab[playerId - 1] += 1;

		this.setText( (scoreTab[0] < 10 ? "0" : "") + scoreTab[0],  (scoreTab[1] < 10 ? "0" : "") + scoreTab[1] );
		if ( scoreTab[World._instance.match.self.participantId] >= maxScore ) {
			this.tryPostMatch( World._instance.match.self.participantId );
			World._instance.match.endMatch();
		}
	}

	tryPostMatch( winnerId, loserId ) {
		const participants = World._instance.match.participants;
		loserId = winnerId == 0 ? 1 : 0;

		const data = {
			winner: participants[winnerId].participantNickname,
			loser: participants[loserId].participantNickname,
			winner_score: scoreTab[winnerId],
			loser_score: scoreTab[loserId]
		}
		const response = fetchMatchHistory( 'POST', data );
		if ( !response ) {
			console.error( "No response from POST MatchHistory" );
			return;
		}
	}
}

export { Score };
