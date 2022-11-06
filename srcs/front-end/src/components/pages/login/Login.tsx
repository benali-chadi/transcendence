import React, { FC } from "react";
import Button from "../../common/Button";

import background from "../../../img/login-background.jpg";
import logo from "../../../img/logo.png";

import { ReactComponent as Logo42 } from "../../../img/42logo.svg";

const Login: FC = () => {
	const backgroundStyle = {
		backgroundImage: `url('${background}')`,
	};

	const handleLoginClick = async () => {
		document.location.href = `${process.env.REACT_APP_BACKEND_URL}auth`;
	};

	return (
		<div
			className="h-screen w-full bg-gradient-to-r from-[#D8E3F7] to-[#E4CFBA] overflow-auto
                        md:p-12 md:py-20 flex flex-col justify-center items-center"
		>
			<div
				className="h-screen w-full min-h-max overflow-y-auto bg-50%w bg-no-repeat bg-top flex flex-col justify-end my-auto
                            md:rounded-large md:grid md:grid-cols-5 md:min-h-[50rem]
							md:h-5/6 md:max-w-[150rem]
							md:grid-rows-1
                            md:bg-right md:bg-50%h
            "
				style={backgroundStyle}
			>
				<div className="flex flex-col items-center justify-center gap-8 py-8 h-3/5 scrolling min-h-fit bg-my-dark-lavender rounded-t-large md:col-span-3 md:h-full md:justify-center md:rounded-large ">
					<img src={logo} alt="logo" className="h-32 2xl:h-48" />
					<h1 className="text-4xl font-extrabold xl:text-5xl 2xl:text-6xl">
						Welcome To Pong
					</h1>
					<h2 className="text-3xl font-thin xl:text-4xl 2xl:text-5xl">
						Login with Intra
					</h2>
					<Button
						handleClick={handleLoginClick}
						color="bg-my-yellow"
						hoverColor="bg-yellow-300"
					>
						<Logo42
							width="100%"
							height="100%"
							style={{
								minHeight: "4rem",
								width: "10rem",
							}}
						/>
					</Button>
				</div>
			</div>
		</div>
	);
};

export default Login;
