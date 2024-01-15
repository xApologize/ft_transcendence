import { EffectComposer } from '/public/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '/public/three/examples/jsm/postprocessing/RenderPass.js';
import { RenderPixelatedPass } from '/public/three/examples/jsm/postprocessing/RenderPixelatedPass.js';
import { BloomPass } from '/public/three/examples/jsm/postprocessing/BloomPass.js';
import { UnrealBloomPass } from '/public/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from '/public/three/examples/jsm/postprocessing/FilmPass.js';
import { OutputPass } from '/public/three/examples/jsm/postprocessing/OutputPass.js';
import { GlitchPass } from '/public/three/examples/jsm/postprocessing/GlitchPass.js';
import { SSAOPass } from '/public/three/examples/jsm/postprocessing/SSAOPass.js';

function createComposer( renderer, scene, camera ) {
	const composer = new EffectComposer( renderer);
	composer.addPass( new RenderPass( scene, camera ) );
	// composer.addPass( new RenderPixelatedPass( 2, scene, camera ) );
	// composer.addPass( new BloomPass( 1, 25, 4, 256 ) );
	composer.addPass( new UnrealBloomPass( 256, 0.1, 0.5, 0.1 ) );
	composer.addPass( new FilmPass( 0.15, false ) );
	// composer.addPass( new GlitchPass( 0 ) );
	// composer.addPass( new SSAOPass( scene, camera ) );
	composer.addPass( new OutputPass() );

	return composer;
}

export { createComposer };
