import styles from "./Window.module.scss";
import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { useContext } from "../../context/context";
import { throttle, updateCurrentActiveWindow } from "../../utils/general";
import { getWindowPadding, getMinimumWindowSize, getWindowClickRegion } from "../../utils/window";
import type { currentWindow } from "../../context/types";

interface WindowProps extends currentWindow {
    children: ReactNode;
}

const THROTTLE_DELAY = 50;
const taskBarHeight = document.querySelector("[data-label=taskbar]")?.getBoundingClientRect().height || 0;

const Window: React.FC<WindowProps> = ({ ...props }) => {
    const { currentWindows, dispatch } = useContext();

    const { icon, title, id, active, hidden, children, left, top, width, height } = props;

    const [[windowPositionX, windowPositionY], setWindowPosition] = useState([left, top]);
    const [[windowWidth, windowHeight], setWindowSize] = useState([width, height]);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
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

    const onTitleBarPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        const activeWindowRect = activeWindow.current?.getBoundingClientRect();
        if (!activeWindowRect) return;

        const windowOffsetX = event.clientX - activeWindowRect.left;
        const windowOffsetY = event.clientY - activeWindowRect.top;

        const onMouseMove = (event: MouseEvent) => {
            if (event.clientY <= 0 || event.clientY > window.innerHeight - taskBarHeight) return;

            setWindowPosition([event.clientX - windowOffsetX, event.clientY - windowOffsetY]);
            document.body.style.userSelect = "none";
        }
        const throttledMouseMove = throttle(onMouseMove, THROTTLE_DELAY);

        const onMouseUp = () => {
            window.removeEventListener("mousemove", throttledMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            document.body.style.userSelect = "";
        }


        window.addEventListener("mousemove", throttledMouseMove);
        window.addEventListener("mouseup", onMouseUp);
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
        const MIN_WINDOW_HEIGHT = activeTitleBarHeight + WINDOW_PADDING;
        const activeWindowRegion = getWindowClickRegion(event, activeWindow.current, WINDOW_PADDING);
        document.body.style.userSelect = "none";

        const onMouseMove = (event: MouseEvent) => {
            let width = windowWidth;
            let height = windowHeight;
            let x = windowPositionX;
            let y = windowPositionY;

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

            setWindowPosition([x, y]);
            setWindowSize([width, height]);
        }
        const throttledMouseMove = throttle(onMouseMove, THROTTLE_DELAY);

        const mouseUp = () => {
            window.removeEventListener("mousemove", throttledMouseMove);
            window.removeEventListener("mouseup", mouseUp);
            document.body.style.userSelect = "";
        }

        window.addEventListener("mousemove", throttledMouseMove);
        window.addEventListener("mouseup", mouseUp);
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
    }

    return (
        <>
            <div ref={activeWindow} data-window-id={id} data-active={active} data-hidden={hidden} data-label="window" className={`${styles.window} absolute`} style={{ left: windowPositionX, top: windowPositionY, height: windowHeight + "px", width: windowWidth + "px" }} onPointerDown={(e) => onWindowPointerDown(e)}>
                <div className="w-full h-full pointer-events-none">
                    <div ref={titleBar} className={`${styles.titleBar} flex justify-between pointer-events-auto`} data-label="titlebar" onPointerDown={(e) => onTitleBarPointerDown(e)}>
                        <div className="flex items-center">
                            <img src={icon} width="14" height="14" className="mx-2 min-w-[14px]"></img>
                            <h3>{title}</h3>
                        </div>
                        <div className="flex">
                            <button onClick={(e) => onButtonClick(e)} data-button="minimize">Minimise</button>
                            <button onClick={(e) => onButtonClick(e)} data-button="maximize" data-maximized={isMaximized}>Maximise</button>
                            <button onClick={(e) => onButtonClick(e)} data-button="close">Close</button>
                        </div>
                    </div>
                    <div className={`${styles.windowContent} pointer-events-auto`} style={{ height: "calc(100% - 2.5rem)", width: "100%", background: "#fff" }}>{children}</div>
                </div>
            </div>
        </>
    )
};

export default Window;