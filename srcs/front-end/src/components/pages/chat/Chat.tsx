import React, { FC, useContext, useEffect } from "react";
import { useState } from "react";
import Button from "../../common/Button";
import { ChatContext, userContext } from "../../helpers/context";
import { chatAreaVariants, pageVariants } from "../../helpers/variants";
import ChatArea from "./ChatArea";
import ChatUserCard from "./Inbox/ChatUserCard";
import { motion } from "framer-motion";
import { UserState } from "../../helpers/context";
import axios from "axios";
import ChatGroupCard from "./Channel/ChatGroupCard";
import FindChannels from "./Channel/FindChannels";
import CreateChannel from "./Channel/CreateChannel";
import { useNavigate } from "react-router-dom";

const Chat: FC = () => {
	const { isMobile, chatSocket, updatedRelation} =
		useContext<UserState>(userContext);
	const [dms, setDms] = useState([]);

	const [chatUser, setChatUser] = useState<any | null>(null);
	const [roomId, setRoomId] = useState<number>(0);
	const [roomType, setroomType] = useState<string>("");
	const [channels, setChannels] = useState<any>([]);
	const [showCreateChannel, setShowCreateChannel] = useState(false);
	const [showChannels, setShowChannels] = useState(false);
	const [channelUpdated, setcChannelUpdated] = useState(0);
	const navigate = useNavigate();

	const handleClick = (user: any, room_id: number, room_type: string) => {
		setChatUser(null);
		setRoomId(room_id);
		setroomType(room_type);
		setTimeout(() => setChatUser(user), isMobile ? 200 : 700);
	};

	const [toggle, setToggle] = useState(true);

	useEffect((): any => {
		async function getDms() {
			try {
				let { data } = await axios.get(
					`${process.env.REACT_APP_BACKEND_URL}chat/Dm_channels`,
					{ withCredentials: true }
				);
				setDms(data);
				if (chatUser)
				{
					let m = null;
					data.map(e => {
						if (e.member.id === chatUser.id &&
							e.member.IsBlocked !== chatUser.IsBlocked &&
							chatUser.type === "DM")
						{
							m = e.member;
						}
						return e
					})
					if(m !== null)
					{
						setChatUser(prev => {
							return m;
						});
					}
				}
			} catch (e) {
				if (e.response.status === 401) {
					localStorage.clear();
					navigate("/");
				}
			}
		}
		async function getGroupChannels() {
			try {
				let { data } = await axios.get(
					`${process.env.REACT_APP_BACKEND_URL}chat/group_channels`,
					{ withCredentials: true }
				);
				if (chatUser)
				{
					let c = 0;
					data.map(e => {
						if (e.id === chatUser.id)
							c++;
						return e
					})
					if (c === 0 && data.length && chatUser.type !== "DM"){
						setChatUser(prev => {
							return null;
						});
					}
				}
				setChannels(data);
			} catch (e) {
				if (e.response.status === 401) {
					localStorage.clear();
					navigate("/");
				}
			}
		}
		getDms();
		getGroupChannels();
		
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [channelUpdated, updatedRelation]);
	

	useEffect(()=>{
		handleClick(null, 0, "");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	},[updatedRelation])

	useEffect(() =>{
		if (chatSocket)
		{
			chatSocket.on("updateRooms", () =>{
				setcChannelUpdated(prev => {
					return prev + 1;
				})
			})
			return () => {
				chatSocket.off("updateRooms", res => {
				});
			};
		}
	},[chatSocket])

	return (
		<ChatContext.Provider
			value={{
				channels,
				setChannels,
				channelUpdated,
				setcChannelUpdated,
			}}
		>
			<motion.div
				variants={pageVariants}
				initial="initial"
				animate="animate"
				exit="exit"
				className="h-screen md:h-full bg-my-lavender md:rounded-large md:rounded-l-none md:grid md:grid-cols-[1fr_4fr] md:grid-rows-1"
			>
				{!toggle && showCreateChannel && (
					<CreateChannel
						handleCancelClick={() => setShowCreateChannel(false)}
					/>
				)}
				{showChannels && (
					<FindChannels
						handleCancel={() => setShowChannels(false)}
					></FindChannels>
				)}
				<div
					className={isMobile && chatUser ? "hidden" : "chatSideBar"}
				>
					{/* Upper part */}
					<div className="flex flex-col gap-4 py-16 bg-[#F0F4FC] md:bg-my-lavender pr-3 rounded-b-large sticky top-0 min-h-[20rem] max-h-[15rem] md:py-8 z-10 md:pl-3 ">
						{/* Buttons */}
						<div className="flex justify-center gap-10">
							<Button
								color={toggle ? "bg-my-violet" : "bg-white"}
								handleClick={() => setToggle(true)}
							>
								<p
									className={`text-2xl ${
										toggle ? "text-white" : ""
									} capitalize`}
								>
									Inbox
								</p>
							</Button>
							<Button
								color={!toggle ? "bg-my-violet" : "bg-white"}
								handleClick={() => setToggle(false)}
							>
								<p
									className={`text-2xl ${
										!toggle ? "text-white" : ""
									} capitalize`}
								>
									Channels
								</p>
							</Button>
						</div>
						{/* Search area */}
						<div className="flex items-center p-4 m-auto bg-white h-fit rounded-large w-fit">
							<i className="fa-solid fa-magnifying-glass text-[#655E5E] text-xl"></i>
							<input
								type="text"
								className="h-6 max-w-[15rem] p-2 text-xl rounded-large font-Poppins"
								placeholder="Search..."
							/>
						</div>
						{/* Channel Buttons */}
						{!toggle && (
							<div className="flex justify-around">
								<Button
									color="bg-my-yellow"
									handleClick={() => setShowChannels(true)}
								>
									<p className="text-base">all Channels</p>
								</Button>
								<Button
									color="bg-my-yellow"
									handleClick={() =>
										setShowCreateChannel(true)
									}
								>
									<p className="text-base">Create Channel</p>
								</Button>
							</div>
						)}
					</div>
					{/* Users or Channels */}
					<div className="flex flex-col h-full gap-4 px-8 mt-3 overflow-auto scrolling
					min-h-[2rem] max-h-[15rem] md:max-h-[40vh]">
						{toggle ? (
							dms.map((dm: any) => {
								return (
									<ChatUserCard
										key={dm.room_id}
										user={dm.member}
										room_id={dm.room_id}
										handleClick={handleClick}
									/>
								);
							})
						) : channels.length !== 0 ? (
							channels.map((channel: any) => {
								return (
									<ChatGroupCard
										key={channel.id}
										room={channel}
										room_id={channel.id}
										handleClick={handleClick}
										to_join={false}
										type={channel.type}
									/>
								);
							})
						) : (
							<div></div>
						)}
					</div>
					</div>
				<motion.div
					variants={chatAreaVariants}
					animate={chatUser ? "open" : "close"}
					className="h-screen md:p-10 md:h-full"
				>
					<ChatArea
						user={chatUser || {}}
						socket={chatSocket}
						handleClick={() => setChatUser(null)}
						room_id={roomId}
						room_type={roomType}
					/>
				</motion.div>
			</motion.div>
		</ChatContext.Provider>
	);
};

export default Chat;
