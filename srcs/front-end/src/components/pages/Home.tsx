import React, { FC, useContext, useEffect, useState } from "react";
import List from "../common/List";
import UserCard from "../common/UserCard";
import inviteImage from "../../img/invite.png";
import randomImage from "../../img/random.png";
import { userContext, UserState } from "../helpers/context";
import { motion } from "framer-motion";
import { pageVariants } from "../helpers/variants";
import { useNavigate } from "react-router-dom";
import CurrentlyPlayingCard from "../common/homecards/CurrentlyPlayingCard";
import LeaderBoardCard from "../common/homecards/LeaderBoardCard";
import UpdateUser from "./login/UpdateUser";
import Button from "../common/Button";
import InviteGame from "../common/inviteGame";
import WaitGame from "../common/WaitGame";
import axios from "axios";
import Achievement from "../common/Achievement";


interface currentMatchDto {
	id: string;
	Player1Score: number;
	Player2Score: number;
	Player1Avatar: string;
	Player2Avatar: string;
}

const Home: FC = () => {
	// const [currentUser, setUser] = useState<any>(null);
	const { currentUser, setCurrentUser, gameSocket, setUserStorage } = useContext<UserState>(userContext);
	// useRef to store socket
	const [user, setUser] = useState<any>(null)
	const [toggle, setToggle] = useState(false);
	const [currentMatch, setCurrentMatch] = useState<currentMatchDto[]>([]);
	const [showUpdateUser, setShowUpdateUser] = useState(false);
	const [showInvite, setShowInvite] = useState(false);
	const [subscribed, setsubscribed] = useState(false);
	const [ranks, setRanks] = useState<any[]>([])
	const [showAchiev, setshowAchiev] = useState(false);

	const navigate = useNavigate();

	const getRanks = async () =>{
		try{
			let {data} = await axios.get(`${process.env.REACT_APP_BACKEND_URL}game/ranking`,
			{withCredentials: true});

			setRanks(data);
		}catch(e){
			localStorage.clear();
			navigate("/login");
		}
	}

	const getMe = async () =>{
		try{
			let {data} = await axios.get(`${process.env.REACT_APP_BACKEND_URL}user/me`,
			{withCredentials:true});

			setUser(data);
			setUserStorage(data);
		}catch(e){
			localStorage.clear();
			navigate("/login");
		}
	}

	// const navigate = useNavigate();
	useEffect(() => {
		getRanks();
		getMe();
		
		const showUpdateProfile = () => {
			setshowAchiev(currentUser.first_time);
			setTimeout(() => {
				setshowAchiev(false);
				setShowUpdateUser(currentUser.first_time);
			}, 2000);
		};
		if(gameSocket){
			gameSocket.emit("currentMatch", (data: any)=>{
				setCurrentMatch(prev => {
					return data;
				})
			})
			gameSocket.on("currentMatch", (data: any) =>{
				setCurrentMatch(prev => {
					return data;
				});
			})
		}
		showUpdateProfile();
		// eslint-disable-next-line
	}, [gameSocket]);

	useEffect(()=>{
        gameSocket?.on("GameReady", (data)=>{
            navigate(`/game?room=${data.room}`)
        })
		// eslint-disable-next-line
    },[gameSocket])

	return (
		<motion.div
			variants={pageVariants}
			initial="initial"
			animate="animate"
			exit="exit"
			className="h-screen bg-white md:h-[80vh] md:rounded-large md:rounded-l-none md:grid md:grid-cols-5 md:grid-rows-1 "
		>
			{showUpdateUser && (
				<UpdateUser
					path="/"
					setShowUpdateUser={setShowUpdateUser}
					handleCancelClick={() => {
						setShowUpdateUser(!showUpdateUser);
						setCurrentUser({ ...currentUser, first_time: false });
						localStorage.clear();
						localStorage.setItem(
							"CurrentUser",
							JSON.stringify({
								...currentUser,
								first_time: false,
							})
						);
					}}
				/>
			)}
			{
				showAchiev && <Achievement
					title="Novice"
                	desc="Welcome to our website"
                	level="level8"
					handleCancel={() => {setshowAchiev(false)}}
				/>
			}
			{subscribed && <WaitGame cancel={()=>{setsubscribed(false);}}/>}
			{	showInvite && <InviteGame handleCancel={()=>{setShowInvite(false)}}/>}
			{/* Game System */}
			<div
				className="top-0 p-8 overflow-auto bg-gradient-to-br from-my-blue to-my-lavender scrolling h-3/5 rounded-b-large md:col-span-3 md:h-full md:justify-center md:rounded-large md:rounded-l-none "
				// style={backgroundStyle}
			>
				{/* Headers */}
				<div className="sticky flex flex-col mb-3 text-center top-5 left-3 ">
					<h1 className="text-6xl font-extrabold text-my-yellow">
						PONG
					</h1>
					<h2 className="font-bold text-my-yellow">Create a Game</h2>
				</div>
				{/* Sections */}
				<div className="flex flex-col justify-center items-center h-full gap-[5.5rem] md:gap-[10rem] ">
					<Button
						color="bg-my-yellow py-16 shadow-lg border-b-4 border-black"
						handleClick={() => {
							setShowInvite(true)
						}}
					>
						<div className="relative grid grid-cols-[1fr_.5fr] w-[20rem] md:w-[25rem]">
							<h2 className="text-black justify-self-start">
								Invite Friend
							</h2>
							<img
								src={inviteImage}
								alt="invite"
								className="md:h-[15rem] h-[12ewm] w-[12rem] md:w-[15rem] absolute right-[-10%] bottom-[-15px]"
							/>
						</div>
					</Button>
					<Button
						color="bg-red-600 py-16 shadow-lg border-b-4 border-black"
						handleClick={() => {
							gameSocket?.emit("subscribeToQueue", (res)=>{
								if (res.message === "waiting"){
									setsubscribed(prev =>{
										return true;
									})
								}
							})
						}}
					>
						<div className="relative grid w-[20rem] md:w-[25rem] grid-cols-[1fr_.5fr]" >
							<h2 className="text-center text-white justify-self-center">
								Random
							</h2>
							<img
								src={randomImage}
								alt="invite"
								className="md:h-[15rem] h-[12ewm] w-[12rem] md:w-[15rem] absolute right-[-10%] bottom-[-15px]"
							/>
						</div>
					</Button>
				</div>
			</div>
			{/* The Right\bottom Side */}
			<div className="flex flex-col gap-8 p-8 overflow-auto md:col-span-2 scrolling">
				{/* User */}
				<div className="sticky top-0 z-10 hidden w-full bg-white h-fit md:block">
					{user && <UserCard user={user} path="/" />}
				</div>
				{/* Lists */}
				<div>
					{/* Toggle */}
					<div className="grid grid-cols-2">
						<div
							className={`flex flex-col gap-1 p-4 ${
								!toggle
									? "bg-my-violet"
									: "bg-my-violet/80 hover:opacity-80"
							}  px-2 rounded-t-med cursor-pointer text-center`}
							onClick={() => setToggle(false)}
						>
							<i
								className={`fa-solid fa-crown text-my-yellow self-center`}
							></i>
							<h2 className="text-base font-bold text-white uppercase lg:text-xl ">
								leaderboard
							</h2>
						</div>
						<div
							className={`flex flex-col gap-1 p-4 ${
								toggle
									? "bg-my-violet"
									: "bg-my-violet/80 hover:opacity-80"
							} px-7 rounded-t-med cursor-pointer text-center`}
							onClick={() => setToggle(true)}
						>
							<i
								className={`fa-solid fa-table-tennis-paddle-ball text-my-yellow self-center`}
							></i>
							<h2 className="text-base font-bold text-white uppercase lg:text-xl ">
								Currently Playing
							</h2>
						</div>
					</div>
					{/* Leaderboard */}
					{!toggle && (
						<List>
							<>
								{
									ranks.length !==0 && 
									ranks.map((ranky, index) =>{
										return <LeaderBoardCard
										key={ranky.id}
										rank={(index+1).toString()}
										username={ranky.username}
										avatar={ranky.avatar}
										level={ranky._level.toPrecision(5)}
										/>
									}) }
							</>
						</List>
					)}
					{/* Currently playing */}
					{toggle && (
						<List>
							<>
								{currentMatch.map((match, index) => {
									return (
										<CurrentlyPlayingCard
											key={match.id}
											score1={match.Player1Score}
											score2={match.Player2Score}
											avatar1={match.Player1Avatar}
											avatar2={match.Player2Avatar}
											handleclick={()=>{
												gameSocket?.emit("watchGame", {room: match.id}, (res)=>{
													if (res)
														navigate(`/game?room=${match.id}`)
												})
											}}
										/>
									);
								})}
							</>
						</List>
					)}
				</div>
			</div>
		</motion.div>
	);
};

export default Home;
