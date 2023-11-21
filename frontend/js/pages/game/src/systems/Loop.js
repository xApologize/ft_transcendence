import { Clock } from 'three';
import { DynamicObject } from "./DynamicObject.js";

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
		for(const object of updatables) {
			if ( object instanceof DynamicObject )
				object.update(delta);
			else
				console.warn("Weird element in Updatable tab !");
		}
	}

	static addUpdatable( object ) { updatables.push(object); }
	static removeUpdatable( object ) { updatables.pop(object); }
}

export { Loop };
