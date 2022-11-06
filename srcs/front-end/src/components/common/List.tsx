import React, { FC } from "react";

interface Props {
	children?: JSX.Element;
}

const List: FC<Props> = ({ children }) => {
	return (
		<div className="w-full min-h-[2rem] max-h-[15rem] md:max-h-[40vh] bg-my-lavender overflow-auto scrolling flex flex-col items-center rounded-b-med">
			{children}
		</div>
	);
};

export default List;
