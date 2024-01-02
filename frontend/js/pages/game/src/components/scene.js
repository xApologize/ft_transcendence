import { Color, Fog, Scene } from 'three';
import { texCube } from '../systems/Loader.js';

function createScene() {
  const scene = new Scene();

//   scene.background = new Color('black');
  scene.background = texCube;
  scene.fog = new Fog( 0x020202, 30, 80 );

  return scene;
}

export { createScene };
