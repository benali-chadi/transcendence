import React, { FC } from "react";
import Button from "./Button";

interface Props {
	handleYesClick: () => void;
	handleNoClick: () => void;
}

const HandleBlock: FC<Props> = ({ handleYesClick, handleNoClick }) => {
	return (
		<div>
			<p className="p-1 font-normal">Are you sure?</p>
			<div className="flex justify-center gap-2">
				<Button
					color="bg-my-yellow border-b-2 border-black p-0"
					handleClick={handleYesClick}
				>
					<p className="text-sm">yes</p>
				</Button>
				<Button color="bg-gray-200 p-0" handleClick={handleNoClick}>
					<p className="text-sm">no</p>
				</Button>
			</div>
		</div>
	);
};

export default HandleBlock;
