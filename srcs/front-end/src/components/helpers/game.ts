
export interface Player{
	x : number;
	y : number;
	width : number;
	height : number;
	score : number;
	username : string;
	avatar:string;
}



export interface ball{
	x : number;
	y : number;
	radius : number;
	velocityX : number;
	velocityY : number;
	speed : number;
	color : string;

}

export interface Game{
	player1 : Player;
	player2 : Player;
	ball : ball;
	room : string;
	viwerCount : number;
}