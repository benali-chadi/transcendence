import axios from "axios";
import { motion } from "framer-motion";
import React, { useContext, useState } from "react";
import { useEffect } from "react";
import { FC } from "react";
import Modal from "../../../common/Modal";
import ChatGroupCard from "./ChatGroupCard";
import { cardVariants } from "../../../helpers/variants";
import { ChatContext, ChatState } from "../../../helpers/context";
interface Props {
	handleCancel: () => void;
}

const FindChannels: FC<Props> = ({ handleCancel }) => {
	const [channels, setChannels] = useState([]);
	const [text, setText] = useState("");
	const { channelUpdated } = useContext<ChatState>(ChatContext);
	useEffect(() => {
		async function showGroups() {
			try {
				const { data } = await axios.get(
					`${process.env.REACT_APP_BACKEND_URL}chat/all_channels`,
					{
						withCredentials: true,
					}
				);
				setChannels(data);
			} catch (e) {}
		}
		showGroups();
	}, [channelUpdated]);

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
					{/* channels */}
					<div className="flex flex-wrap justify-center gap-2">
						{channels.length !== 0 &&
							channels
								.filter((channel: any) =>{
										return  !channel.In && channel.name.includes(text)
								})
								.map((channel: any) => {
									return (
										<ChatGroupCard
											key={channel.id}
											room={channel}
											room_id={channel.id}
											to_join={true}
											type={channel.type}
										/>
									);
								})
						}
					</div>
				</motion.div>
			</div>
		</Modal>
	);
};

export default FindChannels;
