import { CapsuleGeometry, MeshStandardMaterial, Vector3, WebGLRenderer } from 'three';
import { World } from '../World.js';
import { Player } from '../components/Player.js';
import { Opponent } from '../components/Opponent.js';

let world;

class Match {
	constructor( path, xpos, goalZone, opponentGoalZone ) {
		world = World._instance;

		world.currentGameState = "connecting";
		
		this.socket = new WebSocket('wss://' + window.location.host + path);
		
		this.player = new Player( new CapsuleGeometry( 0.2, 2.4 ), new MeshStandardMaterial(), new Vector3(  xpos, 0, 0 ) );
		this.player.position.setZ(-1);
		goalZone.paddle = this.player;
		
		this.opponent = new Opponent( new CapsuleGeometry( 0.2, 2.4 ), new MeshStandardMaterial(), new Vector3( -xpos, 0, 0 ) );
		this.opponent.position.setZ(-1);
		opponentGoalZone.paddle = this.opponent;
		
		this.initMatch();
		document.getElementById('lfp').classList.add("d-none");

	}

	initMatch() {
		// console.log("-- Starting Match --");
		world.currentGameState = "inMatch";

		world.balls.hide();
		world.score.reset();
		this.player.position.setZ(0)
		this.opponent.position.setZ(0)
		world.balls.renderer.setEnabled(true);
		world.balls.updatable.setEnabled(true);
		world.camera.viewTable( 1, function() {
			if ( world.currentGameState === "inMatch" ) {
				world.balls.init();
			}
		});
	
		this.socket.addEventListener("message", (event) => {
			if ( event.data === "Closing" ) {
				console.log("Opponent Ragequited");
				this.endMatch();
				return;
			}
			const msg = JSON.parse( event.data );
			if ( this.opponent != undefined && msg.pos != undefined )
				this.opponent.position.copy( msg.pos );
			if ( msg.ballInst != undefined ) {
				if ( msg.scored == true ) {
					if ( world.terrain.leftGoalZone.paddle.isOpponent )
						world.terrain.leftGoalZone.goal( msg.ballInst );
					if ( world.terrain.rightGoalZone.paddle.isOpponent )
						world.terrain.rightGoalZone.goal( msg.ballInst );
				}
				else
					world.balls.overwriteInst( msg.ballInst );
			}
		})
		// TBD via backend
		window.addEventListener("beforeunload", (event) => {
			this.socket.send("Closing");
			this.endMatch();
		})
		window.addEventListener("popstate", (event) => {
			this.socket.send("Closing");
			this.endMatch();
		})
	}

	endMatch() {
		world.camera.viewLarge( 1 , function() {
			document.getElementById('ui').classList.remove("d-none");
		} );
		if ( this.player != undefined )
			this.player.delete();
		this.player = undefined;
		if ( this.opponent != undefined )
			this.opponent.delete();
		this.opponent = undefined;
		world.balls.updatable.setEnabled(false);
		world.balls.renderer.setEnabled(false);
	
		if ( this.socket != undefined)
			this.socket.close();
		world.currentGameState = "inMenu";
	}
}

export { Match };
