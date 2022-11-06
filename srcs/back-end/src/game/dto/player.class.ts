import { Socket } from "socket.io";


export class Player{
	x : number;
	y : number;
	width : number;
	height : number;
	score : number;
	color : string;
	socket : Socket;
	username : string;
	avatar:string;
	id : number;
	steps: number;

	setParams(x : number, y : number, width : number, height : number, score : number, color : string,
		username:string, avatar:string, id : number){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.score = score;
		this.color = color;
		this.username = username;
		this.avatar = avatar;
		this.id = id;
	}

	constructor(socket:Socket, username: string, avatar:string, id : number){
		this.socket = socket;
		this.username = username;
		this.avatar = avatar;
		this.id = id;
		this.steps = 0;
	}

	IsPlayer(socket : Socket){
		return this.socket.id == socket.id;
	}
}