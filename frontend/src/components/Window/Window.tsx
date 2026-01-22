import styles from "./Window.module.scss";
import { useState } from "react";

const Window = () => {
    const [[windowPositionX, windowPositionY], setWindowPosition] = useState([5, 5]);

    const onTitleBarPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        const activeWindow = event.currentTarget.closest("[data-label=window]")?.getBoundingClientRect();
        const taskBarHeight = document.querySelector("[data-label=taskbar]")?.getBoundingClientRect().height;
        if (!activeWindow || !taskBarHeight) return;

        const windowOffsetX = event.clientX - activeWindow.left;
        const windowOffsetY = event.clientY - activeWindow.top;

        const mouseMove = (event: MouseEvent) => {
            if (event.clientY <= 0 || event.clientY > window.innerHeight - taskBarHeight) return;

            setWindowPosition([event.clientX - windowOffsetX, event.clientY - windowOffsetY]);
            document.body.style.userSelect = "none";
        }

        const mouseUp = () => {
            window.removeEventListener("mouseup", mouseUp);
            window.removeEventListener("mousemove", mouseMove);
            document.body.style.userSelect = "";
        }

        window.addEventListener("mousemove", mouseMove);
        window.addEventListener("mouseup", mouseUp);
    }

    return (
        <>
            <div className={`${styles.window} absolute`} data-label="window" style={{ left: windowPositionX, top: windowPositionY }}>
                <div className={`${styles.titleBar} flex justify-between`} onPointerDown={(e) => onTitleBarPointerDown(e)}>
                    <div className="flex items-center">
                        <img src="/icon__documents.png" width="14" height="14" className="mx-2 min-w-[14px]"></img>
                        <h3>My Documents</h3>
                    </div>
                    <div className="flex">
                        <button data-button="minimize">Minimise</button>
                        <button data-button="maximize">Maximise</button>
                        <button data-button="close">Close</button>
                    </div>
                </div>
                <div className={`${styles.windowContent}`} style={{ height: 200 + "px", width: 500 + "px", background: "#fff" }}></div>
            </div>
        </>
    )
};

export default Window;