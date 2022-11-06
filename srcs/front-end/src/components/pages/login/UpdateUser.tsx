import axios from "axios";
import { motion } from "framer-motion";
import React, { FC, useContext } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../common/Button";
import Card from "../../common/Card";
import Modal from "../../common/Modal";
import { UserState } from "../../helpers/context";
import { userContext } from "../../helpers/context";
import TFAActivation from "./TFA_activation";

interface Props {
	handleCancelClick: () => void;
	setShowUpdateUser: (value: React.SetStateAction<boolean>) => void;
	path: string;
}

const UpdateUser: FC<Props> = ({
	handleCancelClick,
	setShowUpdateUser,
	path,
}) => {
	const { currentUser, setCurrentUser } = useContext<UserState>(userContext);
	const navigate = useNavigate();

	const [username, setUsername] = useState(currentUser.username);
	const [avatar, setAvatar] = useState(currentUser.avatar);
	const [showError, setShowError] = useState(false);
	const [selectedfile, setFile] = useState<File>();
	// const [token, setToken] = useState("");
	const [qrCode, setQrcode] = useState("");
	const [toDo, setToDo] = useState<"" | "enable" | "disable" | "verify">("");
	// const [disableTfa, setDisableTfa] = useState(false);
	return (
		<Modal>
			<>
				{toDo !== "" && (
					<TFAActivation
						toDo={toDo}
						QRCode={qrCode}
						handleCancel={() => {
							setToDo("");
						}}
					/>
				)}
				<form
					onSubmit={async (e) => {
						e.preventDefault();
						try {
							const formData = new FormData();
							formData.append("username", username);
							if (selectedfile) {
								formData.append("avatar", selectedfile);
							}
							const { data } = await axios.post(
								`${process.env.REACT_APP_BACKEND_URL}user/update_profile`,
								formData,
								{ withCredentials: true }
							);
							localStorage.clear();
							localStorage.setItem(
								"CurrentUser",
								JSON.stringify(data)
							);
							setCurrentUser(data);
							setShowUpdateUser(false);
							if (path === "/") navigate(0);
							else navigate(`/profile/${username}`);
						} catch (e) {
							if (e.response.status === 409) {
								setShowError(true);
								setTimeout(() => {
									setShowError(false);
								}, 2000);
							}
						}
					}}
				>
					<Card
						title="Update Profile"
						icon="fa-solid fa-pen-to-square text-[1.5rem]"
						MainButton={
							<Button
								color="bg-my-yellow"
								hoverColor="bg-yellow-300"
								type="submit"
							>
								<p>Save</p>
							</Button>
						}
						SecondaryButton={
							<Button
								color="bg-gray-300"
								hoverColor="bg-white"
								handleClick={handleCancelClick}
							>
								<p>Cancel</p>
							</Button>
						}
						handleCancel={handleCancelClick}
					>
						<div className="relative flex flex-col items-center gap-4">
							{currentUser.first_time && (
								<div className="self-stretch">
									<h3 className="text-xl text-center text-my-blue">
										Welcome
									</h3>
								</div>
							)}
							{/* Avatar */}
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
									{avatar && (
										<img src={avatar} alt="avatar" />
									)}
								</div>
								<input
									type="file"
									className="hidden file-upload"
									onChange={(e) => {
										let file: any =
											e.target as HTMLInputElement;
										if (file.files) setFile(file.files[0]);
										if (typeof file.files[0] !== "string") {
											file = URL.createObjectURL(
												file.files[0]
											);
										}
										setAvatar(file);
									}}
								/>
							</div>
							{showError && (
								<motion.div
									animate={{ opacity: 1, y: 0 }}
									initial={{ opacity: 0, y: -100 }}
									transition={{ type: "tween", delay: 0.5 }}
									className="absolute p-2 text-white rounded-lg bg-red-400/70 opacity-40"
								>
									<p>Username already exists</p>
								</motion.div>
							)}
							{/* UserName input */}
							<input
								type="text"
								placeholder="Choose Your Username"
								className="rounded-large h-10 border-black border-[1px] px-3 font-Poppins w-[70%]"
								required
								value={username}
								onChange={(e) => setUsername(e.target.value)}
							/>
							{/* Two Factor Auth */}

							{!currentUser.TFA_enabled ? (
								<div
									className="p-4 mb-4 border-b-2 border-black cursor-pointer rounded-med bg-my-yellow"
									onClick={async () => {
										try {
											setToDo("enable");
											let { data } = await axios.post(
												`${process.env.REACT_APP_BACKEND_URL}auth/enable-2FA`,
												{},
												{
													withCredentials: true,
												}
											);
											setQrcode(data);
											// setDisableTfa(false);
										} catch (e) {}
									}}
								>
									<h2 className="text-sm">Enable 2FA</h2>
								</div>
							) : (
								<div
									className="p-4 mb-4 border-b-2 border-black cursor-pointer rounded-med bg-my-yellow"
									onClick={() => {
										setToDo("disable");
										// setDisableTfa(true);
									}}
								>
									<h2 className="text-sm">Disable 2FA</h2>
								</div>
							)}
						</div>
					</Card>
				</form>
			</>
		</Modal>
	);
};

export default UpdateUser;
