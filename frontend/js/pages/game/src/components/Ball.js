import { DynamicObject } from '../systems/DynamicObject.js';
import {
	Box3,
	MathUtils,
	Mesh,
	MeshStandardMaterial,
	Sphere,
	SphereGeometry,
	Vector3
} from 'three';

class Ball extends DynamicObject {	
	start( terrain ) {
		this.radius = 0.2;
		this.velocity = new Vector3(MathUtils.randFloat( -1, 1 ), MathUtils.randFloat( -0.5, 0.5 ), 0);
		this.speed = 5;
		const g_sphere = new SphereGeometry( this.radius );
		const m_white = new MeshStandardMaterial({ color: 'white' });
		this.object = new Mesh( g_sphere, m_white );
		
		this.object.position.set(MathUtils.randFloat( -4, 4 ), MathUtils.randFloat( -2, 2 ), -2);
		
		this.bb = new Sphere( this.object.position, this.radius );
	
		this.leftBorder = new Box3().setFromObject( terrain.ll );
		this.rightBorder = new Box3().setFromObject( terrain.lr );
		this.topBorder = new Box3().setFromObject( terrain.lt );
		this.bottomBorder = new Box3().setFromObject( terrain.lb );

		this.SetLayers( 0, 1, 2, 3 );
	}

	update( dt ) {
		this.velocity.normalize();
		this.object.position.x += this.velocity.x * this.speed * dt;
		this.object.position.y += this.velocity.y * this.speed * dt;

		if (this.bb.intersectsBox( this.leftBorder ) && this.velocity.x < 0)
			this.velocity.x *= -1;
		if (this.bb.intersectsBox( this.rightBorder ) && this.velocity.x > 0 )
			this.velocity.x *= -1;
		if (this.bb.intersectsBox( this.bottomBorder ) && this.velocity.y < 0 )
			this.velocity.y *= -1;
		if (this.bb.intersectsBox( this.topBorder ) && this.velocity.y > 0 )
			this.velocity.y *= -1;
	}

}

export { Ball };


// function checkCollision(cx, cy, radius, rx, ry, rw, rh) {
// 	let testX = cx;
// 	let testY = cy;

// 	// which edge is closest?
// 	if (cx < rx)         testX = rx;      // test left edge
// 	else if (cx > rx+rw) testX = rx+rw;   // right edge
// 	if (cy < ry)         testY = ry;      // top edge
// 	else if (cy > ry+rh) testY = ry+rh;   // bottom edge

// 	// get distance from closest edges
// 	let distX = cx-testX;
// 	let distY = cy-testY;
// 	let distance = Math.sqrt( (distX*distX) + (distY*distY) );

// 	// if the distance is less than the radius, collision!
// 	if (distance <= radius) {
// 		return true;
// 	}
// 	return false;
// }