import { BoxGeometry, CameraHelper, FloatType, LinearFilter, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D, OrthographicCamera, PerspectiveCamera, Plane, PlaneGeometry, RGBAFormat, Scene, WebGLRenderTarget } from "three";
import { ScreenBoardMat } from "../custom/ScreenBoardMat.js";
import { Renderer } from "../modules/Renderer.js";
import { Updatable } from "../modules/Updatable.js";
import { World } from "../World.js";

class ScreenBoard extends Object3D {
	constructor() {
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
		this.bufferCam = new OrthographicCamera( 18, -18, -10, 10 );
		this.bufferCam.position.setZ(10);
		this.bufferCam.rotateZ( Math.PI );

		this.plane = new PlaneGeometry( 18, 10 );
		this.bufferPlane = new BoxGeometry( 36, 20, .1 );
		
		this.bufferMat = new ScreenBoardMat();
		this.bufferObject = new Mesh( this.bufferPlane, this.bufferMat );
		this.bufferObject.position.setZ(-0.1);
		this.bufferScene.add( this.bufferObject );

		this.finalMat = new MeshStandardMaterial( {
			map: this.bufB,
			metalness: 0.5,
			roughness: 0.5
		});
		this.quad = new Mesh( this.plane, this.finalMat );
		this.add( this.quad );


		this.quad.castShadow = true;
		this.quad.receiveShadow = true;
	}

	update( dt ) {
		World._instance.renderer.setRenderTarget( this.bufB );
		// World._instance.renderer.clear();
		World._instance.renderer.render( this.bufferScene, this.bufferCam )
		World._instance.renderer.setRenderTarget( null );

		let tmp = this.bufA;
		this.bufA = this.bufB;
		this.bufB = tmp;
		this.quad.material.map = this.bufB.texture;
		this.bufferMat.uniforms["u_frameBuffer"].value = this.bufA.texture;
	}

	delete() {
		this.updatable.delete();
	}
}

export { ScreenBoard };