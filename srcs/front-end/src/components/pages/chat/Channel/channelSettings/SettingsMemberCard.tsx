import axios from "axios";
import { motion } from "framer-motion";
import React, { FC, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userContext, UserState } from "../../../../helpers/context";
import { threeDotsVariants } from "../../../../helpers/variants";

interface Props {
	user: any;
	setMembersUpdated: React.Dispatch<React.SetStateAction<number>>;
	room_id: number;
}

const SettingsMemberCard: FC<Props> = ({
	user,
	setMembersUpdated,
	room_id,
}) => {
	const { updated, chatSocket } = useContext<UserState>(userContext);
	const navigate = useNavigate();
	const [showDropDown, setShowDropdown] = useState(false);

	const [_user, setUser] = useState(user);
	const [onMute, setOnMute] = useState(false);
	// Mute Settings
	const [days, setDays] = useState(0);
	const [hours, setHours] = useState(0);
	const [minutes, setMinutes] = useState(0);
	const [muted, setmuted] = useState(false);

	const handleAddMemberClick = async () => {
		setShowDropdown(false);
		chatSocket.emit("updateRoom",
		{
			todo: "add_member",
			data:{
				room_id: room_id,
				user_id: user.id,
			}
		} ,(res) => {
		
			setMembersUpdated(prev => {
				return 	prev + 1
			});
		});
	};
	const handleChangeMemberRolesClick = async () => {
		setShowDropdown(false);
		let role = user.role === "Member" ? "Admin" : "Member";
		chatSocket.emit("updateRoom", 
		{
			todo: "change_member_role",
			data:{
				room_id: room_id,
				user_id: user.id,
				role: role,
			}
		} ,(res) => {
			setMembersUpdated(prev => {
				return 	prev + 1
			});
		});
	};
	const handleBanClick = async () => {
		setShowDropdown(false);
		chatSocket.emit("updateRoom", 
		{
			todo: "mute_user",
			data:{
				room_id: room_id,
				user_id: user.id,
				date_unmute: null,
			}
		} ,(res) => {
			setMembersUpdated(prev => {
				return 	prev + 1
			});
		});
	};
	const handleMuteClick = () => {
		setOnMute(!onMute);
	};
	const handleDeleteMemberClick = async () => {
		setShowDropdown(false);
		chatSocket.emit("updateRoom", 
		{
			todo: "remove_member",
			data:{
				room_id: room_id,
				user_id: user.id,
			}
		} , (res) => {
			setMembersUpdated(prev => {
				return 	prev + 1
			});
		});
	};

	const handleUnbanMemberClick = async () => {
		setShowDropdown(false);
		chatSocket.emit("updateRoom", 
		{
			todo: "unban",
			data:{
				room_id: room_id,
				user_id: user.id,
			}
		} , (res) => {
			setMembersUpdated(prev => {
				return 	prev + 1
			});
		});
	};

	async function getUser() {
		try {
			const { data } = await axios.get(
				`${process.env.REACT_APP_BACKEND_URL}user/${_user.username}`,
				{ withCredentials: true }
			);
			setUser(data);
		} catch (e) {}
	}
	const ref: any = useRef();

	useEffect(() => {
		if (!user.IsMuted || user.muteDate instanceof Date) setmuted(true);
		getUser();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [updated]);

	useEffect(() => {
		function handleClickOutside(event) {
			if (ref.current && !ref.current.contains(event.target)) {
				setShowDropdown(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			// Unbind the event listener on clean up
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [ref]);
	return (
		<div
			ref={ref}
			className="flex flex-shrink-0 justify-around w-fit p-4 bg-white rounded-xl hover:bg-white/50 hover:shadow-lg min-w-[15rem]"
		>
			{user.role === "Owner" && <i className="fa-solid fa-crown text-sm"></i>}
			{user.role === "Admin" && <i className="fa-solid fa-user-shield text-sm"></i>}
			{/* Avatar Part */}
			<div
				className="min-h-[3rem] min-w-[3rem] rounded-full flex justify-center items-center gap-4 cursor-pointer"
				onClick={() => {
					setShowDropdown(false);
					// setProfileUser(user);
					navigate(`/profile/${_user.username}`);
					// handleClick(user);
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
					<div className="text-sm font-semibold">{_user.status}</div>
				</div>
			</div>
			{/* Three Dots Part */}
			{user.role !== "Owner" && <div className="relative flex flex-col">
				<div
					className="hover:bg-gray-100 w-[2rem] cursor-pointer rounded-full flex justify-center items-center"
					onClick={() => setShowDropdown(!showDropDown)}
				>
					<i className="text-xl fa-solid fa-ellipsis-vertical "></i>
				</div>

				{user.role === undefined ? (
					<motion.div
						variants={threeDotsVariants}
						animate={showDropDown ? "open" : "close"}
						className={`p-2 text-sm font-light bg-white rounded-xl absolute z-10 top-[25px] left-[-3rem] w-max`}
					>
						<p
							className="p-1 pb-1 font-normal rounded-md rounded-b-none cursor-pointer hover:bg-gray-100"
							onClick={handleAddMemberClick}
						>
							Add Member
						</p>
					</motion.div>
				) : (
					<motion.div
						variants={threeDotsVariants}
						animate={showDropDown ? "open" : "close"}
						className={`p-2 text-sm font-light bg-white rounded-xl absolute z-10 top-[25px] left-[-3rem] w-max`}
					>
						{user.muteDate ? (
							<>
								<p
									className="p-1 pb-1 font-normal rounded-md rounded-b-none cursor-pointer hover:bg-gray-100"
									onClick={handleChangeMemberRolesClick}
								>
									{user.role === "Member"
										? "set as admin"
										: "remove privlige"}
								</p>
								<p
									className="p-1 pb-1 font-normal rounded-md rounded-b-none cursor-pointer hover:bg-gray-100"
									onClick={handleBanClick}
								>
									Ban
								</p>

								{muted && (
									<p
										className="p-1 pb-1 font-normal rounded-md rounded-b-none cursor-pointer hover:bg-gray-100"
										onClick={handleMuteClick}
									>
										Mute
									</p>
								)}
								{onMute && (
									<form
										className="flex flex-col"
										onSubmit={async (e) => {
											e.preventDefault();

											setShowDropdown(false);
											setOnMute(false);
											try {
												let date = new Date();

												date.setUTCDate(
													date.getDate() + days
												);
												date.setUTCHours(
													date.getHours() + hours - 1
												);
												date.setUTCMinutes(
													date.getMinutes() + minutes
												);
												chatSocket.emit("updateRoom", 
												{
													todo: "mute_user",
													data:{
														ruser_id: user.id,
														room_id: room_id,
														date_unmute: date,
													}
												} ,(res) => {
												});
												setDays(0);
												setHours(0);
												setMinutes(0);
											} catch (e) {}
										}}
									>
										<div className="flex justify-between">
											<input
												type="number"
												value={days}
												onChange={(e) => {
													const value = parseInt(
														e.target.value
													);
													if (
														!isNaN(value) &&
														value >= 0
													)
														setDays(value);
												}}
												className="w-[3rem]"
											/>
											<p className="self-center text-xs text-gray-500">
												Days
											</p>
										</div>
										<div className="flex justify-between">
											<input
												type="number"
												value={hours}
												onChange={(e) => {
													const value = parseInt(
														e.target.value
													);
													if (
														!isNaN(value) &&
														value >= 0
													)
														setHours(value);
												}}
												className="w-[3rem]"
											/>
											<p className="self-center text-xs text-gray-500">
												Hours
											</p>
										</div>
										<div className="flex justify-between">
											<input
												type="number"
												value={minutes}
												onChange={(e) => {
													const value = parseInt(
														e.target.value
													);
													if (
														!isNaN(value) &&
														value >= 0
													)
														setMinutes(value);
												}}
												className="w-[3rem]"
											/>
											<p className="self-center text-xs text-gray-500">
												Minutes
											</p>
										</div>
										<button
											type="submit"
											className="self-center p-1 mt-1 rounded-lg bg-my-yellow hover:opacity-80"
										>
											<p className="text-xs">Mute</p>
										</button>
									</form>
								)}
							</>
						) : (
							<p
								className="p-1 pb-1 font-normal rounded-md rounded-b-none cursor-pointer hover:bg-gray-100"
								onClick={handleUnbanMemberClick}
							>
								Unban
							</p>
						)}

						{/* {
							user.IsMuted && user.muteDate === null && */}

						{/* } */}
						<p
							className="p-1 pb-1 font-normal rounded-md rounded-b-none cursor-pointer hover:bg-gray-100"
							onClick={handleDeleteMemberClick}
						>
							Remove Member
						</p>
					</motion.div>
				)}
			</div>}
		</div>
	);
};

export default SettingsMemberCard;
