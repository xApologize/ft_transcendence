import { BasicShadowMap, PCFShadowMap, PCFSoftShadowMap, WebGLRenderer } from 'three';

function createRenderer() {
	const renderer = new WebGLRenderer({ antialias: true });
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = PCFSoftShadowMap;

	return renderer;
}

export { createRenderer };
