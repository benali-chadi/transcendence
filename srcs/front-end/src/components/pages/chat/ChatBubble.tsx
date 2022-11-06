import React, { FC } from "react";

export interface MsgProps {
	text: string;
	date: string;
	me: boolean;
	user?: any;
	room_id: number;
}

export const ChatBubble: FC<MsgProps> = ({ text, date, me, user }) => {
	return (
		<div
			className={`w-full min-h-max flex gap-2 ${me ? "justify-end" : ""}`}
		>
			{/* Avatar Part */}
			{!me && user && (
				<div className="min-h-[3rem] min-w-[3rem] md:w-[2.5rem] md:h-[2.5rem] rounded-full cursor-pointer self-end hover:opacity-70">
					{user.avatar && (
						<img
							src={user.avatar}
							alt="avatar"
							className="w-[3rem] h-[3rem] rounded-full md:w-[2.5rem] md:h-[2.5rem]"
						/>
					)}
				</div>
			)}
			<div
				className={` rounded-med pt-3 pb-5 overflow-auto scrolling px-7 min-w-[10rem] min-h-[5rem] max-w-[50%] relative ${
					me
						? " bg-my-light-violet rounded-br-none text-white"
						: " bg-white rounded-bl-none"
				}`}
			>
				<p className="self-start text-base font-medium text-left break-words">
					{text}
				</p>
				<p className="absolute text-sm font-normal text-gray-400 bottom-1 right-4">
					{date}
				</p>
			</div>
		</div>
	);
};
