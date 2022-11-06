import axios from "axios";
import { motion } from "framer-motion";
import React, { FC, useContext, useEffect, useState } from "react";
import Button from "../../../../common/Button";
import { userContext, UserState } from "../../../../helpers/context";

interface Props {
	room_id: number;
	handleCancelClick: () => void;
}

const EditChannelInfo: FC<Props> = ({ handleCancelClick, room_id }) => {
	const { isMobile } = useContext<UserState>(userContext);

	const [channelName, setChannelName] = useState("");
	const [privacy, setPrivacy] = useState<"Public" | "Private" | "Protected">(
		"Public"
	);
	const [password, setPassword] = useState("");

	const [channelAvatar, setChannelAvatar] = useState<any>();
	const [selectedfile, setFile] = useState<File>();

	const [showError, setShowError] = useState(false);

	useEffect(() => {
		async function roomInfo() {
			try {
				let { data } = await axios.get(
					`${process.env.REACT_APP_BACKEND_URL}chat/${room_id}`,
					{ withCredentials: true }
				);
				setChannelAvatar(
					`${process.env.REACT_APP_BACKEND_URL}${data.icon}`
				);
				setChannelName(data.name);
				setPrivacy(data.type);
			} catch (e) {}
		}
		roomInfo();
		// eslint-disable-next-line
	}, []);
	return (
		<form
			onSubmit={async (e) => {
				e.preventDefault();
				try {
					const formData = new FormData();
					formData.append("name", channelName);
					formData.append("type", privacy);
					if (selectedfile) formData.append("icon", selectedfile);
					if (password) formData.append("password", password);
					await axios.post(
						`${process.env.REACT_APP_BACKEND_URL}chat/${room_id}/update_room`,
						formData,
						{ withCredentials: true }
					);
					if (isMobile) handleCancelClick();
				} catch (e) {
					setShowError(true);
					setTimeout(() => {
						setShowError(false);
					}, 2000);
				}
			}}
			className="h-full"
		>
			<div className="relative flex flex-col justify-around h-full px-4">
				<i
					className="absolute cursor-pointer top-3 fa-solid fa-arrow-left md:hidden text-[1.5rem] hover:text-white"
					onClick={handleCancelClick}
				></i>
				{showError && (
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						initial={{ opacity: 0, y: -100 }}
						transition={{ type: "tween", delay: 0.5 }}
						className="absolute z-10 top-2 left-[25%] p-2 text-white rounded-lg bg-red-400/70 opacity-40"
					>
						<p>Channel Name already exists</p>
					</motion.div>
				)}
				{/* Group Avatar */}
				<div className="flex flex-col items-center gap-1">
					<h2 className="font-bold text-white">
						Change Channel's Icon
					</h2>
					<div className="avatarUpload">
						<div
							className="upload-button"
							onClick={() => {
								let element: HTMLElement =
									document.getElementsByClassName(
										"file-upload"
									)[0] as HTMLElement;

								element.click();
							}}
						>
							{channelAvatar && (
								<img
									// src={URL.createObjectURL(groupAvatar)}
									src={channelAvatar}
									alt="Channel's avatar"
								/>
							)}
						</div>
						<input
							type="file"
							className="hidden file-upload"
							onChange={(e) => {
								let file: any = e.target as HTMLInputElement;
								if (file.files) setFile(file.files[0]);
								if (typeof file.files[0] !== "string") {
									file = URL.createObjectURL(file.files[0]);
								}
								setChannelAvatar(file);
							}}
						/>
					</div>
				</div>
				{/* Group Name Input */}
				<div className="flex flex-col items-center gap-1">
					<h2 className="font-bold text-white">
						Change Channel's Name
					</h2>
					<input
						type="text"
						placeholder="Choose Your channel's name"
						className="rounded-large h-10 border-black border-[1px] px-3 font-Poppins"
						required
						value={channelName}
						onChange={(e) => setChannelName(e.target.value)}
					/>
				</div>
				{/* Privacy Options */}
				<div className="flex flex-col gap-2">
					<h2 className="font-bold text-center text-white">
						Change Channel's Privacy
					</h2>
					<div className="grid grid-cols-3 bg-my-violet rounded-med">
						<h2
							className={`p-2 text-center text-white cursor-pointer rounded-l-med ${
								privacy === "Public"
									? "bg-my-light-violet font-bold"
									: ""
							}`}
							onClick={() => setPrivacy("Public")}
						>
							Public
						</h2>
						<h2
							className={`p-2 text-center text-white cursor-pointer border-x-2 ${
								privacy === "Private"
									? "bg-my-light-violet font-bold"
									: ""
							}`}
							onClick={() => setPrivacy("Private")}
						>
							Private
						</h2>
						<h2
							className={`p-2 text-center text-white cursor-pointer rounded-r-med ${
								privacy === "Protected"
									? "bg-my-light-violet font-bold"
									: ""
							}`}
							onClick={() => setPrivacy("Protected")}
						>
							Protected
						</h2>
					</div>
					{/* Password */}
					{privacy === "Protected" ? (
						<input
							type="password"
							placeholder="Type Your Password"
							className="rounded-large h-10 border-black border-[1px] px-3 font-Poppins pb-2 self-center"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					) : (
						<></>
					)}
				</div>
				{/* Buttons */}
				<div className="self-center">
					<Button
						color="bg-my-yellow"
						hoverColor="bg-yellow-300"
						type="submit"
					>
						<p>Save</p>
					</Button>
				</div>
			</div>
		</form>
	);
};

export default EditChannelInfo;
