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

	then ( callback ) {
		this.callback = callback;
	}

	update( dt ) {
		this.time += dt;
		if ( this.time > this.duration ) {
			this.time = this.duration;
		}

		const ratio = this.duration > 0 ? this.time / this.duration : 1;

		this.from.x = this.origin.x + ( this.to.x - this.origin.x ) * ratio;
		this.from.y = this.origin.y + ( this.to.y - this.origin.y ) * ratio;
		this.from.z = this.origin.z + ( this.to.z - this.origin.z ) * ratio;

		if ( this.time >= this.duration ) {
			this.updatable.delete();
			this.onCompleted();
		}
	}

	onCompleted() {
		if ( typeof this.callback == "function" )
			this.callback();
	}
}

export { Tween };
