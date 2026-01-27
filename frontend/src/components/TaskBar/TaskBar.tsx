import { useContext } from "../../context/context";
import React, { useEffect, useState, useRef } from "react";
import styles from "./TaskBar.module.scss";
import Tooltip from "../Tooltip/Tooltip";
import StartMenu from "../StartMenu/StartMenu";

const TaskBar = () => {
    const { currentTime, currentWindows, isStartVisible, dispatch } = useContext();
    const [systemTrayIconDismissed, setSystemTrayIconDismissed] = useState(false);
    const startButton = useRef<HTMLButtonElement | null>(null);

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

        const updatedCurrentWindows = [...currentWindows];
        updatedCurrentWindows.map((currentWindow) => {
            if (windowId === currentWindow.id) {
                currentWindow.hidden = (currentWindow.active === true) ? true : false
                currentWindow.active = (currentWindow.active === true) ? false : true
            } else currentWindow.active = false;

        });
        dispatch({ type: "SET_CURRENT_WINDOWS", payload: updatedCurrentWindows });
    };

    const systemTrayIconClickHandler = (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        const systemTrayIcon = (event.target as HTMLElement).closest<HTMLElement>("[data-label=Tooltip]");
        if (!systemTrayIcon) return;

        const systemTrayContent = systemTrayIcon.querySelector<HTMLElement>("[data-dismissed");
        if (!systemTrayContent || systemTrayContent?.dataset.dismissed === "false") return;

        setSystemTrayIconDismissed(false);
    }

    const startButtonClickHandler = () => {
        dispatch({ type: "SET_IS_START_VISIBLE", payload: (isStartVisible) ? false : true });

        const updatedCurrentWindows = [...currentWindows];
        const activeWindow = currentWindows.find(item => item.active === true);
        if (activeWindow) activeWindow.active = false;

        dispatch({ type: "SET_CURRENT_WINDOWS", payload: updatedCurrentWindows });
    }

    const formattedTime = currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    return (
        <div className={`${styles.taskBar} flex justify-between`} data-label="taskbar">
            <button ref={startButton} className={`${styles.startButton}`} onClick={startButtonClickHandler} data-selected={isStartVisible}>Start</button>
            {isStartVisible && <StartMenu startButton={startButton} />}
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