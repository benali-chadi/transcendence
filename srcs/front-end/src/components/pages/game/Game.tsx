import React, { FC, ImgHTMLAttributes, useContext, useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom";
import GameOverCard from "../../game/GameOverCard";
import OnevsoneCard from "../../game/OnevsoneCard";
import { userContext, UserState } from "../../helpers/context";
import {Game} from "../../helpers/game"


const GamePage: FC = () => {
	const { gameSocket, currentUser } = useContext<UserState>(userContext);
	const [winner, setWinner] = useState<string>();
	const [over, setOver] = useState<boolean>(false);
	const canvasRef = useRef(null);
	const [IsPlayer, setIsPlayer] = useState<boolean>(false)
	const [width, setWidth] = useState<any>(null);
	const [height, setHeight] = useState<any>(null);
	const aspectRatio = 3 / 2;
	const [sleep, setSleep] = useState(0);
	const [game, setGame] = useState<any>(null);
	const [key, setKey] = useState("");

	const bgColor = useRef("#000");
	const barsColor = useRef("#FFF");
	const ballColor = useRef("#FFF");

	const location = useLocation()
  	const params = new URLSearchParams(location.search)
	const room_ref = useRef(params.get("room"));
	const sleep_ref = useRef(sleep);
	const navigate = useNavigate()

	const myRef : React.RefObject<HTMLDivElement> = useRef(null);

	const drawRect = (ctx:CanvasRenderingContext2D,x:number, y:number, w:number, h:number, color:string) => {
		ctx.fillStyle = color;
		ctx.fillRect(x, y, w, h);
	}

	const drawCircle = (ctx:CanvasRenderingContext2D,x:number, y:number, r:number, color:string) => {
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2, false);
		ctx.closePath();
		ctx.fill();
	}

	const drawText = (ctx:CanvasRenderingContext2D,text:string,x:number, y:number, color:string, h:number) => {
		ctx.fillStyle = color;
		ctx.font = `${h / 8}px fantasy`;
		ctx.fillText(text, x, y);
	}

	const  DrawGame = (canvasRef : CanvasRenderingContext2D, game : Game) => {
		let Width = canvasRef.canvas.width;
		let Height = canvasRef.canvas.height;
		drawRect(canvasRef,	0, 0, Width, Height, bgColor.current);
		drawText(canvasRef,	game.player1.score.toString(), Width /4, Height/5, "#FFF", Height);
		drawText(canvasRef,	game.player2.score.toString(), 3*Width /4, Height/5, "#FFF", Height);
		drawRect(canvasRef,	game.player1.x * Width ,game.player1.y * Height, game.player1.width * Width, game.player1.height * Height, barsColor.current);
		drawRect(canvasRef,	game.player2.x * Width ,game.player2.y * Height, game.player2.width * Width, game.player2.height * Height, barsColor.current);
		drawCircle(canvasRef, game.ball.x * Width, game.ball.y * Height, game.ball.radius * (Width + Height), ballColor.current);
	}

	window.addEventListener('keydown', (e) => {
		if (e.key === "ArrowUp" ) {
			gameSocket?.emit("keypress" , {key: "ArrowUp", room: params.get("room")});
		}
		if (e.key === "ArrowDown") {
			gameSocket?.emit("keypress", {key: "ArrowDown", room: params.get("room")});
		}
	});

	window.addEventListener('keyup', (e) => {
		// if (event.key === "ArrowUp" ) {
		// 	gameSocket?.emit("keypress" , {key: "ArrowUp", room: params.get("room")});
		// }
		// if (event.key === "ArrowDown") {
		// 	gameSocket?.emit("keypress", {key: "ArrowDown", room: params.get("room")});
		// }
	});


	
	useEffect(() : any => {
		const canvas : any =  canvasRef.current;
		const ctx = canvas.getContext('2d');
		
		
		if (gameSocket)
		{
			gameSocket.emit("startGame", {room: params.get("room")}, (data:{game: Game, IsPlayer:boolean}) => {
				if (!data.game){
					navigate("/");
				}else{
					setGame(prev=>{
						return data.game;
					})
					if (data.IsPlayer){
						setIsPlayer(prev => {
							return true;
						})
						setSleep(prev => {
							return 4;
						})
					}
					else
						gameSocket.emit("watchGame", {room:room_ref.current})
					DrawGame(ctx, data.game);
				}				
			});

			gameSocket.on("updateframe", (game : Game) => {
				DrawGame(ctx, game);
				setGame(prev=>{
					return game;
				})
			});

			gameSocket.on("gameOver", (res : any) => {
				setWinner(prev => {
					return res.winner;
				});
				setOver(prev => {
					return true;
				})
			});
			return () => {
				// eslint-disable-next-line
				gameSocket.emit("leftGame", {room: room_ref.current}, (res)=>{
				});
				gameSocket.off("updateframe", (res)=>{});
				gameSocket.off("gameOver", (res)=>{});
				window.removeEventListener("resize", updateDimensions)
			}
		}
		// eslint-disable-next-line
	}, [])
	
	const updateDimensions = () => {
		let width = myRef.current ? myRef.current.clientWidth :
			window.innerWidth * 0.8;
		let height = width / aspectRatio;
		if (myRef.current && myRef.current.clientHeight < height){
			height = myRef.current ? myRef.current.clientHeight :
				window.innerHeight * 0.8;
			width = height * aspectRatio;
		}
		setWidth(width);
		setHeight(height);
	}

	window.addEventListener("resize", updateDimensions);

	useEffect(()=>{
		updateDimensions();
		// eslint-disable-next-line
	}, [myRef])

	const ref  : any= useRef();
	useEffect(()=>{
		if (IsPlayer){
			sleep_ref.current = sleep;
			ref.current  = setInterval(()=>{
				sleep_ref.current--;
				setSleep(sleep_ref.current);
				if (sleep_ref.current === 0)
					clearInterval(ref.current)
			}, (1000));
			return () => {clearInterval(ref.current)}
		}
		// eslint-disable-next-line
	},[IsPlayer])

	// Background
	const bgGreen = "#339966";
	const bgBlue = "#336699";

	const changeToBlack = () => {
		bgColor.current = "#000";
		barsColor.current = "#fff";
		ballColor.current = "#fff";
	}
	const changeToGreen = () => {
		bgColor.current = bgGreen;
		barsColor.current = "#fefff3";
		ballColor.current = "#c6ed2c";
	}
	const changeToBlue = () => {
		bgColor.current = bgBlue;
		barsColor.current = "#7a170a";
		ballColor.current = "#bcc5b5";
	}
	

	return(
		<div className="flex flex-col items-center justify-center h-screen gap-3 px-4 bg-my-lavender md:h-full md:rounded-r-large" >
			{sleep !== 0 && <h1>Game will start in {sleep}</h1>}
				{game && <OnevsoneCard
					game={game}
				/>}
			<div
					className=" w-[90%] md:h-[70%] h-[70%] flex flex-col justify-center items-center gap-2"
					ref={myRef}
				>
				<canvas  width={width} height={height}  style={{border: "black solid 8px"}} ref={canvasRef} ></canvas>
				{over && <GameOverCard win={currentUser.username === winner} IsPlayer={IsPlayer} 
					winner={winner}/>}
    		</div>
			<div className="flex min-h-max gap-8">
				<div className={`w-[10rem] h-[10rem] bg-black rounded-3xl hover:scale-125 cursor-pointer`} onClick={changeToBlack}/>	
				<div className={`w-[10rem] h-[10rem] bg-[#339966] rounded-3xl hover:scale-125 cursor-pointer`} onClick={changeToGreen}/>	
				<div className={`w-[10rem] h-[10rem] bg-[#336699] rounded-3xl hover:scale-125 cursor-pointer`} onClick={changeToBlue}/>	
			</div>
		</div>
	);
};

export default GamePage;