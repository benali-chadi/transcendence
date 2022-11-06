import axios from "axios";
import React, { FC, useEffect, useState } from "react";
import SettingsMemberCard from "./SettingsMemberCard";

interface Props {
	room_id: number;
	members: boolean;
	unban: boolean;
	handleCancel: () => void;
}

const EditMembers: FC<Props> = ({ handleCancel, room_id, members, unban }) => {
	const [data, setData] = useState([]);
	const [text, setText] = useState("");
	const [memebersUpdate, setMembersUpdate] = useState(0);

	useEffect(() => {
		async function showdata() {
			try {
				let data: any;
				if (!members) {
					data = await axios.get(
						`${process.env.REACT_APP_BACKEND_URL}chat/${room_id}/channel_not_members`,
						{
							withCredentials: true,
						}
					);
				} else if (unban) {
					data = await axios.get(
						`${process.env.REACT_APP_BACKEND_URL}chat/${room_id}/banned_members`,
						{
							withCredentials: true,
						}
					);
				} else {
					data = await axios.get(
						`${process.env.REACT_APP_BACKEND_URL}chat/${room_id}/channel_members`,
						{
							withCredentials: true,
						}
					);
				}
				setData(data.data);
			} catch (e) {}
		}
		showdata();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [memebersUpdate]);

	return (
		<div className="relative flex flex-col p-4">
			{/* Close Icon */}
			<i
				className="absolute cursor-pointer top-3 fa-solid fa-arrow-left md:hidden text-[1.5rem] hover:text-white"
				onClick={handleCancel}
			></i>
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
						.filter((user: any) => user.username.includes(text))
						.map((user: any) => {
							return (
								<SettingsMemberCard
									key={user.id}
									room_id={room_id}
									user={user}
									setMembersUpdated={setMembersUpdate}
								/>
							);
						})
				) : (
					<h1>No Data</h1>
				)}
			</div>
		</div>
	);
};

export default EditMembers;
