import React, { FC } from "react";
import AchievementCard from "../pages/Profile/achievements/AchievementCard";
import Card from "./Card";
import Modal from "./Modal";

interface Propos {
    title?: string;
	desc? : string;
	level: string;
    handleCancel: () => void
}

const Achievement : FC<Propos> = ({title, desc, level, handleCancel}) => {

    return (
        <Modal>
            <Card
            
            title="Achievement unlocked"
            icon=""
            MainButton=""
            SecondaryButton=""
            handleCancel={handleCancel}>
            <AchievementCard
                title={title}
                desc={desc}
                level={level}
            />
            </Card>
        </Modal>
    )
}

export default Achievement;