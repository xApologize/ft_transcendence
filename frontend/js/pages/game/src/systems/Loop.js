import { Clock } from 'three';

const clock = new Clock();
const updatables = [];

let t1 = 0;

class Loop {
	constructor( camera, scene, renderer, composer ) {
		this.start = function() {
			clock.start();
			renderer.setAnimationLoop(() => {
				this.tick();
				// renderer.render(scene, camera);
				composer.render(1);
			});
		}
		this.stop = function() {
			clock.stop();
			renderer.setAnimationLoop(null);
		}

		let worker = new Worker('/js/pages/game/worker.js');
		worker.addEventListener( "message", this.fixedTick, false );
	}

	fixedTick() {

		// console.log('fps =', 1000 / (new Date().getTime() - t1) | 0);
		for( const object of updatables ) {
			if ( typeof object.fixedUpdate === "function" )
				object.fixedUpdate( (new Date().getTime() - t1) / 1000 );
			// else
			// 	console.warn("fixedUpdate() called but undefined!");
		}
		t1 = new Date().getTime();
	}
	
	tick () {
		const delta = clock.getDelta();
		for( const object of updatables ) {
			if ( typeof object.update === "function" )
				object.update( delta );
			else
				console.warn("update() called but undefined!");
		}
	}

	static addUpdatable( object ) { updatables.push(object); }
	static removeUpdatable( object ) { updatables.splice( updatables.indexOf(object), 1 ); }
	static getUpdatable() { return updatables; }
}

export { Loop };
