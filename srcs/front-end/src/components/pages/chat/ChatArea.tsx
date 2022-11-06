import React, { FC, useContext, useEffect, useRef, useState } from "react";
import { ChatContext, ChatState, userContext, UserState } from "../../helpers/context";
import ChannelSettings from "./Channel/channelSettings/ChannelSettings";
import { ChatBubble, MsgProps } from "./ChatBubble";

const scrollToEnd = (ref) => {
	ref.current.scroll({
		top: ref.current.scrollHeight,
		behavior: "smooth",
	});
};

interface Props {
	user: any;
	socket: any;
	room_id: number;
	room_type: string;
	handleClick: () => void;
}

const ChatArea: FC<Props> = ({ user, handleClick, socket, room_id, room_type }) => {
	const { currentUser} = useContext<UserState>(userContext);
	const [msgs, setMsgs] = useState<MsgProps[]>([]);
	const [text, setText] = useState("");
	const [showSetting, setShowSettings] = useState(false);
	const {setcChannelUpdated } =
		useContext<ChatState>(ChatContext);

	const myRef = useRef(null);
	const executeScroll = () => scrollToEnd(myRef);

	const parsedDate = (dateString: string) => {
		let date = new Date(dateString);
		return (
			date.getHours() +
			":" +
			date.getMinutes() +
			" " +
			date.getFullYear() +
			"-" +
			(date.getMonth() + 1) +
			"-" +
			date.getDate()
		);
	};

	useEffect(() => {
		if (socket && room_id !== 0) {
			socket.emit("joinRoom", room_id, function (body) {
				setMsgs([...body]);
			});

			socket.on("chatToClient", (body: any) => {
				// const msg = body.msg;
				setcChannelUpdated(prev => {
					return prev + 1;
				})
				if (!room_id || body.room_id !== room_id) return;
				const msg = body.msg[0];
				// if (!msg) return;
				// if (!room_id) return;
				if (msgs) setMsgs((prev) => [...prev, msg]);
				else setMsgs([msg]);
			});
		}
		
		return () => {
			socket?.emit("leaveRoom", room_id);
			socket?.off("chatToClient");
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [room_id]);

	useEffect(() => {
		executeScroll();
	}, [msgs]);


	const handleMsgSendClick = async (e?: React.FormEvent<HTMLFormElement>) => {
		if (e) e.preventDefault();
		if (!text.length) return;

		socket.emit("chatToServer", { room_id, content: text }, (res) => {
			window.alert(res.message);
		});

		setText("");
	};

	return (
		<div className="flex flex-col h-screen md:grid md:grid-rows-[70px_5fr_70px] md:h-[70vh] md:shadow-lg md:shadow-gray-400 rounded-med">
			{/* Channel's Settings */}
			{showSetting && (
				<ChannelSettings
					room_id={room_id}
					channelName={user.name}
					room_type={room_type}
					handleCancel={() => setShowSettings(false)}
				/>
			)}

			{/* Upper Area */}
			<div className="flex flex-col gap-4 py-16 px-4 bg-[#F0F4FC] md:bg-my-violet rounded-b-large sticky top-0 max-h-[15rem] md:rounded-t-med md:rounded-b-none md:max-h-max md:p-4 md:px-6 md:flex-row-reverse md:justify-between md:gap-0 md:h-full md:items-center md:static">
				{/* Icons */}
				<div className="flex justify-between md:justify">
					<i
						className="cursor-pointer fa-solid fa-arrow-left md:hidden"
						onClick={handleClick}
					></i>
					{user.In !== undefined && user.role !== "Member" && (
						<i
							className="cursor-pointer fa-solid fa-gear md:text-white md:text-2xl"
							onClick={() => setShowSettings(true)}
						></i>
					)}
				</div>

				{/* User Area */}
				<div className="flex p-4 pb-0 md:p-0">
					<div className="min-h-[3rem] min-w-[3rem] rounded-full flex gap-4 items-center w-full">
						{/* User's Avatar */}
						{user.avatar && (
							<img
								src={user.avatar}
								alt="User avatar"
								className="w-[3rem] h-[3rem] rounded-full"
							/>
						)}
						{/* Channel's Icon */}
						{user.icon && (
							<img
								src={`${process.env.REACT_APP_BACKEND_URL}${user.icon}`}
								alt="Channel icon"
								className="w-[3rem] h-[3rem] rounded-full"
							/>
						)}
						{/* Text Part */}
						<div className="md:text-white">
							<h3 className="text-xl">
								{user.username || user.name}
							</h3>
						</div>
					</div>
				</div>
			</div>

			{/* Chat Bubbles */}
			<div
				className="flex flex-col max-h-full gap-4 p-4 mt-auto overflow-y-auto"
				ref={myRef}
			>
				{msgs &&
					msgs.map((v, i) => (
						<ChatBubble
							text={v.text}
							date={parsedDate(v.date)}
							me={currentUser.id === v.user.id}
							user={v.user}
							room_id={room_id}
							key={i}
						/>
					))}
			</div>

			{/* Typing Area */}
			{!(user.blocked || user.blocker || (user.relation && user.relation !== "friends")) && (
				<form
					className="flex items-center justify-center w-full gap-4 py-4 border-t-4 border-white h-max rounded-b-med bg-my-lavender"
					onSubmit={(e) => {
						handleMsgSendClick(e);
					}}
				>
					<input
						value={text}
						onChange={(e) => setText(e.target.value)}
						className="h-6 w-[70%] min-w-[10rem] p-6 text-xl rounded-large font-Poppins break-words"
						placeholder="Type Something..."
					/>
					<i
						className={`text-2xl cursor-pointer fa-solid fa-paper-plane ${
							text.length
								? "hover:opacity-70 text-my-light-violet"
								: ""
						}`}
						onClick={() => handleMsgSendClick()}
					></i>
				</form>
			)}
		</div>
	);
};

export default ChatArea;
