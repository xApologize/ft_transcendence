import { FontLoader } from '/node_modules/three/examples/jsm/loaders/FontLoader.js';

let Helvetiker;
const loader = new FontLoader();

function loadFonts() {

	
	return new Promise(resolve => {
		loader.load(
			// '/node_modules/three/examples/fonts/helvetiker_regular.typeface.json',
			'/public/fonts/DSEG.json',
			
			function ( font ) {
				Helvetiker = font;
				resolve("resolved");
			}
		);

		// setTimeout(function () {
		// 	resolve("resolved");
		// }, 1000);
	})
}

// let Fonts = {
// 	Font1: Helvetiker
// }

export { loadFonts, Helvetiker };