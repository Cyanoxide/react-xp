import styles from "./Window.module.scss";
import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { useContext } from "../../context/context";
import { throttle, updateCurrentActiveWindow } from "../../utils/general";
import { getWindowPadding, getMinimumWindowSize, getWindowClickRegion } from "../../utils/window";
import type { Application, currentWindow } from "../../context/types";
import applicationsJSON from "../../data/applications.json";

interface WindowProps extends currentWindow {
    children: ReactNode;
}

const THROTTLE_DELAY = 50;
const taskBarHeight = document.querySelector("[data-label=taskbar]")?.getBoundingClientRect().height || 0;
const applications = applicationsJSON as unknown as Record<string, Application>;

const Window = ({ ...props }: WindowProps) => {
    const { id, appId, children, active = false, hidden = false } = props;
    const { title, icon, iconLarge, width = 500, height = 350, top = 75, right = undefined, bottom = undefined, left = 100 } = { ...applications[appId] };
    const { currentWindows, dispatch } = useContext();
    const isBiggerThanViewport = (width < window.innerWidth);
    const [{ top: topPos, right: rightPos, bottom: bottomPos, left: leftPos }, setWindowPosition] = useState({ top: (isBiggerThanViewport) ? top : 0, left: (isBiggerThanViewport) ? left : 0, right, bottom });

    const offset = (leftPos + width) - window.innerWidth;
    const [[windowWidth, windowHeight], setWindowSize] = useState([Math.min(width, width - offset), height]);
    const [isMaximized, setIsMaximized] = useState(false);
    const [unmaximizedValues, setUnmaximizedValues] = useState({ left: "", top: "", width: "", height: "" });
    const activeWindow = useRef<HTMLDivElement | null>(null);
    const titleBar = useRef<HTMLDivElement | null>(null);

    const isWindowMaximized = (
        activeWindow.current?.style?.left === "0px"
        && activeWindow.current?.style?.top === "0px"
        && activeWindow.current?.style?.width === "100%"
        && activeWindow.current?.style?.height === (window.innerHeight - taskBarHeight) + "px"
    );

    useEffect(() => {
        if (!activeWindow.current) return;
        if (!isWindowMaximized) setIsMaximized(false);
        activeWindow.current.dataset.maximized = isMaximized.toString();

    }, [isWindowMaximized, isMaximized, setIsMaximized]);

    useEffect(() => {
        const onResize = () => {
            setWindowSize((prev) => [Math.min(width, width - offset), prev[1]]);
        }
        window.addEventListener("resize", onResize);
    }, [offset, width]);

    const toggleMaximizeWindow = (activeWindow: React.RefObject<HTMLDivElement | null>) => {
        if (!activeWindow.current) return;
        if (isMaximized) setIsMaximized(false);
        else {
            setIsMaximized(true);
            setUnmaximizedValues({
                left: activeWindow.current.style.left,
                top: activeWindow.current.style.top,
                width: activeWindow.current.style.width,
                height: activeWindow.current.style.height,
            });
        }

        activeWindow.current.style.left = (isMaximized) ? unmaximizedValues.left : "0px";
        activeWindow.current.style.top = (isMaximized) ? unmaximizedValues.top : "0px";
        activeWindow.current.style.width = (isMaximized) ? unmaximizedValues.width : "100%";
        activeWindow.current.style.height = (isMaximized) ? unmaximizedValues.height : window.innerHeight - taskBarHeight + "px";
    }

    const onTitleBarPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        const activeWindowRect = activeWindow.current?.getBoundingClientRect();
        if (!activeWindowRect) return;

        const windowOffsetX = event.clientX - activeWindowRect.left;
        const windowOffsetY = event.clientY - activeWindowRect.top;
        if (activeWindow.current) activeWindow.current.style.transition = "none";

        const onPointerMove = (event: PointerEvent) => {
            if (isMaximized || event.clientY <= 0 || event.clientY > window.innerHeight - taskBarHeight) return;

            setWindowPosition({ top: event.clientY - windowOffsetY, left: event.clientX - windowOffsetX, right: undefined, bottom: undefined });
            document.body.style.userSelect = "none";
        }
        const onThrottledPointerMove = throttle(onPointerMove, THROTTLE_DELAY);

        const onPointerUp = () => {
            window.removeEventListener("pointermove", onThrottledPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
            document.body.style.userSelect = "";
            if (activeWindow.current) activeWindow.current.style.removeProperty("transition");
        }
        window.addEventListener("pointermove", onThrottledPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    }

    const onWindowPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        const updatedCurrentWindows = updateCurrentActiveWindow(id, currentWindows);
        dispatch({ type: "SET_CURRENT_WINDOWS", payload: updatedCurrentWindows });

        if (event.currentTarget !== event.target) return;

        const activeWindowRect = activeWindow.current?.getBoundingClientRect();
        const activeTitleBarHeight = titleBar.current?.getBoundingClientRect().height || 0;

        if (!activeWindow.current || !activeWindowRect) return;

        const WINDOW_PADDING = getWindowPadding(activeWindow.current);
        const MIN_WINDOW_WIDTH = getMinimumWindowSize(activeWindow.current);
        const MIN_WINDOW_HEIGHT = activeTitleBarHeight + (WINDOW_PADDING * 1.5);
        const activeWindowRegion = getWindowClickRegion(event, activeWindow.current, WINDOW_PADDING);
        document.body.style.userSelect = "none";
        if (activeWindow.current) activeWindow.current.style.transition = "none";

        const onPointerMove = (event: MouseEvent) => {
            let width = windowWidth;
            let height = windowHeight;
            let x = leftPos;
            let y = topPos;

            if (activeWindowRegion.includes("right")) {
                width = event.clientX - activeWindowRect.left;
            }

            if (activeWindowRegion.includes("left")) {
                width = Math.max((activeWindowRect.right - event.clientX), MIN_WINDOW_WIDTH);
                x = activeWindowRect.right - width;
            }

            if (activeWindowRegion.includes("bottom")) {
                height = Math.max((event.clientY - activeWindowRect.top), MIN_WINDOW_HEIGHT);
            }

            if (activeWindowRegion.includes("top")) {
                height = Math.max((activeWindowRect.bottom - event.clientY), MIN_WINDOW_HEIGHT);
                y = activeWindowRect.bottom - height;
            }

            setWindowPosition({ top: y, left: x, right: undefined, bottom: undefined });
            setWindowSize([width, height]);
        }
        const onThrottledPointerMove = throttle(onPointerMove, THROTTLE_DELAY);

        const onPointerUp = () => {
            window.removeEventListener("pointermove", onThrottledPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
            document.body.style.userSelect = "";
            if (activeWindow.current) activeWindow.current.style.removeProperty("transition");
        }

        window.addEventListener("pointermove", onThrottledPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    }

    const onButtonClick = (event: React.MouseEvent<HTMLElement>) => {
        const buttonType = event.currentTarget.dataset.button;
        if (!activeWindow.current) return;

        if (buttonType === "close") {
            const updatedCurrentWindows = currentWindows.filter(item => item.id !== activeWindow.current?.dataset.windowId);
            dispatch({ type: "SET_CURRENT_WINDOWS", payload: updatedCurrentWindows });
        }

        if (buttonType === "minimize") {
            const updatedCurrentWindows = [...currentWindows];
            const currentWindow = updatedCurrentWindows.find((currentWindow) => currentWindow.id === id);

            if (currentWindow) {
                currentWindow.hidden = true;
                currentWindow.active = false;
            }

            dispatch({ type: "SET_CURRENT_WINDOWS", payload: updatedCurrentWindows });
        }

        if (buttonType === "maximize") {
            toggleMaximizeWindow(activeWindow);
        }
    }

    return (
        <>
            <div ref={activeWindow} data-window-id={id} data-active={active} data-hidden={hidden} data-label="window" className={`${styles.window} absolute`} style={{ top: (!bottomPos) ? topPos : undefined, right: rightPos, bottom: bottomPos, left: (!rightPos) ? leftPos : undefined, height: windowHeight + "px", width: windowWidth + "px" }} onPointerDown={onWindowPointerDown}>
                <div className="w-full h-full pointer-events-none">
                    <div ref={titleBar} className={`${styles.titleBar} flex justify-between pointer-events-auto`} data-label="titlebar" onPointerDown={onTitleBarPointerDown} onDoubleClick={() => toggleMaximizeWindow(activeWindow)}>
                        <div className="flex items-center">
                            <img src={icon || iconLarge} width="14" height="14" className="mx-2 min-w-[14px]"></img>
                            <h3>{title}</h3>
                        </div>
                        <div className="flex">
                            <button onClick={onButtonClick} data-button="minimize">Minimise</button>
                            <button onClick={onButtonClick} data-button="maximize" data-maximized={isMaximized}>Maximise</button>
                            <button onClick={onButtonClick} data-button="close">Close</button>
                        </div>
                    </div>
                    <div className={`${styles.windowContent} pointer-events-auto flex flex-col`} style={{ height: "calc(100% - 2.5rem)", width: "100%", background: "#fff" }}>{children}</div>
                </div>
            </div>
        </>
    )
};

export default Window;