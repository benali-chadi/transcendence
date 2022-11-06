import { motion } from "framer-motion";
import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import Modal from "../common/Modal";

interface Props {
	win: boolean;
	IsPlayer: boolean;
	winner: string | undefined;
}

const GameOverCard: FC<Props> = ({ win, IsPlayer, winner }) => {
	const navigate = useNavigate();

	const handleReturnClick = () => {
		navigate("/");
	};

	return (
		<Modal>
			<div className="absolute top-0 z-40 flex items-center justify-center w-screen h-screen bg-black/80">
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1.5 }}
					transition={{ type: "tween", duration: 0.8 }}
					className="relative flex flex-col justify-center gap-3 bg-white rounded-med p-7"
				>
					{ IsPlayer ?  (	<>
						{win ? (
						<>
							<img
								src={require("../../img/youwin.png")}
								alt="skin1"
								className="w-[15rem] absolute top-[-160px] right-0"
							/>
							<h2 className="text-2xl font-bold text-center">
								You Win
							</h2>
						</>
					) : (
						<>
							<img
								src={require("../../img/youlose.png")}
								alt="skin1"
								className="w-[15rem] absolute top-[-160px] right-0"
							/>
							<h2 className="text-2xl font-bold text-center">
								You Lose
							</h2>
						</>
					)}</>
					):(
						<h2 className="text-2xl font-bold text-center">
							Winner is {winner}
						</h2>
					)}
					<Button
						color="bg-my-yellow self-center"
						handleClick={handleReturnClick}
					>
						<h2 className="text-base font-bold">Return Home</h2>
					</Button>
				</motion.div>
			</div>
		</Modal>
	);
};

export default GameOverCard;
