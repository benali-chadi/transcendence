import React, { FC, useEffect } from "react";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import matchHistory from "../../../../img/history.png";
import MatchCard from "./MatchCard";
import { outletContext } from "../Profile";
import axios from "axios";

const MatchHistory: FC = () => {
	const navigate = useNavigate();
	const [filter, setFilter] = useState("all");
	const { username } = useOutletContext<outletContext>();
	const [matchs , setMatchs] = useState<any[]>([]);

	const handleClick = () => {
		navigate(`/profile/${username}`);
	};

	const getMatchs = async () =>{
		try{
			let {data} = await axios.get(`${process.env.REACT_APP_BACKEND_URL}game/Matchs/${username}`, {withCredentials: true})
			setMatchs(data);
		}catch(e){

		}
	}
	useEffect(() =>{
		getMatchs()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<div className="absolute inset-0 z-30 w-full h-screen px-6 py-20 overflow-auto bg-my-blue md:relative md:z-0 md:h-full scrolling">
			{/* Back Button */}
			<i
				className="absolute text-white cursor-pointer left-5 top-15 fa-solid fa-arrow-left md:hidden"
				onClick={handleClick}
			></i>
			{/* Title */}
			<div className="flex items-center justify-center py-8 md:gap-4">
				<img
					src={matchHistory}
					alt="ping-pong racket"
					className=" md:w-[15rem] md:h-[15rem] h-[10rem] w-[10rem]"
				/>
				<h2 className="text-2xl font-extrabold md:text-4xl text-my-yellow">
					Match History
				</h2>
			</div>
			{/* Match History Table */}
			<div className=" scrolling m-auto min-w-fit w-[80%] overflow-auto rounded-b-med">
				{/* Tabs */}
				<div className="flex">
					<h2
						className={`w-full py-4 text-2xl text-white ${
							filter === "all"
								? "bg-my-violet"
								: "bg-my-light-violet"
						} rounded-t-med cursor-pointer`}
						onClick={() => setFilter("all")}
					>
						All
					</h2>
					<h2
						className={`w-full py-4 text-2xl text-white ${
							filter === "wins"
								? "bg-my-violet"
								: "bg-my-light-violet"
						} bg-my-violet rounded-t-med cursor-pointer`}
						onClick={() => setFilter("wins")}
					>
						Wins
					</h2>
					<h2
						className={`w-full py-4 text-2xl text-white ${
							filter === "loses"
								? "bg-my-violet"
								: "bg-my-light-violet"
						} bg-my-violet rounded-t-med cursor-pointer`}
						onClick={() => setFilter("loses")}
					>
						Loses
					</h2>
				</div>
				{/* Matches */}
				<div className="w-full md:max-h-[35vh] overflow-auto scrolling">{
					matchs.length !== 0 &&
					matchs
					.filter((match) => {
						if (filter === "wins")
							return match.IsWinner
						else if (filter === "loses")
							return !match.IsWinner
						else
							return true;
					})
					.map(match => {
						return <MatchCard 
						key={match.id} 
						user1={match.winner} 
						user2={match.loser}
						score1={match.winnerScore}
						score2={match.loserScore}
						result={match.IsWinner? "won" : "lost"}/>
					})
				}
				</div>
			</div>
		</div>
	);
};

export default MatchHistory;
