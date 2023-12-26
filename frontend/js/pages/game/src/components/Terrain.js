import { SolidMesh } from './SolidMesh.js';
import { GoalZone } from './GoalZone.js';
import { airHockeyTable, floorDiffuse, floorNormal } from '../systems/Loader.js';
import { Renderer } from '../modules/Renderer.js';
import {
	BoxGeometry,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	Object3D,
	PlaneGeometry,
	Vector3
} from 'three';

class Terrain extends Object3D {
	constructor(size, lineWidth, margin) {
		super();
		this.renderer = new Renderer( this );

		const g_lineh = new BoxGeometry(size.x - margin * 2, lineWidth, 2);
		const g_linev = new BoxGeometry(lineWidth, size.y - margin * 2, 2);
		const m_white = new MeshStandardMaterial({ color: 'white' });

		this.wallTop = new SolidMesh( g_lineh, m_white, true );
		this.wallTop.position.set(0, (size.y / 2 - margin - lineWidth / 2), 0);
		this.wallBot = new SolidMesh( g_lineh, m_white, true );
		this.wallBot.position.set(0, -(size.y / 2 - margin - lineWidth / 2), 0);
		this.add( this.wallTop, this.wallBot );

		this.leftGoalZone = new GoalZone(g_linev, m_white, 1);
		this.leftGoalZone.position.set(-(size.x / 2 - margin - lineWidth / 2), 0, 0);
		this.rightGoalZone = new GoalZone(g_linev, m_white, 2);
		this.rightGoalZone.position.set(size.x / 2 - margin - lineWidth / 2, 0, 0);

		// const m_grey = new MeshStandardMaterial({ color: 'grey' });
		const m_grey = new MeshStandardMaterial({ map: floorDiffuse, normalMap : floorNormal });
		const g_floor = new PlaneGeometry( 100, 100 );
		this.floor = new Mesh(g_floor, m_grey);
		this.floor.position.set(0, 0, -6);
		this.floor.castShadow = true;
		this.floor.receiveShadow = true;
		this.add( this.floor );

		this.add( airHockeyTable.scene );
		airHockeyTable.scene.rotation.set( Math.PI / 2, 0, 0 );
		airHockeyTable.scene.position.set( 0, 0, -6 );

		airHockeyTable.scene.traverse(function(child) {
			if ( child.type == "Mesh" ) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});

		// this.box = new Mesh( new BoxGeometry( 1, 1, 10 ) );
		// this.box.castShadow = true;
		// this.add( this.box );
	}

	delete() {
		this.wallTop.delete();
		this.wallBot.delete();
		this.leftGoalZone.delete();
		this.rightGoalZone.delete();

		this.renderer.delete();
	}
}

export { Terrain };
