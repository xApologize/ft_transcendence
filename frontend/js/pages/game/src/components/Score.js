let scoreTab = [0, 0];

class Score {	
	constructor() {
		this.div = document.createElement('div');
		this.div.id = 'scoreUI';
		this.div.innerHTML = "- Game Start -";

		this.div.style.position = 'absolute';
		this.div.style.fontSize = "4vw";
		this.div.style.color = "white";
		this.div.style.width = '100%';
		this.div.style.height = '100%';
		this.div.style.display = 'flex';
		this.div.style.alignItems = 'center';
		this.div.style.justifyContent = 'center';

		// const objectCSS = new CSS2DRenderer(element);
		// objectCSS.center.x = 0;
		// objectCSS.center.y = 0;
	}

	static scoreAdd( playerId ) {
		const scoreUI = document.getElementById("scoreUI");
		while ( scoreTab.length < playerId )
			scoreTab.push( 0 );
		scoreTab[playerId - 1] += 1;
		if ( !scoreUI )
			return;

		scoreUI.innerHTML = scoreTab[0] + " : " + scoreTab[1];
		if (scoreTab[0] >= 6)
			scoreUI.innerHTML = "Player 1 WIN!";
		if (scoreTab[1] >= 6)
			scoreUI.innerHTML = "Player 2 WIN!";
	}

	reset() {
		scoreTab = [0, 0];
		this.div.innerHTML = "- Game Start -";
	}
}

export { Score };
