import { StaticObject } from '../systems/StaticObject.js';
import { addSolid } from '../systems/Solid.js';
import { Layers } from '../systems/LayersMap.js';
import {
	BoxGeometry,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial
} from 'three';

class Terrain extends StaticObject {	
	start( size, lineWidth, margin ) {
		const g_terrain = new BoxGeometry(size.x, size.y, 1);
		const g_lineh = new BoxGeometry(size.x - margin * 2, lineWidth, 5);
		const g_linev = new BoxGeometry(lineWidth, size.y - margin * 2, 5);
		const m_black = new MeshBasicMaterial({ color: 'black' });
		const m_white = new MeshStandardMaterial({ color: 'white' });
		this.object = new Mesh(g_terrain, m_black);
		this.linetop = new Mesh(g_lineh, m_white);
		this.linebot = new Mesh(g_lineh, m_white);
		// this.lineright = new Mesh(g_linev, m_white);
		// this.lineleft = new Mesh(g_linev, m_white);
		
		this.object.add( this.linetop, this.linebot/*, this.lineright, this.lineleft*/ );
		
		this.linetop.position.set(0, size.y / 2 - margin - lineWidth / 2, 0);
		this.linebot.position.set(0, -(size.y / 2 - margin - lineWidth / 2), 0);
		// this.lineright.position.set(size.x / 2 - margin - lineWidth / 2, 0, 0);
		// this.lineleft.position.set(-(size.x / 2 - margin - lineWidth / 2), 0, 0);
		
		this.object.position.z = -2;

		this.SetLayers( Layers.Default, Layers.Solid );
		addSolid( this.object );
		// addSolid( this.linetop );
		// addSolid( this.linebot );
	}
}

export { Terrain };
