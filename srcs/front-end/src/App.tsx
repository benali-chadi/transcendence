import Navigation from "./components/Navigation";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { userContext } from "./components/helpers/context";
import { AnimatePresence } from "framer-motion";
import { useMediaQuery } from "react-responsive";
import Log from "./components/pages/login/Log";
import Login from "./components/pages/login/Login";
import Home from "./components/pages/Home";
import Chat from "./components/pages/chat/Chat";
import Profile from "./components/pages/Profile/Profile";
import FriendsList from "./components/pages/Profile/friends/FriendsList";
import MatchHistory from "./components/pages/Profile/matchHistory/MatchHistory";
import AchievementsBoard from "./components/pages/Profile/achievements/AchievementsBoard";
import React from "react";
import { io } from "socket.io-client";
import InviteCard from "./components/common/InviteCard";
import GamePage from "./components/pages/game/Game";
import Achievement from "./components/common/Achievement";
import NoRoute from "./components/pages/NoRoute";

const App: React.FC = () => {
	const [currentUser, setCurrentUser] = useState("");
	const [userSocket, setSocket] = useState<any>();
	const [chatSocket, setChatSocket] = useState<any>();
	const [gameSocket, setGameSocket] = useState<any>();
	const [updated, setupdated] = useState(0);
	const [updatedRelation, setUpdated] = useState(0);
	const [showInvite, setShowInvite] = useState(false);
	const [inviteMgs, setInvitemsg] = useState("");
	const [r_user, setRuser] = useState<any>(null)
	const [room_notif, setNotif] = useState<number[]>([]);
	const [achievement, setAchiev] = useState<any>(null)
	const [userStorage, setUserStorage] = useState(null)

	const navigate = useNavigate();
	const isMobile = useMediaQuery({
		query: "(max-width: 767px)",
	});
	useEffect((): any => {
		const u = localStorage.getItem("CurrentUser");
		if (u){
			const socket = io(`${process.env.REACT_APP_BACKEND_URL}user`, {
				query: { user: u },
				withCredentials: true,
			}).connect();
			const socket_chat = io(`${process.env.REACT_APP_BACKEND_URL}chat`, {
				withCredentials: true,
			}).connect();
			const socket_game = io(`${process.env.REACT_APP_BACKEND_URL}game`, {
				query: { user: u },
				withCredentials: true,
			}).connect();
			socket_chat.on("chat_notif", (res) =>{
				setNotif(prev => {
					return [...prev, res.room_id]
				})
			})
			socket.on("client status", () => {
				setupdated((prev) => {
					return prev + 1;
				});
			});
			socket.on("Achievement", (data) =>{
				setAchiev(prev => {
					return data.achievements
				})
				setTimeout(() => {
					setAchiev(prev => {
						return null
					})
				}, 2000);
			})
			socket.on("relation status", (res) => {
				if (res.msg === "friend req"){
					setRuser(prev => {
						return res.user;
					})
					setShowInvite(prev => {
						return true
					})
					setInvitemsg(prev => {
						return "Want to be your friend"
					})
				}
				else{
					setUpdated((prev) => {
						return prev + 1;
					});
				}
			});
			socket_game.on("invitedGame", (data) =>{
				setRuser(prev => {
					return data.user;
				})
				setShowInvite(prev => {
					return true
				})
				setInvitemsg(prev => {
					return "Want to be play with you"
				})
			})
			socket_game.on("acceptedChallenge" ,(data)=>{
				navigate(`/game?room=${data.room}`);
			})
		
			socket_game.on("updatedStatus" ,(data)=>{
				setupdated(prev => {
					return prev + 1;
				})
			})
			socket_game.on("Achievement", (data)=>{
				data.map(e => {
					setAchiev(prev => {
						return e
					})
					return e;
				})
				setTimeout(() => {
					setAchiev(prev => {
						return null
					})
				}, 2000);
			})
			setGameSocket(socket_game);
			setChatSocket(socket_chat);
			setSocket(socket);
			setCurrentUser(JSON.parse(u));
			return () => {
				userSocket.off("client status");
				userSocket.off("relation status");
				userSocket.off("");
				socket_game.off("acceptedChallenge")
				socket_game.off("Achievement");
				socket_game.removeAllListeners();
				socket_game.disconnect();
				socket_chat.removeAllListeners();
				socket_chat.disconnect();
				userSocket.removeAllListeners();
				userSocket.disconnect();		
			};
		}
		// eslint-disable-next-line
	}, []);

	return (
		<userContext.Provider
			value={{
				currentUser,
				setCurrentUser,
				isMobile,
				userSocket,
				updated,
				updatedRelation,
				chatSocket,
				gameSocket,
				room_notif,
				setNotif,
				setUpdated,
				setUserStorage
			}}
		>
			<div className="h-screen text-4xl font-bold text-center App">
				{showInvite && (
					<InviteCard
						handleCancel={() => {setShowInvite(false)}}
						opUser={r_user}
						msg={inviteMgs}
					/>
				)}
				{achievement && <Achievement
					title={achievement.title}
                	desc={achievement.desc}
                	level="level8"
					handleCancel={() => {setAchiev(null)}}
				/>}
				<AnimatePresence exitBeforeEnter>
					<Routes>
						<Route
							path="/"
							element={
								<ProtectedRoute>
									<Navigation />
								</ProtectedRoute>
							}
						>
							<Route path="/" element={<Home />} />
							<Route
								path="profile/:username"
								element={<Profile />}
							>
								<Route
									path="friends"
									element={<FriendsList />}
								/>
								<Route
									path="achievements"
									element={<AchievementsBoard />}
								/>
								<Route
									path="matchHistory"
									element={<MatchHistory />}
								/>
							</Route>
							<Route path="game" element={<GamePage />} />
							{/* <Route
								path="gamewatch/:gameid"
								element={<GameWatch />}
							/> */}
							<Route path="chat" element={<Chat />} />
						</Route>
						<Route
							path="/login"
							element={
								<ProtectedRoute redirectPath="/">
									<Login />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/Test"
							element={
								<ProtectedRoute redirectPath="/">
									<Log />
								</ProtectedRoute>
							}
						/>
						<Route path="*"
							element={
								<NoRoute />
							}
						/>
					</Routes>
				</AnimatePresence>
			</div>
		</userContext.Provider>
	);
};

export default App;
