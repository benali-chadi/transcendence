import React ,{ FC, useContext, useState } from "react";
import Button from "./Button";
import Card from "./Card";
import Modal from "./Modal";
import { motion } from "framer-motion";
import { ChatContext, ChatState } from "../helpers/context";
import axios from "axios";

interface Props{
    handleCancel: () => void;
    room_id: number,
    validated: boolean,
    to_do: string,
}

const ChannelCode: FC<Props> = ({handleCancel, room_id, validated, to_do}) =>{

    const [showError, setShowError] = useState(false);
    const [password, setPassword] = useState<string>("");
    const { channelUpdated, setcChannelUpdated,  } =
		useContext<ChatState>(ChatContext);


    const handleJoinClick = async () => {
        try {
            if (to_do === "join")
            {
                await axios.post(
                    `${process.env.REACT_APP_BACKEND_URL}chat/join_room`,
                    { room_id: room_id, password: password },
                    { withCredentials: true }
                );
                setcChannelUpdated(channelUpdated + 1);
                handleCancel()
            } else {
                await axios.delete(
					`${process.env.REACT_APP_BACKEND_URL}chat/${room_id}/${password}`,
					{
						withCredentials: true,
					}
				);
                setcChannelUpdated(channelUpdated + 1);
				handleCancel();
            }
        } catch (e) {
            if (e.response.status === 403)
            {
                setShowError(true);
                setTimeout(() => {
                    setShowError(false);
                }, 2000);
            }
        }
    };
    return (
        <Modal>
			<form
				onSubmit={ (e) => {
					e.preventDefault();
                }}
                className="relative"
            >
                <Card
                title=""
                icon=""
                MainButton={
                    <Button color="bg-my-yellow" type="submit"
                    handleClick={handleJoinClick}>
                        <p>Verify</p>
                    </Button>
                }
                SecondaryButton={
                    <Button color="bg-gray-300" handleClick={handleCancel}>
                        <p>Cancel</p>
                    </Button>
                }
                handleCancel={handleCancel}>
                    <>
                    {showError && (
						<motion.div
							animate={{ opacity: 1, y: 0 }}
							initial={{ opacity: 0, y: -100 }}
							transition={{ type: "tween", delay: 0.5 }}
							className="absolute top-[-.5rem] right-[30%] p-2 text-white rounded-lg bg-red-400/70 opacity-40"
						>
							<p>Invalid password</p>
						</motion.div>
					)}
                    <div className="flex flex-col items-center justify-center gap-4 mb-4">
						<h2>Insert group password</h2>
                        <input
						value={password}
						type="password"
						className="rounded-large h-10 border-black border-[1px] px-3 font-Poppins w-[70%]"
						placeholder="Insert code"
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
                    </div>
                    </>
                </Card>
            </form>
        </Modal>
    )
} 

export default ChannelCode;