import { useContext } from "../../context/context";
import React, { useEffect, useState } from "react";
import styles from "./TaskBar.module.scss";
import Tooltip from "../Tooltip/Tooltip";
import { updateCurrentActiveWindow } from "../../utils/general";

const TaskBar = () => {
    const { currentTime, currentWindows, dispatch } = useContext();

    //Todo: Add more accurate clock that updates in sync with system clock
    useEffect(() => {
        const interval = setInterval(() => {
            dispatch({ type: "SET_CURRENT_TIME", payload: new Date() });
        }, 30_000);

        return () => clearInterval(interval);
    }, [dispatch]);

    const windowTabClickHandler = (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        const windowTabSelector = "[data-label=taskBarWindowTab]";
        const windowTab = (event.target as HTMLElement).closest<HTMLElement>(windowTabSelector);
        if (!windowTab) return;

        const windowId = windowTab.dataset.windowId;
        if (!windowId) return;

        const updatedCurrentWindows = updateCurrentActiveWindow(windowId, currentWindows);
        dispatch({ type: "SET_CURRENT_WINDOWS", payload: updatedCurrentWindows });
    };

    const [systemTrayIconDismissed, setSystemTrayIconDismissed] = useState(false);
    const systemTrayIconClickHandler = (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        const systemTrayIcon = (event.target as HTMLElement).closest<HTMLElement>("[data-label=Tooltip]");
        if (!systemTrayIcon) return;

        const systemTrayContent = systemTrayIcon.querySelector<HTMLElement>("[data-dismissed");
        if (!systemTrayContent || systemTrayContent?.dataset.dismissed === "false") return;

        setSystemTrayIconDismissed(false);
    }

    const formattedTime = currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    return (
        <div className={`${styles.taskBar} flex justify-between`} data-label="taskbar">
            <button className={`${styles.startButton}`}>Start</button>
            <ul className={`${styles.windows} flex items-center justify-start w-full`}>
                {currentWindows.map((currentWindow, index) => (
                    <li key={index} onClick={(e) => windowTabClickHandler(e)} data-label="taskBarWindowTab" data-active={currentWindow.active} data-window-id={currentWindow.id}>
                        <span className="w-full relative flex">
                            <img src={currentWindow.icon} width="14" height="14" className="mr-2 min-w-5.5"></img>
                            <span className="absolute ml-7">{currentWindow.title}</span>
                        </span>
                    </li>
                ))}
            </ul>
            <div className={`${styles.systemTray} flex justify-center items-center`}>
                <ul className="flex">
                    <li className="relative" onClick={(e) => systemTrayIconClickHandler(e)}>
                        <img src="/icon__info.png" width="14" height="14" className="cursor-pointer mr-2 min-w-[14px]"></img>
                        <Tooltip heading="Windows XP React Edition" content="Still a work in progress, but this is a semi-authentic recreation of Windows XP created using React & Typescript." systemTrayIconDismissed={systemTrayIconDismissed} setSystemTrayIconDismissed={setSystemTrayIconDismissed} />
                    </li>
                </ul>
                <span className="whitespace-nowrap">{formattedTime}</span>
            </div>
        </div>
    );
};

export default TaskBar;