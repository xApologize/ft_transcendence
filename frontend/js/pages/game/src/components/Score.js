import { StaticObject } from '../systems/StaticObject.js';
import { Layers } from '../systems/Layers.js';
// import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import {
	BoxGeometry,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial
} from 'three';

let scoreTab = [0, 0];
let scoreUI;

class Score {	
	constructor() {
		const container = document.getElementById("contentContainer");

		console.log(container);
		scoreUI = document.createElement('div');
		container.appendChild(scoreUI);
		
		scoreUI.className = 'score';
		
		// scoreUI.innerHTML = `0 : 0`;
		scoreUI.innerHTML = "- Game Start -";
		scoreUI.style.position = 'absolute';
		scoreUI.style.fontSize = "8vw";
		scoreUI.style.color = "white";
		scoreUI.style.width = '100%';
		scoreUI.style.height = '100%';
		scoreUI.style.display = 'flex';
		scoreUI.style.alignItems = 'center';
		scoreUI.style.justifyContent = 'center';

		// const objectCSS = new CSS2DRenderer(element);
		// objectCSS.center.x = 0;
		// objectCSS.center.y = 0;
	}

	static scoreAdd( playerId ) {
		while ( scoreTab.length < playerId )
			scoreTab.push( 0 );
		scoreTab[playerId - 1] += 1;
		scoreUI.innerHTML = scoreTab[0] + " : " + scoreTab[1];

		if (scoreTab[0] >= 6)
			scoreUI.innerHTML = "Player 1 WIN!";
		if (scoreTab[1] >= 6)
			scoreUI.innerHTML = "Player 2 WIN!";
	}
}

export { Score };
