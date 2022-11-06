import { motion } from "framer-motion";
import React, { FC, useState } from "react";
import Modal from "../../../common/Modal";
import { cardVariants } from "../../../helpers/variants";
import FriendCard from "../../Profile/friends/FriendCard";

interface Props {
	handleCancel: () => {};
	members: any;
	ChannelName: string;
}

const ChannelMembers: FC<Props> = ({ handleCancel, members, ChannelName }) => {
	const [text, setText] = useState("");

	return (
		<Modal>
			<div className="absolute top-0 z-40 flex items-center justify-center w-screen h-screen bg-black/80">
				<div
					className="absolute top-0 w-screen h-screen cursor-pointer"
					onClick={handleCancel}
				></div>
				<motion.div
					variants={cardVariants}
					initial="initial"
					animate="animate"
					exit="exit"
					className="h-[50%] min-h-[30rem] w-[50%] min-w-fit overflow-auto bg-my-lavender p-4 flex flex-col rounded-xl shadow-lg relative"
				>
					{/* Close Icon */}
					<div
						className="absolute text-2xl cursor-pointer right-4 hover:opacity-70"
						onClick={handleCancel}
					>
						<i className="fa-solid fa-xmark"></i>
					</div>
					{/* Channel's Name */}
					<div className="py-2 text-center">
						<h1 className="text-2xl font-bold capitalize text-my-blue">
							{ChannelName} Members
						</h1>
					</div>
					{/* Search area */}
					<div className="flex items-center p-4 self-center bg-white h-fit rounded-large w-[70%] mb-4">
						<i className="fa-solid fa-magnifying-glass text-[#655E5E] text-xl"></i>
						<input
							type="text"
							value={text}
							onChange={(e) => setText(e.target.value)}
							className="h-6 max-w-[15rem] w-full p-2 text-xl rounded-large font-Poppins"
							placeholder="Search..."
						/>
					</div>
					{/* Data */}
					<div className="flex flex-wrap justify-center gap-2">
						{members.length !== 0 ? (
							members
								.filter((user: any) =>
									user.member.username.includes(text)
								)
								.map((user: any) => {
									return (
										<FriendCard
											key={user.member.id}
											user={user.member}
											role={user.role}
										/>
									);
								})
						) : (
							<h1>No Data</h1>
						)}
					</div>
				</motion.div>
			</div>
		</Modal>
	);
};

export default ChannelMembers;
