import axios from "axios";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { useEffect } from "react";
import { FC } from "react";
import Modal from "./Modal";
import FriendCard from "../pages/Profile/friends/FriendCard";

interface Props {
	handleCancel: () => void;
}

const Search: FC<Props> = ({ handleCancel }) => {
	const [data, setData] = useState([]);
	const [text, setText] = useState("");

	useEffect(() => {
		async function showdata() {
			try {
				const { data } = await axios.get(
					`${process.env.REACT_APP_BACKEND_URL}user/all`,
					{
						withCredentials: true,
					}
				);
				setData(data);
			} catch (e) {}
		}
		showdata();
		// eslint-disable-next-line
	}, []);

	return (
		<Modal>
			<div className="absolute top-0 z-50 flex items-center justify-center w-screen h-screen bg-black/80">
				<div
					className="absolute top-0 w-screen h-screen cursor-pointer"
					onClick={handleCancel}
				></div>
				<motion.div
					initial={{ x: "-100vw" }}
					animate={{ x: 0 }}
					transition={{ type: "spring", stiffness: 120 }}
					exit={{
						x: "100vw",
						transition: { type: "tween", duration: 0.5 },
					}}
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
					{/* Data */}
					<div className="flex flex-wrap justify-center gap-2">
						{data.length !== 0 ? (
							data
								.filter((user: any) =>
									user.username.includes(text)
								)
								.map((user: any) => {
									return (
										<div
											key={user.id}
											onClick={handleCancel}
										>
											<FriendCard user={user} />
										</div>
									);
								})
						) : (
							<h1>No Data</h1>
						)}
					</div>
				</motion.div>
			</div>
		</Modal>
	);
};

export default Search;
