import { useContext } from "../../context/context";
import React, { useEffect } from "react";
import styles from "./TaskBar.module.scss";


const TaskBar = () => {
    const { currentTime, dispatch } = useContext();

    //Todo: Add more accurate clock that updates in sync with system clock
    useEffect(() => {
        const interval = setInterval(() => {
            dispatch({ type: "SET_CURRENT_TIME", payload: new Date() });
        }, 30_000);

        return () => clearInterval(interval);
    }, [dispatch]);

    const onClickHandler = (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        const windowTabSelector = "[data-label=taskBarWindowTab]";
        const windowTab = (event.target as HTMLElement).closest<HTMLElement>(windowTabSelector);
        if (!windowTab) return;

        const windowTabs = windowTab.parentElement?.querySelectorAll<HTMLElement>(windowTabSelector);

        windowTabs?.forEach((tab) => {
            tab.dataset.active = "false";
        });

        windowTab.dataset.active = (windowTab.dataset.active === "true") ? "false" : "true";
    };

    const formattedTime = currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    return (
        <div className={`${styles.taskBar} flex justify-between`}>
            <button className={`${styles.startButton}`}>Start</button>
            <ul className={`${styles.windows} flex items-center justify-start w-full`}>
                <li onClick={(e) => onClickHandler(e)} data-active="true" data-label="taskBarWindowTab">
                    <span className="w-full relative flex">
                        <img src="/icon__internet_explorer.png" width="14" height="14" className="mr-2 min-w-[14px]"></img>
                        <span className="absolute ml-7">Internet Explorer</span>
                    </span>
                </li>
                <li onClick={(e) => onClickHandler(e)} data-label="taskBarWindowTab">
                    <span className="w-full relative flex">
                        <img src="/icon__documents.png" width="14" height="14" className="mr-2 min-w-[14px]"></img>
                        <span className="absolute ml-7">My Documents</span>
                    </span>
                </li>
            </ul>
            <div className={`${styles.systemTray} flex justify-center items-center`}>
                <ul className="flex">
                    <li className="relative">
                        <img src="/icon__info.png" width="14" height="14" className="cursor-pointer mr-2 min-w-[14px]"></img>
                        <span className={`${styles.tooltip} absolute`} data-label="tooltip">
                            <span className="flex items-center mb-1.5">
                                <img src="/icon__info.png" width="14" height="14" className="cursor-pointer mr-2 min-w-[14px]"></img>
                                <h4>Windows XP React Edition</h4>
                                <button className={styles.tooltipClose}><span>+</span></button>
                            </span>
                            <p className="text-left">Still a work in progress, but this is an semi-authentic recreation of Windows XP created using React.</p>
                        </span>
                    </li>
                    <li>
                        <img src="/icon__info.png" width="14" height="14" className="cursor-pointer mr-2 min-w-[14px]"></img>
                    </li>
                </ul>
                <span className="whitespace-nowrap">{formattedTime}</span>
            </div>
        </div>
    );
};

export default TaskBar;