import { AmbientLight, BoxGeometry, CameraHelper, Color, FloatType, LinearFilter, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, Object3D, OrthographicCamera, PerspectiveCamera, Plane, PlaneGeometry, RGBAFormat, Scene, WebGLRenderTarget } from "three";
import { ScreenBoardMat } from "../custom/ScreenBoardMat.js";
import { Updatable } from "../modules/Updatable.js";
import { World } from "../World.js";
import { Layers } from "../systems/Layers.js";
import { floorDiffuse, texCube } from "../systems/Loader.js";

class ScreenBoard extends Object3D {
	constructor( board ) {
		super();

		this.updatable = new Updatable( this );
		
		this.bufA = new WebGLRenderTarget(1800, 1000, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			format: RGBAFormat,
			type: FloatType,
			stencilBuffer: false
		});
		this.bufB = new WebGLRenderTarget(1800, 1000, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			format: RGBAFormat,
			type: FloatType,
			stencilBuffer: false
		});

		this.bufferScene = new Scene();
		this.bufferCam = new OrthographicCamera( 9, -9, -5, 5 );
		this.bufferCam.position.setZ(10);
		this.bufferCam.rotateZ( Math.PI );
		this.bufferCam.layers.set( Layers.Buffer );

		this.plane = new PlaneGeometry( 18, 10 );
		this.bufferPlane = new BoxGeometry( 18, 10, .1 );
		
		this.bufferMat = new ScreenBoardMat();
		this.bufferObject = new Mesh( this.bufferPlane, this.bufferMat );
		this.bufferObject.position.setZ(-0.1);
		this.add( this.bufferObject );
		this.bufferObject.layers.set( Layers.Buffer );

		this.finalMat = new MeshStandardMaterial( {
			metalness: 0.4,
			roughness: 0.5,
			depthWrite: true
		});
		this.quad = new Mesh( this.plane, this.finalMat );
		this.add( this.quad );
		// this.quad = board;
		// this.quad.castShadow = false;
		// this.quad.receiveShadow = false;
		// this.quad.material = this.finalMat;

		const light = new AmbientLight( 0xffffff, 2 );
		this.add( light );
		light.layers.set( Layers.Buffer );
	}

	update( dt ) {
		World._instance.renderer.setRenderTarget( this.bufB );
		World._instance.renderer.clear();
		World._instance.renderer.render( World._instance.scene, this.bufferCam )
		World._instance.renderer.setRenderTarget( null );

		let tmp = this.bufA;
		this.bufA = this.bufB;
		this.bufB = tmp;
		this.quad.material.map = this.bufB.texture;
		this.quad.material.map = this.bufB.texture;
		// this.quad.material.emissive = new Color( 0xffffff );
		// this.quad.material.emissiveMap = this.bufB.texture;
		// this.quad.material.emissiveIntensity = .2;
		this.bufferMat.uniforms["u_frameBuffer"].value = this.bufA.texture;
	}

	delete() {
		this.updatable.delete();
	}
}

export { ScreenBoard };