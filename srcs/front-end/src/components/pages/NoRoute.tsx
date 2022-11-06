import { motion } from 'framer-motion';
import React, { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import notFound from "../../img/notfound.png"
import Button from '../common/Button';

const NoRoute:FC = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/");
    }
    const imgVariants = {
		bounce: {
			y: [20, -20],
			transition: {
				y: {
					yoyo: Infinity,
					type: "tween",
					duration: 0.8,
				},
			},
		},
	};

  return (
    <div className="h-full w-full flex flex-col justify-center items-center">
        <motion.img
            variants={imgVariants}
            animate="bounce"
        src={notFound} alt="Not Found" />
        <Button color="bg-my-yellow" handleClick={handleClick}>
            <p>Return Home</p>
        </Button>
    </div>
  )
}

export default NoRoute