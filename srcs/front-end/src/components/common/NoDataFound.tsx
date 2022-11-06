import React from "react";
import { useNavigate } from "react-router";
import Button from "./Button";

function NoDataFound() {
	const navigate = useNavigate();

	const handleClick = () => {
		navigate("/");
	};
	return (
		// <Modal>
		// <div className="absolute top-0 z-40 flex items-center justify-center w-screen h-screen bg-black/80">
		<div className="flex flex-col items-center justify-center gap-3 p-4 bg-white rounded-lg min-w-max">
			<h2>No Data Found 😞</h2>
			<Button color="bg-my-yellow" handleClick={handleClick}>
				<h2 className="text-xl">Return Home</h2>
			</Button>
		</div>
		// 	</div>
		// </Modal>
	);
}

export default NoDataFound;
