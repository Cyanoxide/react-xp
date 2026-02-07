import React, { Activity, useEffect, useState, useRef } from "react";
import { useContext } from "../../context/context";
import applicationsJSON from "../../data/applications.json";
import { getCurrentWindow } from "../../utils/general";
import StartMenu from "../StartMenu/StartMenu";
import Tooltip from "../Tooltip/Tooltip";
import styles from "./TaskBar.module.scss";
import type { Application } from "../../context/types";

const applications = applicationsJSON as unknown as Record<string, Application>;

const TaskBar = () => {
    const { currentTime, currentWindows, isStartVisible, dispatch } = useContext();
    const [systemTrayIconDismissed, setSystemTrayIconDismissed] = useState(false);
    const startButtonRef = useRef<HTMLButtonElement | null>(null);
    const startButton = startButtonRef.current;

    //Todo: Add more accurate clock that updates in sync with system clock
    useEffect(() => {
        const interval = setInterval(() => {
            dispatch({ type: "SET_CURRENT_TIME", payload: new Date() });
        }, 30_000);

        return () => clearInterval(interval);
    }, [dispatch]);

    const windowTabClickHandler = (event: React.MouseEvent<HTMLElement>) => {
        const windowTabSelector = "[data-label=taskBarWindowTab]";
        const windowTab = (event.target as HTMLElement).closest<HTMLElement>(windowTabSelector);
        if (!windowTab) return;

        const windowId = windowTab.dataset.windowId;
        if (!windowId) return;

        const updatedCurrentWindows = [...currentWindows];
        updatedCurrentWindows.map((currentWindow) => {
            if (windowId === currentWindow.id) {
                currentWindow.hidden = (currentWindow.active === true) ? true : false;
                currentWindow.active = (currentWindow.active === true) ? false : true;
            } else currentWindow.active = false;

        });
        dispatch({ type: "SET_CURRENT_WINDOWS", payload: updatedCurrentWindows });
    };

    const systemTrayIconClickHandler = () => {
        if (systemTrayIconDismissed) setSystemTrayIconDismissed(false);
    };

    const startButtonClickHandler = (event: React.MouseEvent) => {
        event?.stopPropagation();
        dispatch({ type: "SET_IS_START_VISIBLE", payload: (isStartVisible) ? false : true });

        const { currentWindow, updatedCurrentWindows } = getCurrentWindow(currentWindows);
        if (currentWindow) currentWindow.active = false;

        dispatch({ type: "SET_CURRENT_WINDOWS", payload: updatedCurrentWindows });
    };

    const formattedTime = currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    return (
        <div className={`${styles.taskBar} flex justify-between`} data-label="taskbar">
            <button ref={startButtonRef} className={`${styles.startButton}`} onClick={startButtonClickHandler} data-selected={isStartVisible}>Start</button>
            <Activity mode={isStartVisible ? "visible" : "hidden"}>
                <StartMenu startButton={startButton} />
            </Activity>
            <ul className={`${styles.windows} flex items-center justify-start w-full`}>
                {currentWindows.map((currentWindow, index) => {
                    const appData = applications[currentWindow.appId];
                    const { title, icon, iconLarge } = { ...appData };
                    return (
                        <li key={index} onClick={windowTabClickHandler} data-label="taskBarWindowTab" data-active={currentWindow.active} data-window-id={currentWindow.id}>
                            <span className="w-full relative flex">
                                <img src={icon || iconLarge} width="14" height="14" className="mr-2 min-w-5.5"></img>
                                <span className="absolute ml-7">{title}</span>
                            </span>
                        </li>
                    );
                })}
            </ul>
            <div className={`${styles.systemTray} flex justify-center items-center`}>
                <ul className="flex">
                    <li className=" flex relative">
                        <button onClick={systemTrayIconClickHandler}>
                            <img src="/icon__info.png" width="14" height="14" className="cursor-pointer mr-2 min-w-[14px]"></img>
                        </button>
                        <Tooltip heading="Windows XP React Edition" content="Still a work in progress, but this is a semi-authentic recreation of Windows XP created using React & Typescript." systemTrayIconDismissed={systemTrayIconDismissed} setSystemTrayIconDismissed={setSystemTrayIconDismissed} />
                    </li>
                </ul>
                <span className="whitespace-nowrap">{formattedTime}</span>
            </div>
        </div>
    );
};

export default TaskBar;