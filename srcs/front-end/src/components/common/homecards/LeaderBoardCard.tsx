import React, { FC } from "react";

// interface Props {
// 	// result: string;
//     user1: any,
//     user2: any,
//     score1: number,
//     score2: number,
// }

interface Props {
	rank: string;
	username: string;
	avatar: string;
	level: string;
}

const LeaderBoardCard: FC<Props> = ({
	/*user1, user2*/ rank,
	username,
	avatar,
	level,
}) => {
	const perc = Math.ceil((parseFloat((parseFloat(level) % 1).toPrecision(2)) * 100)).toString();;
	return (
		<div className="p-1.5 m-1 gap-3 grid grid-cols-[.5fr_1fr_1fr_1fr] items-center bg-my-yellow rounded-xl shadow-lg w-[90%] overflow-x-auto scrolling overflow-y-hidden min-h-[5rem]">
			{/* User CARD*/}
			<h2 className="text-lg font-bold ">{rank}</h2>
			<div className="min-h-[4rem] min-w-[4rem] rounded-full gap-4">
				{avatar && (
					<img
						src={avatar}
						alt="avatar"
						className="w-[4rem] h-[4rem] rounded-full"
					/>
				)}
			</div>
			<h2 className="text-lg font-medium text-left ">{username}</h2>
			<h2 className="text-lg font-bold text-left ">{"lvl " + Math.floor(parseFloat(level)) + " - " + perc + "%"}</h2>
		</div>
	);
};

export default LeaderBoardCard;
