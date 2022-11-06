import React, { FC } from "react";
import { useOutletContext } from "react-router-dom";
import { outletContext } from "../Profile";

interface Props {
	user1: any,
	user2: any,
	score1: number,
	score2: number,
	result: string;
	handleClick?: (user: any) => void;
}

const MatchCard: FC<Props> = ({ user1, user2, score1, score2, result, handleClick }) => {
	// const { currentUser } = useContext<UserState>(userContext);
	const { profileUser } = useOutletContext<outletContext>();

	const lostBgStyle = "bg-gradient-to-b from-[#EC1B24] to-[#D37C80]";
	const winBgStyle = "bg-gradient-to-b from-[#1FAC49] to-[#72CF8E]";

	return (
		<div
			className={`px-6 py-3 ${
				result === "lost" ? lostBgStyle : winBgStyle
			} flex justify-center gap-[10%] border-t-4 border-my-violet`}
		>
			{/* User 1 */}
			<div
				className="min-h-[4rem] min-w-[4rem] rounded-full flex justify-center items-center gap-4 cursor-pointer"
				onClick={() => {
					if (handleClick) handleClick(profileUser);
				}}
			>
				{user1.avatar && (
					<img
						src={user1.avatar}
						alt="avatar"
						className="w-[4rem] h-[4rem] rounded-full"
					/>
				)}
			</div>

			<div className="flex flex-col items-center justify-center">
				<h1 className="text-[1.7rem] font-bold w-max">
					{score1} - {score2}
				</h1>
			</div>
			{/* Result Part */}
			

			{/* user 2 */}
			<div
				className="min-h-[4rem] min-w-[4rem] rounded-full flex justify-center items-center gap-4 cursor-pointer"
				onClick={() => {
					if (handleClick) handleClick(profileUser);
				}}
			>
				{user2.avatar && (
					<img
						src={user2.avatar}
						alt="avatar"
						className="w-[4rem] h-[4rem] rounded-full"
					/>
				)}
			</div>
		</div>
	);
};

export default MatchCard;
