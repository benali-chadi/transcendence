import React, { FC, useContext, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
// @ts-ignore
import { threeDotsVariants } from "../../../helpers/variants";
import { useNavigate } from "react-router-dom";
import { userContext, UserState } from "../../../helpers/context";
import axios from "axios";
import HandleBlock from "../../../common/HandleBlock";

interface Props {
	user: any;
	room_id: number;
	handleClick: (user: any, room_id: number, room_type: string) => void;
}

const ChatUserCard: FC<Props> = ({ user,  handleClick = () => {}, room_id }) => {
	const { userSocket, updated, updatedRelation , room_notif ,setNotif ,gameSocket} =
		useContext<UserState>(userContext);
	const [showDropDown, setShowDropdown] = useState(false);
	const navigate = useNavigate();
	const [_user, setUser] = useState(user);

	const [blocked, setBlocked] = useState(false);
	const [blocker, setBlocker] = useState(false);
	const [friends, setFriends] = useState(true);
	const [showYouSure, setYouSure] = useState(false);
	const [notif, setnotif] = useState(false);

	const ref: any = useRef();
	const getUser = async () => {
		try {
			const { data } = await axios.get(
				`${process.env.REACT_APP_BACKEND_URL}user/${_user.username}`,
				{ withCredentials: true }
			);
			setBlocked(data.blocked);
			setBlocker(data.blocker);
			if (data.relation !== "friends")
				setFriends(false);
			else
				setFriends(true);
			setUser(data);
		} catch (e) {}
	}

	const InviteFriend = () =>{
		gameSocket?.emit("inviteFriend", {username: user.username})
	}

	const checkNotif = () => {
		room_notif.map((room) =>{
			if (room === room_id)
				setnotif(true);
			return true;
		})
	}
	useEffect(() => {
		getUser();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [updated, updatedRelation]);

	useEffect(() => {
		checkNotif()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [room_notif])

	useEffect(() => {
		gameSocket?.on("GameReady", (data)=>{
            navigate(`/game?room=${data.room}`)
        })
		function handleClickOutside(event) {
			if (ref.current && !ref.current.contains(event.target)) {
				setShowDropdown(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ref]);

	return (
		<div
			ref={ref}
			className="relative flex justify-around p-4 rounded-xl hover:bg-my-light-violet/30 hover:shadow-md"
		>
			{notif && <div
				className={`absolute h-[1rem] w-[1rem] rounded-full bg-red-500 top-0 left-2 flex items-center justify-center cursor-pointer hover:bg-red-300`}
				>
			</div>}
			{/* Avatar Part */}
			<div
				className="min-h-[3rem] min-w-[3rem] rounded-full flex justify-center items-center gap-1 cursor-pointer"
				onClick={() => {
					setShowDropdown(false);
					setnotif(false);
					setNotif(room_notif.filter(room => room !== room_id));
					handleClick(_user, room_id, "Dm");
				}}
			>
				{_user.avatar && (
					<img
						src={_user.avatar}
						alt="avatar"
						className="w-[3rem] h-[3rem] rounded-full"
					/>
				)}
				{/* Text Part */}
				<div className="text-left">
					<h3 className="text-xl">{_user.username}</h3>
					{!(blocked || blocker || !friends) && (
						<div className="text-sm font-semibold">
							{_user.status}
						</div>
					)}
				</div>
			</div>
			{/* Three Dots Part */}
			<div className="relative flex flex-col">
				<i
					className="text-xl rounded-full cursor-pointer fa-solid fa-ellipsis-vertical hover:bg-gray-100 w-[2rem] self-end"
					onClick={() => setShowDropdown(!showDropDown)}
				></i>
				<motion.div
					variants={threeDotsVariants}
					animate={showDropDown ? "open" : "close"}
					className={`p-2 text-sm font-light bg-white rounded-xl absolute z-30 top-[25px] left-[-10rem] w-max`}
				>
					<p
						className="pb-1 border-b-[1px] border-black/50 cursor-pointer hover:bg-gray-100 rounded-md rounded-b-none p-1 font-normal"
						onClick={() => {
							setShowDropdown(false);
							navigate(`/profile/${_user.username}`);
						}}
					>
						Go to Profile
					</p>
					{!blocker && (
						<>
							{" "}
							{!blocked ? (
								<>
									{friends && _user.status === "online" && <p
										className="pb-1 border-b-[1px] border-black/50 cursor-pointer hover:bg-gray-100 rounded-md rounded-b-none p-1 font-normal"
										onClick={() => InviteFriend()}
									>
										Invite for a game
									</p>}
									<p
										className="p-1 font-normal cursor-pointer hover:bg-gray-100"
										onClick={async () => {
											setYouSure(true);
										}}
									>
										Block User
									</p>
									{showYouSure && (
										<HandleBlock
											handleYesClick={() => {
												setYouSure(false);
												setShowDropdown(false);
												userSocket?.emit(
													"relation status",
													{
														id: _user.id,
														to_do: "block_user",
													},
													(res) => {
														setBlocked((prev) => {
															return res.blocked;
														});
													}
												);
											}}
											handleNoClick={() => {
												setYouSure(false);
												// setShowDropdown(false);
											}}
										/>
									)}
								</>
							) : (
								<>
									<p
										className="pb-1 border-b-[1px] border-black/50 cursor-pointer hover:bg-gray-100 rounded-md rounded-b-none p-1 font-normal"
										onClick={async () => {
											setYouSure(true);
										}}
									>
										Unblock
									</p>
									{showYouSure && (
										<HandleBlock
											handleYesClick={() => {
												setYouSure(false);
												setShowDropdown(false);
												userSocket?.emit(
													"relation status",
													{
														id: _user.id,
														to_do: "unblock_user",
													},
													(res) => {
														setBlocked((prev) => {
															return res.blocked;
														});
													}
												);
											}}
											handleNoClick={() => {
												setYouSure(false);
												// setShowDropdown(false);
											}}
										/>
									)}
								</>
							)}
						</>
					)}
				</motion.div>
			</div>
		</div>
	);
};

export default ChatUserCard;
