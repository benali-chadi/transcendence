import { Player } from "./player.class";


export class GamePair{
	player1: Player;
	player2: Player;
	joined_1: boolean;
	joined_2: boolean;

	constructor(){
		this.player1 = new Player(null, null, null, null);
		this.player2 = new Player(null, null, null, null);
		this.joined_1 = false;
		this.joined_2 = false;
	}
	isGameReady(): Boolean{
		return (this.joined_1 && this.joined_2);
	}

	findPlayer(username:string): GamePair{
		if (this.player1.username == username || this.player2.username == username)
			return this;
		return null
	}
}