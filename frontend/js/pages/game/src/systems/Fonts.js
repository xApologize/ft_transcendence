import { FontLoader } from '/public/three/examples/jsm/loaders/FontLoader.js';

let DigitalFont;
const loader = new FontLoader();

function loadFonts() {

	
	return new Promise(resolve => {
		loader.load(
			'/public/fonts/DSEG.json',
			
			function ( font ) {
				DigitalFont = font;
				resolve("resolved");
			}
		);
	})
}

export { loadFonts, DigitalFont };