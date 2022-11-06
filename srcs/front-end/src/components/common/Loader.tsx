import { motion } from "framer-motion";
import React, { FC, useRef } from "react";

import waitingRocket from "../../img/waitingrocket.png";
import waitingCloud from "../../img/waitingcloud.png";

const Loader: FC = () => {
	const MyRef = useRef<HTMLDivElement>(null);

	const RocketVariants = {
		bounce: {
			x: [MyRef.current ? MyRef.current.clientWidth + 100 : 1000, -500],
			y: [80, -80],
			transition: {
				x: {
					repeat: Infinity,
					duration: 4,
				},
				y: {
					yoyo: Infinity,
					type: "tween",
					duration: 0.8,
				},
			},
		},
	};
	const CloudVariants = {
		bounce: {
			y: [20, -20],
			transition: {
				y: {
					yoyo: Infinity,
					type: "tween",
					duration: 0.8,
				},
			},
		},
	};

	return (
		<div className="flex flex-col justify-center w-full h-full overflow-hidden bg-gradient-to-b from-sky-300 to-sky-50">
			<div ref={MyRef} className="relative">
				<motion.div
					variants={CloudVariants}
					animate="bounce"
					className="absolute top-[20%] left-[30%]"
				>
					<img
						src={waitingCloud}
						alt="waiting cloud"
						className="w-[10rem]"
					/>
				</motion.div>
				<motion.div
					variants={CloudVariants}
					animate="bounce"
					className="absolute top-[10%] left-[70%]"
				>
					<img
						src={waitingCloud}
						alt="waiting cloud"
						className="w-[10rem]"
					/>
				</motion.div>
				<motion.div
					variants={CloudVariants}
					animate="bounce"
					className="absolute top-[20%] left-[10%]"
				>
					<img
						src={waitingCloud}
						alt="waiting cloud"
						className="w-[7rem]"
					/>
				</motion.div>
				<motion.div
					variants={RocketVariants}
					animate="bounce"
					className="w-full h-full"
				>
					<img src={waitingRocket} alt="waiting rocket" />
				</motion.div>
				<motion.div
					variants={CloudVariants}
					animate="bounce"
					className="absolute top-[30%] left-[50%]"
				>
					<img
						src={waitingCloud}
						alt="waiting cloud"
						className="w-[15rem]"
					/>
				</motion.div>
			</div>
		</div>
	);
};

export default Loader;
