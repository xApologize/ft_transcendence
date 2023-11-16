import { Wall } from './Wall.js';
import { GoalZone } from './GoalZone.js';
import {
	BoxGeometry,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	Vector3
} from 'three';

function createArena( size, lineWidth, margin ) {
	const g_lineh = new BoxGeometry(size.x - margin * 2, lineWidth, 2);
	const g_linev = new BoxGeometry(lineWidth, size.y - margin * 2, 2);
	const m_white = new MeshStandardMaterial({ color: 'white' });
	const wallTop = new Wall( g_lineh, m_white );
	wallTop.position.set( 0,  (size.y / 2 - margin - lineWidth / 2), 0 );
	const wallBot = new Wall( g_lineh, m_white );
	wallBot.position.set( 0, -(size.y / 2 - margin - lineWidth / 2), 0 );
	let leftGoalZone = new GoalZone( g_linev, m_white, 1);
	leftGoalZone.position.set( -(size.x / 2 - margin - lineWidth / 2), 0, 0 )
	let rightGoalZone = new GoalZone( g_linev, m_white, 2);
	rightGoalZone.position.set(   size.x / 2 - margin - lineWidth / 2, 0, 0 )

}

export { createArena };
