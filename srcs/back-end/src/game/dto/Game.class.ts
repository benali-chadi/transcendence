import { ball } from "./ball.class";
import { Player } from "./player.class";
import { Socket, Server } from 'socket.io';

interface Viewer {
	socket: string;
	username: string;
}

const	ball_radius: number = 0.01;
const	speed: number = 0.007;
const	velocity: number = 0.004;
const	pHieght: number = 0.3;
const	pWidth: number = 0.025;
const	playerY: number = 0.375;
const	playerX: number = 0.975;

export class Game{
	player1 : Player;
	player2 : Player;
	ball : ball;
	Viewers : Viewer[] = [];
	room : string;
	loop  : any;

	stop :  boolean = false;

	constructor(player1 : Player, player2 : Player){

		this.player1 = new Player(player1.socket, player1.username, player1.avatar, player1.id);
		this.player1.setParams(0, playerY, pWidth , pHieght, 0, "WHITE", player1.username, player1.avatar, player1.id);
		this.player2 = new Player(player2.socket, player2.username, player2.avatar, player2.id);
		this.player2.setParams(playerX,  playerY, pWidth , pHieght, 0, "WHITE", player2.username, player2.avatar, player2.id);
		this.ball = new ball(0.5, 0.5, ball_radius , velocity, 0, speed , "WHITE");
		this.makeName();
	}

	makeName() {
		let result: string = '';
		let characters:string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let charactersLength: number = characters.length;
		for ( let i = 0; i < 10; i++ ) {
		  	result += characters.charAt(Math.floor(Math.random() * 
	 		charactersLength));
	   	}
	   this.room = result;
	}

	IsPlayer(username:string) : Boolean{
		if (this.player1.username == username || this.player2.username == username){
			return true;
		}
		return false;
	}

	handleKeyPress(username: string, key: string){
		if (this.player1.username == username){
			if (key == "ArrowUp"){
				if (this.player1.y + (this.player1.height / 4) - 0.05 > 0){
					this.player1.steps = -0.05
				}
			}
			if (key == "ArrowDown"){
				if (this.player1.y + (3 * this.player2.height / 4 ) + 0.05 < 1){
					this.player1.steps = 0.05
				}
			}
		} else {
			if (key == "ArrowUp"){
				if (this.player2.y + (this.player2.height / 4) - 0.05 > 0){
					this.player2.steps = -0.05
				}
			}
			if (key == "ArrowDown"){
				if (this.player2.y + (3 * this.player2.height / 4) + 0.05 < 1){
					this.player2.steps = 0.05
				}
			}
		}
	}

	getData(): any {
		return {
			player1 :  {
				x : this.player1.x,
				y : this.player1.y,
				width : this.player1.width,
				height : this.player1.height,
				score : this.player1.score,
				color : this.player1.color,
				username : this.player1.username,
				avatar : this.player1.avatar
			},
			player2 : {
				x : this.player2.x,
				y : this.player2.y,
				width : this.player2.width,
				height : this.player2.height,
				score : this.player2.score,
				color : this.player2.color,
				username : this.player2.username,
				avatar : this.player2.avatar
			},
			ball : this.ball,
			room: this.room
		}
	}

	getPlayingData() {
		return {
			id: this.room,
			Player1Score: this.player1.score,
			Player2Score: this.player2.score,
			Player1Avatar: this.player1.avatar,
			Player2Avatar: this.player2.avatar
		}
	}

	PlayersJoinRoom(){
		this.player1.socket.join(this.room);
		this.player2.socket.join(this.room);
	}

	resetBall(){
		this.ball.x = 0.5;
		this.ball.y = 0.5;
		this.ball.velocityX = (this.ball.velocityX > 0) ? -velocity : velocity;
		this.ball.velocityY = 0;
		this.ball.speed = speed;
	}

	collision(b,p){
		
		p.top = p.y;
		p.bottom = p.y + p.height;
		p.left = p.x;
		p.right = p.x + p.width;
		
		b.top = b.y - b.radius;
		b.bottom = b.y + b.radius;
		b.left = b.x - b.radius;
		b.right = b.x + b.radius;
		
		return p.left <= b.right && p.top <= b.bottom && p.right >= b.left && p.bottom >= b.top;
	}

	update(server: Server,  updateMatchs: () => void){
		if (this.player1.steps)
		{
			this.player1.y += this.player1.steps / 2;
			this.player1.steps -= this.player1.steps / 2;
		}
		if (this.player2.steps)
		{
			this.player2.y += this.player2.steps / 2;
			this.player2.steps -= this.player2.steps / 2;
		}
		if( this.ball.x - this.ball.radius < 0 ){
			this.player2.score++;
			this.resetBall();
			updateMatchs();
		}else if( this.ball.x + this.ball.radius > 1){
			this.player1.score++;
			this.resetBall();
			updateMatchs();
		}
		
		this.ball.x += this.ball.velocityX;
		this.ball.y += this.ball.velocityY;
		
		if(this.ball.y - this.ball.radius < 0 || this.ball.y + this.ball.radius > 1){
			this.ball.velocityY = -this.ball.velocityY;
		}

		let player = (this.ball.x + this.ball.radius < 0.5) ? this.player1 : this.player2;
		
		if(this.collision(this.ball,player)){

			let collidePoint = (this.ball.y - (player.y + player.height/2));

			collidePoint = collidePoint / ((player.height)/2);

			let angleRad = (Math.PI/2) * collidePoint;
			

			let direction = (this.ball.x + this.ball.radius < 0.5) ? 1 : -1;
			this.ball.velocityX = direction * this.ball.speed * Math.cos(angleRad);
			this.ball.velocityY = this.ball.speed * Math.sin(angleRad);
			
			this.ball.speed += 0.0001;
		}
	}
	stopGame(){
		this.stop = true;
		clearInterval(this.loop);
	}

	sleep(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	 async start(server: any, callback :  (game : Game) => void, updateMatchs: () => void)  {
		await this.sleep(5000)

		let Frames : number = 1000 / 50;
		this.loop = setInterval(() => {
			if (this.player1.socket && this.player2.socket && this.stop == false){
				this.update(server, updateMatchs);
				if (this.player1.score == 5 || this.player2.score == 5){
					this.stop = true;
					if (this.player1.score > this.player2.score){
						server.to(this.room).emit("gameOver", {winner: this.player1.username});
					}
					else {
						server.to(this.room).emit("gameOver", {winner: this.player2.username});
					}
					clearInterval(this.loop);
					callback(this);
				}
				server.to(this.room).emit("updateframe", this.getData());
			}
		}, Frames);
	}
}