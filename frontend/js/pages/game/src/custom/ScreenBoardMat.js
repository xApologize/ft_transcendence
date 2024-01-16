import { ShaderMaterial, Vector2 } from "three";

const vertexShader = () => {
	return `
	// varying vec2 texCoord;
	varying vec3 v_position;
	// varying vec3 v_normal;

	uniform vec2 u_planeSize;

	void main() {
		v_position = position;

		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
	}`
}

const fragmentShader = () => {
	return `
	uniform vec2 refPos;
	uniform vec2 u_planeSize;
	uniform sampler2D u_frameBuffer;

	varying vec3 v_position;

	float grid(vec2 fragCoord, float space) {
		vec2 r = round(fragCoord / space) * space;
		vec2 pos = refPos * 1.;
		if ( mod(fragCoord.x + space/2., space) < space * 1. && mod(fragCoord.y + space/2., space) < space * 1. )
			return clamp( 1. - distance(pos, r) * 3., 0., 1. );
		return 0.;
	}

	vec3 pixelate( vec2 fragCoord, float pixSize ) {
		vec2 rounded = round(fragCoord / pixSize) * pixSize;
		// if ( distance(refPos, fragCoord) < .4 )
		// 	return vec3( 1. );
		return texture2D( u_frameBuffer, rounded ).xyz * 0.8;
	}

	void main() {
		vec2 uv = v_position.xy / u_planeSize + .5;

		// vec3 col = texture2D( u_frameBuffer, uv ).xyz * 0.8;
		// col += vec3( grid(v_position.xy, .1) * 2. );

		// gl_FragColor = vec4(col, 1.);

		gl_FragColor = vec4( pixelate( uv, 0.01 ) + grid(v_position.xy, .1), 1. );
		// gl_FragColor = vec4( pixelate( uv, 0.01 ) , 1. );
	}`
}

class ScreenBoardMat extends ShaderMaterial {
	constructor() {
		super( {
			uniforms: {
				time: { value: 1.0 },
				refPos: { value: new Vector2() },
				u_planeSize: { value: new Vector2( 18, 10 ) },
				u_resolution: { value: new Vector2( window.innerWidth, window.innerHeight ) },
				u_frameBuffer: { value: undefined }
			},
			vertexShader: vertexShader(),
			fragmentShader: fragmentShader()
		});
	}
}

export { ScreenBoardMat }