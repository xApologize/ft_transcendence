import { Clock } from 'three';

const clock = new Clock();
const updatables = [];

class Loop {
	constructor(camera, scene, renderer) {
		this.start = function() {
			clock.start();
			renderer.setAnimationLoop(() => {
				this.tick();
				renderer.render(scene, camera);
			});
		}
		this.stop = function() {
			clock.stop();
			renderer.setAnimationLoop(null);
		}
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
