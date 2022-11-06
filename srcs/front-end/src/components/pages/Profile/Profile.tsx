import axios from "axios";
import { motion } from "framer-motion";
import React, { FC, useContext, useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import NoDataFound from "../../common/NoDataFound";
import UserCard from "../../common/UserCard";
import { userContext, UserState } from "../../helpers/context";

interface Props {}

export interface outletContext {
	profileUser: any;
	setProfileUser: React.Dispatch<React.SetStateAction<any>> | (() => void);
	username: string;
}

const Profile: FC<Props> = () => {
	const { updatedRelation } = useContext<UserState>(userContext);
	const [profileUser, setProfileUser] = useState<any>({});
	const { username } = useParams();
	const [noUserData, setNoUserData] = useState(false);
	const [isBlocked, setIsBlocked] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		async function getUserData() {
			try {
				setIsBlocked(false);
				let { data } = await axios.get(
					`${process.env.REACT_APP_BACKEND_URL}user/${username}`,
					{
						withCredentials: true,
					}
				);
				if (data && !data.blocked && !data.relation) setIsBlocked(true);
				setProfileUser(data);
			} catch (e) {
				setNoUserData(true);
				if (e.response.status === 401) {
					localStorage.clear();
					navigate("/");
				}
			}
		}
		getUserData();
		// eslint-disable-next-line
	}, [username, updatedRelation]);

	return (
		<motion.div
			className="h-screen overflow-auto scrolling min-h-max md:grid md:h-full md:justify-center md:rounded-large md:grid-cols-[2fr_5fr] md:rounded-l-none bg-my-blue"
		>
			{!noUserData && (
				<div className="sticky top-0 right-0 z-20 h-full md:rounded-r-large bg-my-lavender">
					<div className="p-[5rem]">
						<UserCard user={profileUser} path="/profile" />
					</div>
					{!isBlocked && (
						<ul className="profile-links">
							<li>
								<NavLink className="profile-link" to="friends">
									<i className="fa-solid fa-user-group"></i>
									<h2>Friends</h2>
								</NavLink>
							</li>
							<li>
								<NavLink
									className="profile-link"
									to="achievements"
								>
									<i className="fa-solid fa-trophy"></i>
									<h2>Achievements</h2>
								</NavLink>
							</li>
							<li>
								<NavLink
									className="profile-link"
									to="matchHistory"
								>
									<i className="fa-solid fa-table-tennis-paddle-ball"></i>
									<h2>Match History</h2>
								</NavLink>
							</li>
						</ul>
					)}
				</div>
			)}
			{noUserData && <NoDataFound />}
			<div className="w-full max-h-[80vh]">
				<Outlet context={{ profileUser, setProfileUser, username }} />
			</div>
		</motion.div>
	);
};

export default Profile;
