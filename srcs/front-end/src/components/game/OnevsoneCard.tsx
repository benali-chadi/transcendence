import React, { FC, useEffect } from "react";
import { Game } from "../helpers/game";

interface Props {
	game: Game
}

const OnevsoneCard: FC<Props> = ({
	game
}) => {

	useEffect(() => {
		// eslint-disable-next-line
	}, [game])
	return (
		<div
			className={`p-1.5 m-1 flex justify-center gap-[10%] bg-my-yellow rounded-xl shadow-lg w-[90%]`}
		>
			{/* User 1 */}
			<div>
				<div className="min-h-[4rem] min-w-[4rem] rounded-full flex justify-center items-center gap-4">
					{game.player1.avatar && (
						<img
							src={game.player1.avatar}
							alt="avatar"
							className="w-[4rem] h-[4rem] rounded-full"
						/>
					)}
				</div>
				<h2 className="text-lg font-medium ">{game.player1.username}</h2>
			</div>

			{/* Score */}
			<div className="flex flex-col items-center justify-center">
				<h1 className="text-[3rem] font-bold w-max">
					{game.player1.score} - {game.player2.score}
				</h1>
			</div>

			{/* User 2 */}
			<div>
				<div className="min-h-[4rem] min-w-[4rem] rounded-full flex justify-center items-center gap-4">
					{game.player2.avatar && (
						<img
							src={game.player2.avatar}
							alt="avatar"
							className="w-[4rem] h-[4rem] rounded-full"
						/>
					)}
				</div>
				<h2 className="text-lg font-medium ">{game.player2.username}</h2>
			</div>
		</div>
	);
};

export default OnevsoneCard;
