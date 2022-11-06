import React, { FC } from "react";

interface Props {
	title: string,
	image: string,
	handleClick?: () => void
	color: string,
}

const Section: FC<Props> = ({ title, image, handleClick, color }) => {
	const backgroundStyle = {
		backgroundImage: `url('${image}')`,
	};
	return (
		<div
			className={`w-full min-w-[20rem] max-w-[40rem] mx-auto min-h-[7rem] h-[30%] shadow-2xl rounded-med bg-no-repeat bg-cover bg-right flex justify-start items-start opacity-80 hover:opacity-100 hover:relative hover:z-10`}
			style={backgroundStyle}
		>
			<div
				className={` h-full w-1/4 ${color} text-white flex flex-col justify-center items-center p-4 rounded-med cursor-pointer`}
				onClick={handleClick}
			>
				<h2 className="text-[50%] leading-7 uppercase font-bold">
					{title}
				</h2>
				<div className="flex items-center justify-center w-10 h-10 border-2 rounded-full hover:bg-gray-400/60">
					<i className="fa-solid fa-angle-right"></i>
				</div>
			</div>
		</div>
	);
};

export default Section;
