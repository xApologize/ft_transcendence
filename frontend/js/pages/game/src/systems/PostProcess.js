import { EffectComposer } from '/node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '/node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { BloomPass } from '/node_modules/three/examples/jsm/postprocessing/BloomPass.js';
import { UnrealBloomPass } from '/node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from '/node_modules/three/examples/jsm/postprocessing/FilmPass.js';
import { OutputPass } from '/node_modules/three/examples/jsm/postprocessing/OutputPass.js';
import { GlitchPass } from '/node_modules/three/examples/jsm/postprocessing/GlitchPass.js';
import { RenderPixelatedPass } from '/node_modules/three/examples/jsm/postprocessing/RenderPixelatedPass.js';

function createComposer( renderer, scene, camera ) {
	const composer = new EffectComposer( renderer);
	composer.addPass( new RenderPass( scene, camera ) );
	// composer.addPass( new RenderPixelatedPass( 2, scene, camera ) );
	// composer.addPass( new BloomPass( 1, 25, 4, 256 ) );
	composer.addPass( new UnrealBloomPass( 256, 0.5, 0.5, 0.5 ) );
	composer.addPass( new FilmPass( 0.15, false ) );
	// composer.addPass( new GlitchPass( 0 ) );
	composer.addPass( new OutputPass() );

	return composer;
}

export { createComposer };