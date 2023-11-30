import { Updatable } from "../modules/Updatable.js";

const Easing = {
	Linear: 0,
	Quadratic: 1
}

class Tween {
	constructor( from, to, duration, easing ) {
		this.from = from;
		this.origin = from.clone();
		this.to = to;
		this.duration = duration;
		this.easing = easing;
		this.time = 0;
		this.updatable = new Updatable( this );
	}

	update( dt ) {
		this.time += dt;
		if ( this.time > this.duration ) {
			this.time = this.duration;
		}

		console.log( this.time );
		this.from.x = this.origin.x + ( this.to.x - this.origin.x ) * ( this.time / this.duration );
		this.from.y = this.origin.y + ( this.to.y - this.origin.y ) * ( this.time / this.duration );
		this.from.z = this.origin.z + ( this.to.z - this.origin.z ) * ( this.time / this.duration );

		if ( this.time >= this.duration ) {
			this.updatable.delete();
			this.onCompleted();
		}
	}

	onCompleted( callback ) {
		if ( typeof callback == "function" )
			callback();
	}
}

export { Tween };
