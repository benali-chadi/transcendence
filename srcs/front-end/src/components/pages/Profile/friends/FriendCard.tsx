import React, { FC, useContext, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { threeDotsVariants } from "../../../helpers/variants";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { userContext, UserState } from "../../../helpers/context";
import HandleBlock from "../../../common/HandleBlock";

interface Props {
	user: any;
	role?: string;
}

const FriendCard: FC<Props> = ({ user, role }) => {
	const { userSocket, updated , gameSocket, currentUser} = useContext<UserState>(userContext);
	const navigate = useNavigate();
	const [showDropDown, setShowDropdown] = useState(false);
	const [_user, setUser] = useState(user);

	const [blocked, setBlocked] = useState(_user.blocked);
	const [showYouSure, setYouSure] = useState(false);

	const ref: any = useRef();

	useEffect(() => {
		async function getUser() {
			try {
				const { data } = await axios.get(
					`${process.env.REACT_APP_BACKEND_URL}user/${_user.username}`,
					{ withCredentials: true }
				);
				setUser(data);
			} catch (e) {}
		}
		getUser();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [updated]);

	const InviteFriend = (username: string) =>{
		gameSocket?.emit("inviteFriend", {username: username})
	}

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
			{role === "Owner" && <i className="fa-solid fa-crown text-sm"></i>}
			{role === "Admin" && <i className="fa-solid fa-user-shield text-sm"></i>}
			{/* Avatar Part */}
			<div
				className="min-h-[3rem] min-w-[3rem] rounded-full flex justify-center items-center gap-4 cursor-pointer"
				onClick={() => {
					setShowDropdown(false);
					navigate(`/profile/${_user.username}`);
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
					{!_user.blocked && !_user.blocker && _user.relation === "friends" && 
						<div className="text-sm font-semibold">{_user.status}</div>}
				</div>
			</div>
			
			{/* Three Dots Part */}
			{ currentUser.id !== _user.id && <div className="relative flex flex-col">
				<div
					className="hover:bg-gray-100 w-[2rem] cursor-pointer rounded-full flex justify-center items-center"
					onClick={() => setShowDropdown(!showDropDown)}
				>
					<i className="text-xl fa-solid fa-ellipsis-vertical "></i>
				</div>

				{!blocked ? (
					<motion.div
						variants={threeDotsVariants}
						animate={showDropDown ? "open" : "close"}
						className={`p-2 text-sm font-light bg-white rounded-xl absolute z-10 top-[25px] left-[-3rem] w-max`}
					>
						{_user.status === "online" && <p
							className="pb-1 border-b-[1px] border-black/50 cursor-pointer hover:bg-gray-100 rounded-md rounded-b-none p-1 font-normal"
							onClick={() =>
								{
									InviteFriend(_user.username);
									setShowDropdown(false)
								}
							}
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
								}}
							/>
						)}
					</motion.div>
				) : (
					<motion.div
						variants={threeDotsVariants}
						animate={showDropDown ? "open" : "close"}
						className={`p-2 text-sm font-light bg-white rounded-xl absolute z-10 top-[25px] left-[-3rem] w-max`}
					>
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
								}}
							/>
						)}
					</motion.div>
				)}
			</div>}
		</div>
	);
};

export default FriendCard;
