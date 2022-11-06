import React, { FC } from "react";

interface Props {
	title?: string;
	desc? : string;
	level: string;
	opacity?: string;
	width?:string;
}

const AchievementCard: FC<Props> = ({ title, desc, level, opacity, width }) => {

	return (
		<div
			className={`p-2 ${width} min-w-max  bg-my-violet flex justify-center rounded-lg ${opacity}`}
		>
			<img
				src={`/achievements/${level}.png`}
				alt={level}
				className="w-[4rem] h-[4rem] rounded-full self-center"
			/>
			{/* text align-center */}
			{/* <h3 className="self-start mt-1 text-xl text-my-yellow">{level}</h3> */}
			<div className="">
				<h4 className="text-[1.2rem] text-my-yellow  mt-1 self-start">
					{title}
				</h4>
				<p className="text-xs text-white">
					{desc}
				</p>
			</div>
		</div>
	);
};

export default AchievementCard;