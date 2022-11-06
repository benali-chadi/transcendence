import axios from "axios";
import React, { FC, useContext, useEffect } from "react";
import { useState } from "react";
import { UserState } from "../helpers/context";
import { userContext } from "../helpers/context";
import UpdateUser from "../pages/login/UpdateUser";
import Button from "./Button";

interface Props {
	user: {
		id: number;
		username: string;
		avatar: string;
		_level: number;
	};
	path: string;
}

const UserCard: FC<Props> = ({ user, path }) => {
	const { currentUser, userSocket, updatedRelation } =
		useContext<UserState>(userContext);
	const [showUpdateUser, setShowUpdateUser] = useState(false);
	const [buttonMessage, setButton] = useState("");

	const level = Math.ceil((parseFloat((user._level % 1).toPrecision(2)) * 100)).toString();
	
	let cond: boolean = currentUser.id === user.id;
	const checkRelation = (data) => {
		if (data.blocked) setButton("unblock");
		else if (!data.blocked) {
			if (!data.relation) setButton("You're blocked");
			else if (data.relation === "friends") setButton("unfriend");
			else if (data.relation === "none") setButton("Add friend");
			else if (data.relation === "Accept invitation")
				setButton("Accept invitation");
			else if (data.relation === "Invitation Sent")
				setButton("Invitation Sent");
		}
	};
	async function updateRelation() {
		try {
			let to_do: string = "";
			if (buttonMessage === "unblock") to_do = "unblock_user";
			else if (buttonMessage === "Add friend") to_do = "add_friend";
			else if (buttonMessage === "Accept invitation")
				to_do = "accept_friend";
			else if (buttonMessage === "unfriend") to_do = "unfriend";
			else return;
			userSocket?.emit(
				"relation status",
				{
					id: user.id,
					to_do: to_do,
				},
				(res: any) => {
					checkRelation(res);
				}
			);
		} catch (e) {
			console.log(e);
		}
	}

	useEffect(() => {
		async function getUserData() {
			try {
				if (!user || user.id === undefined) return;
				let { data } = await axios.get(
					`${process.env.REACT_APP_BACKEND_URL}user/${user.username}`,
					{
						withCredentials: true,
					}
				);
				checkRelation(data);
			} catch (e) {
				console.log(e);
			}
		}

		getUserData();
	}, [buttonMessage, user, updatedRelation]);

	return (
		<div className="flex flex-col items-center gap-2 min-w-[15rem] max-w-lg m-auto">
			{showUpdateUser && (
				<UpdateUser
					path={path}
					setShowUpdateUser={setShowUpdateUser}
					handleCancelClick={() => setShowUpdateUser(!showUpdateUser)}
				/>
			)}
			<div
				className={`relative min-h-[8rem] min-w-[8rem] rounded-full bg-gray-300 flex justify-center`}
			>
				{cond && (
					<div
						className={`absolute h-[2rem] w-[2rem] rounded-full bg-blue-500 bottom-0 right-3 flex items-center justify-center cursor-pointer hover:bg-blue-300`}
						onClick={() => {
							setShowUpdateUser(!showUpdateUser);
						}}
					>
						<i className="fa-solid fa-pen-to-square text-[1.2rem]"></i>
					</div>
				)}
				{user.avatar && (
					<img
						src={user.avatar}
						alt="avatar"
						className="w-[8rem] h-[8rem] rounded-full"
					/>
				)}
			</div>
			<div className="self-stretch">
				<h3 className="text-xl text-center text-my-blue">
					{user.username}
				</h3>
				{/* Ladder level */}
				<div className="relative self-stretch w-full mt-2 bg-gray-300 h-9 rounded-med">
					<p className="absolute text-base left-[35%] top-[10%]">
						{"level " + Math.floor(user._level) + " - " + level + "%"}
					</p>
					<div className={`bg-my-yellow h-full rounded-med flex`} style={{width: `${level + "%"}`}}></div>
				</div>
			</div>
			{!cond && (
				<Button color="bg-my-yellow" handleClick={updateRelation}>
					<h1 className="text-xl">{buttonMessage}</h1>
				</Button>
			)}
		</div>
	);
};

export default UserCard;
