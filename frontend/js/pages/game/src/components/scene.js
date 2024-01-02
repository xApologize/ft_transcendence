import { Color, Scene } from 'three';
import { texCube } from '../systems/Loader.js';

function createScene() {
  const scene = new Scene();

//   scene.background = new Color('black');
  scene.background = texCube;

  return scene;
}

export { createScene };
