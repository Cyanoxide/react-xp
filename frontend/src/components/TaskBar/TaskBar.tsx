import React, { useState, useEffect } from "react";
import styles from "./TaskBar.module.scss";

interface TaskBarProps {
    placeholder?: string
}

const TaskBar: React.FC<TaskBarProps> = ({ placeholder = "" }) => {
    const [currentTime, setCurrentTime] = useState("");


    useEffect(() => {
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }))
    }, [])


    return (
        <div className={`${styles.taskBar} flex justify-between`}>
            <button className={`${styles.startButton}`}>Start</button>
            <ul className={`${styles.windows} flex items-center justify-start w-full`}>
                <li>Chrome</li>
                <li>File Explorer</li>
            </ul>
            <div className={`${styles.systemTray} flex justify-center items-center`}>
                <span>{currentTime}</span>
            </div>
        </div>
    );
};

export default TaskBar;