import { SolidMesh } from './SolidMesh.js';
import { GoalZone } from './GoalZone.js';
import { airHockeyTable, floorDiffuse, floorNormal, glassNormal, spriteCircle, texCube } from '../systems/Loader.js';
import { Renderer } from '../modules/Renderer.js';
import {
	BoxGeometry,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	Object3D,
	PlaneGeometry,
	SphereGeometry,
	Sprite,
	SpriteMaterial,
	Vector2,
	Vector3
} from 'three';
import { ScreenBoard } from './ScreenBoard.js';
import { Updatable } from '../modules/Updatable.js';

class Terrain extends Object3D {
	constructor( size, lineWidth, margin ) {
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
			child.material.depthWrite = true;
			// child.material = new MeshStandardMaterial({
				// 	color: "grey",
				// 	metalness: 0.9,
				// 	roughness: 0.0,
				// 	envMap: texCube,
				// 	normalMap: glassNormal,
				// 	normalScale: new Vector2( .1, .1 )
				// });
			}
		});
		
		this.panel = new ScreenBoard( airHockeyTable.scene.children[2] );
		this.add( this.panel );

		// this.s = new Sprite( new SpriteMaterial( { map:spriteCircle, color:0xffffff} ) )
		// this.s.position.set( 0, 0, 2 );
		// this.s.scale.set( 10, 10, 1 );
		// this.add( this.s );
		// const u = new Updatable( this );

		const dashSphereGeo = new SphereGeometry( 0.1 );
		this.leftDashSpheres = [];
		this.rightDashSpheres = [];
		for (let i = 0; i < 3; i++) {
			this.leftDashSpheres.push( new Mesh( dashSphereGeo, new MeshStandardMaterial( { color: "black", emissive: "white", emissiveIntensity: 0 } ) ) );
			this.leftDashSpheres[i].position.set( -8 + ( i * 0.4 ), 5.2, 0.3 );
			this.add( this.leftDashSpheres[i] )
			this.rightDashSpheres.push( new Mesh( dashSphereGeo, new MeshStandardMaterial( { color: "black", emissive: "white", emissiveIntensity: 0 } ) ) );
			this.rightDashSpheres[i].position.set( 8 - ( i * 0.4 ), 5.2, 0.3 );
			this.add( this.rightDashSpheres[i] )
		}
	}

	// update( dt ) {
	// 	this.s.material.alphaTest += dt * 0.1;
	// }

	delete() {
		this.wallTop.delete();
		this.wallBot.delete();
		this.leftGoalZone.delete();
		this.rightGoalZone.delete();

		this.renderer.delete();
	}
}

export { Terrain };
