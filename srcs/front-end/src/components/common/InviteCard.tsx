import React, { FC, useContext, useEffect, useRef, useState } from 'react'
import {  useNavigate } from 'react-router-dom'
import { userContext, UserState } from '../helpers/context'
import Button from './Button'
import Card from './Card'
import Modal from './Modal'

interface Props {
    handleCancel: () => void,
    opUser: any,
    msg:String,
}


const InviteCard:FC<Props> = ({handleCancel, opUser, msg}) => {

  const [title, setTitle] = useState("Game Invitation");
  const {userSocket, gameSocket} = useContext<UserState>(userContext);

  const navigate = useNavigate();
  const ref = useRef(false);
  const addFriend = async (user: any) => {
    userSocket?.emit(
        "relation status",
        {
            id: user.id,
            to_do: "accept_friend",
        },
        (res: any) => {
        }
    );
};

const declineInvitation = async (user: any) => {
    userSocket?.emit(
        "relation status",
        {
            id: user.id,
            to_do: "decline_req",
        },
        (res: any) => {
        }
    );
};

const DeclineGame = () =>{
    gameSocket?.emit("DeclineChallenge", {username: opUser.username},(res)=>{})
}

const AcceptChalleng = () => {
    gameSocket?.emit("acceptChallenge", {username: opUser.username},(res)=>{ 
        navigate("/game")
    })
}

const handleDecline = async  ()=>{
    if (msg === "Want to be your friend")
    {
        await declineInvitation(opUser);
    }else {
        DeclineGame();
        ref.current = true;
    }
    handleCancel();
}

const handleAccept = async () =>{
    if (msg === "Want to be your friend")
    { 
        await addFriend(opUser);
    }else {
        AcceptChalleng();
    }
    handleCancel();
}

  useEffect(() =>{
    if (msg === "Want to be your friend")
        setTitle("Friend request");
    return () =>{
        if (msg !== "Want to be your friend" && !ref.current)
            DeclineGame();
    }
	// eslint-disable-next-line
  },[])

  return (
    <Modal>
        <Card
            title={title}
            handleCancel={handleCancel}
            icon="fa-solid fa-envelope text-[1.5rem]"
            MainButton={
                <Button color='bg-my-yellow' handleClick={handleAccept}>
                    <p>Accept</p>
                </Button>
            }
            SecondaryButton={
                <Button color='bg-gray-200' handleClick={handleDecline}>
                    <p>Decline</p>
                </Button>
            }
        >
            <div className="flex flex-col items-center my-4">
                <img src={opUser.avatar} alt="avatar" className="w-[7rem] rounded-full" />
                <p className="my-4"><span className="font-extrabold text-xl">{opUser.username}</span> {msg}</p>
            </div>
        </Card>
    </Modal>
  )
}

export default InviteCard