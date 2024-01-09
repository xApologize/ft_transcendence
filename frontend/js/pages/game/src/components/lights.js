import { CameraHelper, DirectionalLight, HemisphereLight, Object3D, PointLight, RectAreaLight, SpotLight, Vector3 } from 'three';
import { Renderer } from '../modules/Renderer.js';
import { RectAreaLightHelper } from '/public/three/examples/jsm/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from '/public/three/examples/jsm/lights/RectAreaLightUniformsLib.js';

class Lights extends Object3D {
	constructor() {
		super();
		this.renderer = new Renderer( this );

	// GLOBAL LIGHT
		const ambientLight = new HemisphereLight(
			'Cornsilk',
			'white',
			0.4,
		);
		ambientLight.position.set( 0, 0, 1 );
		this.add( ambientLight );

	// DIRECTIONAL LIGHT
		const dirLight = new DirectionalLight( 'DarkBlue', 10 );
		dirLight.position.set(10, 10, 10);
		dirLight.castShadow = true;
		// dirLight.shadow.bias = -0.00002;
		dirLight.shadow.normalBias = 0.006;
		dirLight.shadow.mapSize.width = 2048; // default is 512
		dirLight.shadow.mapSize.height = 2048; // default is 512

		dirLight.shadow.camera.left = -100;
		dirLight.shadow.camera.right = 100;
		dirLight.shadow.camera.top = 100;
		dirLight.shadow.camera.bottom = -100;
		dirLight.shadow.camera.updateProjectionMatrix();
		this.add( dirLight );

		// DEBUG
		// World._instance.scene.add( new CameraHelper( dirLight.shadow.camera ) );

	// SPOT LIGHT
		const sLight = new SpotLight( 0xffffff, 100, 100, Math.PI / 2 );
		sLight.position.set( 0, 20, 8 );
		const target = new Object3D();
		target.position.set( 0, 30, -4 );
		this.add( target );
		sLight.target = target;
		// sLight.castShadow = true;
		// sLight.shadow.normalBias = 0.01;
		this.add( sLight );

	// RECTAREA LIGHT
		const raLightTop = new RectAreaLight( 0xff00ff, 3, 16.8, 0.2 );
		raLightTop.position.set( 0, 4.9, 0.5 );
		raLightTop.lookAt( 0, 0, 0 );
		this.add( raLightTop );
		// this.add( new RectAreaLightHelper( raLightTop ) );

		const raLightBot = new RectAreaLight( 0xff00ff, 3, 16.8, 0.2 );
		raLightBot.position.set( 0, -4.9, 0.5 );
		raLightBot.lookAt( 0, 0, 0 );
		this.add( raLightBot );
		// this.add( new RectAreaLightHelper( raLightBot ) );

		const raLightLeft = new RectAreaLight( 0xff00ff, 3, 0.2, 9.8 );
		raLightLeft.position.set( -8.4, 0, 0.5 );
		raLightLeft.lookAt( 0, 0, 0 );
		this.add( raLightLeft );
		// this.add( new RectAreaLightHelper( raLightLeft ) );

		const raLightRight = new RectAreaLight( 0xff00ff, 3, 0.2, 9.8 );
		raLightRight.position.set( 8.4, 0, 0.5 );
		raLightRight.lookAt( 0, 0, 0 );
		this.add( raLightRight );
		// this.add( new RectAreaLightHelper( raLightRight ) );

		const raLightScore = new RectAreaLight( 0xffff00, 2, 2, 1.4 );
		raLightScore.position.set( -2.1, -1.3, 0.01 );
		raLightScore.rotateX( Math.PI );
		this.add( raLightScore );
		const raLightScore2 = new RectAreaLight( 0xffff00, 2, 2, 1.4 );
		raLightScore2.position.set( 2.1, -1.3, 0.01 );
		raLightScore2.rotateX( Math.PI );
		this.add( raLightScore2 );
		// this.add( new RectAreaLightHelper( raLightScore ) );

		const ral = new RectAreaLight( 0x5555ff, 2, 20, 10 );
		ral.position.set( 0, 0, -0.1 );
		this.add( ral );

		RectAreaLightUniformsLib.init();
	}
}

export { Lights };
