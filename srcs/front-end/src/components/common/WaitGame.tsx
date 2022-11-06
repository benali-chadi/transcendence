import React, { FC, useContext, useEffect, useRef } from "react";
import Modal from "./Modal";
import Card from "./Card";
import Button from "./Button";
import { userContext, UserState } from "../helpers/context";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";
import { motion } from "framer-motion";

interface Props {
    cancel : () => void;
}

const WaitGame: FC<Props> = ({cancel}) =>{

    const {gameSocket} = useContext<UserState>(userContext);
    const myRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const handleCancel = () =>{
        // ref.current = true;
        gameSocket?.emit("unsubscribe");
        cancel();
    }
    useEffect(()=>{
        gameSocket?.on("GameReady", (data)=>{
            navigate(`/game?room=${data.room}`)
        })
    })

    const ballVariants = {
        bounce: {
            // x: [100, -100],
            x: [myRef.current ? myRef.current.clientWidth / 2 - 25 : 100, myRef.current ? -(myRef.current.clientWidth / 2 - 25) : -100],
            y: [-20, 20],
            transition: {
                x: {
                    yoyo: Infinity,
                    duration: 1,
                },
                y: {
                    yoyo: Infinity,
                    duration: 2,
                }
            }
        }
    }

    return (
        <Modal>
            <Card 
            title="Waiting for adversary"
            handleCancel={handleCancel}
            icon=""
            SecondaryButton={
                <Button color='bg-gray-200' handleClick={handleCancel}>
                    <p>Cancel</p>
                </Button>
            }
            MainButton=""
            >
                <div className="flex justify-between items-center h-[10rem] bg-black px-2 mb-2" ref={myRef}>
                    <motion.div 
                        animate={{y: [-20, 20]}}
                        transition={{y: {yoyo: Infinity, duration: 1}}}
                        className="h-[40%] bg-white w-[1rem]"/>
                    <motion.div 
                        variants={ballVariants}
                        animate="bounce"
                        className="h-[1.2rem] w-[1.2rem] bg-white rounded-full"/>
                    <motion.div 
                        animate={{y: [20, -20]}}
                        transition={{y: {yoyo: Infinity, duration: 1}}}
                        className="h-[40%] bg-white w-[1rem]"/>
                </div>
            </Card>
        </Modal>
    )
}

export default WaitGame;