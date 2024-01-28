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

		this.lastFixedUpdate = new Date().getTime();
	}

	then ( callback ) {
		this.callback = callback;
	}

	setValue( progress ) {
		this.from.x = this.origin.x + ( this.to.x - this.origin.x ) * progress;
		this.from.y = this.origin.y + ( this.to.y - this.origin.y ) * progress;
		this.from.z = this.origin.z + ( this.to.z - this.origin.z ) * progress;
	}

	update() {
		const lag = (new Date().getTime() - this.lastFixedUpdate) / 1000;

		const updatedTime = this.time + lag;
		if ( this.duration <= 0 || this.duration < updatedTime )
			this.setValue( 1 );
		else
			this.setValue( updatedTime / this.duration );
	}

	fixedUpdate( dt ) {
		this.time += dt;

		if ( this.time >= this.duration ) {
			this.setValue( 1 );
			this.updatable.delete();
			this.onCompleted();
		}

		this.lastFixedUpdate = new Date().getTime();
	}

	onCompleted() {
		if ( typeof this.callback == "function" )
			this.callback();
	}
}

export { Tween };
