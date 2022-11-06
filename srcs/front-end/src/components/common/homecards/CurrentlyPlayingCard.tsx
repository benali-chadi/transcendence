import React, { FC } from "react";

// interface Props {
// 	// result: string;
//     user1: any,
//     user2: any,
//     score1: number,
//     score2: number,
// }

interface Props {
	score1: number;
	score2: number;
	avatar1: string;
	avatar2: string;
	handleclick: () => void;
}

const CurrentlyPlayingCard: FC<Props> = ({
	/*user1, user2*/ score1,
	score2,
	avatar1,
	avatar2,
	handleclick,
}) => {
	return (
		<div
			className={`cursor-pointer p-1.5 m-1 min-h-max flex justify-center gap-[10%] bg-my-yellow rounded-xl shadow-lg w-[90%] hover:bg-my-yellow/80`}
		onClick={handleclick}>
			{/* User 1 */}
			<div>
				<div className="min-h-[4rem] min-w-[4rem] rounded-full flex justify-center items-center gap-4">
					{avatar1 && (
						<img
							src={avatar1}
							alt="avatar"
							className="w-[4rem] h-[4rem] rounded-full"
						/>
					)}
				</div>
			</div>

			{/* Score */}
			<div className="flex flex-col items-center justify-center">
				<h1 className="text-[2rem] font-bold w-max">
					{score1} - {score2}
				</h1>
			</div>

			{/* User 2 */}
			<div>
				<div className="min-h-[4rem] min-w-[4rem] rounded-full flex justify-center items-center gap-4">
					{avatar2 && (
						<img
							src={avatar2}
							alt="avatar"
							className="w-[4rem] h-[4rem] rounded-full"
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default CurrentlyPlayingCard;
