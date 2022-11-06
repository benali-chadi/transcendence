import { motion } from "framer-motion";
import React, { FC } from "react";
import { cardVariants } from "../helpers/variants";

interface Props {
	title: string;
	icon: string;
	MainButton: React.ReactNode;
	SecondaryButton: React.ReactNode;
	children?: JSX.Element | JSX.Element[];
	handleCancel: () => void;
}

const Card: FC<Props> = ({
	title,
	icon,
	MainButton,
	SecondaryButton,
	children,
	handleCancel,
}) => {
	return (
		<div className="absolute top-0 z-50 flex items-center justify-center w-screen h-screen bg-black/80">
			<div
				className="absolute top-0 w-screen h-screen cursor-pointer"
				onClick={handleCancel}
			></div>
			<motion.div
				variants={cardVariants}
				initial="initial"
				animate="animate"
				exit="exit"
				className="scrolling min-h-max w-[20%] min-w-fit overflow-auto bg-white p-4 flex flex-col justify-between rounded-xl shadow-lg"
			>
				{/* Head Part */}
				<div className="flex justify-between">
					<h1 className="text-xl font-bold capitalize">{title}</h1>
					<i className={icon}></i>
				</div>
				{/* Main Part */}
				<div className="relative">{children}</div>
				{/* Buttons */}
				<div className="flex justify-center gap-4">
					{SecondaryButton}
					{MainButton}
				</div>
			</motion.div>
		</div>
	);
};

export default Card;
