import axios from "axios";
import { motion } from "framer-motion";
import React, { FC, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../common/Button";
import Card from "../../common/Card";
import Modal from "../../common/Modal";
import { userContext, UserState } from "../../helpers/context";

interface Props {
	handleCancel: () => void;
	QRCode?: string;
	toDo: "" | "enable" | "disable" | "verify";
}

const TFAActivation: FC<Props> = ({ handleCancel, QRCode, toDo }) => {
	const [token, setToken] = useState("");
	const { setCurrentUser, setUserStorage } = useContext<UserState>(userContext);
	const [showError, setShowError] = useState(false);

	const navigate = useNavigate();
	return (
		<Modal>
			<form
				onSubmit={async (e) => {
					e.preventDefault();
					try {
						if (toDo === "enable") {
							let { data } = await axios.post(
								`${process.env.REACT_APP_BACKEND_URL}auth/validate-2Fa-token`,
								{
									token: token,
								},
								{
									withCredentials: true,
								}
							);
							setCurrentUser(data);
							localStorage.clear();
							localStorage.setItem(
								"CurrentUser",
								JSON.stringify(data)
							);
							handleCancel();
						} else if (toDo === "verify") {
							let { data } = await axios.post(
								`${process.env.REACT_APP_BACKEND_URL}auth/2fa/login`,
								{
									token: token,
								},
								{
									withCredentials: true,
								}
							);
							if (data) {
								setCurrentUser(data);
								localStorage.setItem(
									"CurrentUser",
									JSON.stringify(data)
								);
								navigate("/");
							}
						} else {
							let { data } = await axios.post(
								`${process.env.REACT_APP_BACKEND_URL}auth/disbale-2fa`,
								{
									token: token,
								},
								{
									withCredentials: true,
								}
							);
							setCurrentUser(data);
							localStorage.clear();
							localStorage.setItem(
								"CurrentUser",
								JSON.stringify(data)
							);
							handleCancel();
						}
					} catch (e) {
						if (e.response.status === 409) {
							setShowError(true);
							setTimeout(() => {
								setShowError(false);
							}, 2000);
						}
					}
				}}
				className="relative"
			>
				<Card
					title={`${toDo} 2FA`}
					icon=""
					MainButton={
						<Button color="bg-my-yellow" type="submit">
							<p>{toDo}</p>
						</Button>
					}
					SecondaryButton={
						<Button color="bg-gray-300" handleClick={handleCancel}>
							<p>Cancel</p>
						</Button>
					}
					handleCancel={handleCancel}
				>
					<>
						{showError && (
							<motion.div
								animate={{ opacity: 1, y: 0 }}
								initial={{ opacity: 0, y: -100 }}
								transition={{ type: "tween", delay: 0.5 }}
								className="absolute top-[-.5rem] right-[30%] p-2 text-white rounded-lg bg-red-400/70 opacity-40"
							>
								<p>Invalid Token</p>
							</motion.div>
						)}
						{toDo === "disable" ? (
							<div className="flex flex-col items-center justify-center gap-4 mb-4">
								<h2>Insert your validation token</h2>
								<input
									value={token}
									type="text"
									className="rounded-large h-10 border-black border-[1px] px-3 font-Poppins w-[70%]"
									placeholder="Insert code"
									onChange={(e) => setToken(e.target.value)}
									required
								/>
							</div>
						) : (
							<div className="flex flex-col items-center justify-center gap-4 mb-4">
								{QRCode && <img src={QRCode} alt="QRcode" />}
								<input
									value={token}
									type="text"
									className="rounded-large h-10 border-black border-[1px] px-3 font-Poppins w-[70%]"
									placeholder="Insert code"
									onChange={(e) => setToken(e.target.value)}
									required
								/>
							</div>
						)}
					</>
				</Card>
			</form>
		</Modal>
	);
};

export default TFAActivation;
