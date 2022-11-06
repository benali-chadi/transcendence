
export class ball{
	x : number;
	y : number;
	radius : number;
	velocityX : number;
	velocityY : number;
	speed : number;
	color : string;
	
	constructor(x : number, y : number, radius : number, velocityX : number, velocityY : number, speed : number, color : string){
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.velocityX = velocityX;
		this.velocityY = velocityY;
		this.speed = speed;
		this.color = color;
	}
}