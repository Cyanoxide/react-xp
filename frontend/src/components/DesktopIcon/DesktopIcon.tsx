import styles from "./DesktopIcon.module.scss";
import type { currentWindow } from "../../context/types";
import { useContext } from "../../context/context";
import { generateUniqueId } from "../../utils/general";
import { useState, useRef } from "react";
import { throttle } from "../../utils/general";

type DesktopIconProps = Omit<currentWindow, "id"> & {
    iconLarge?: string;
};

const DesktopIcon: React.FC<DesktopIconProps> = ({ title, iconLarge, icon, content }) => {
    const { currentWindows, dispatch } = useContext();
    const [isSelected, setIsSelected] = useState(false);
    const [position, setPosition] = useState<number[]>([]);
    const desktopIcon = useRef<HTMLDivElement | null>(null);

    const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        const desktopIconRect = desktopIcon.current?.getBoundingClientRect();
        if (!desktopIconRect) return;

        const xOffset = event.clientX - desktopIconRect.left;
        const yOffset = event.clientY - desktopIconRect.top;
        setIsSelected(true);

        const onMouseMove = (event: MouseEvent) => {
            setPosition([event.clientX - xOffset, event.clientY - yOffset]);
            document.body.style.userSelect = "none";
        }
        const throttledMouseMove = throttle(onMouseMove, 50);

        const onMouseUp = () => {
            window.removeEventListener("mousemove", throttledMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            document.body.style.userSelect = "";
        }
        window.addEventListener("mousemove", throttledMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }

    const onClickHandler = () => {
        setIsSelected(true);

        const onSecondClick = (event: PointerEvent) => {
            const target = (event.target as HTMLElement);
            if (event.target && target.closest("[data-selected") === desktopIcon.current) return;
            setIsSelected(false);
            window.removeEventListener("click", onSecondClick);
        }

        window.addEventListener("click", onSecondClick);
    }

    const onDoubleClickHandler = () => {
        const newWindow: currentWindow = {
            id: generateUniqueId(),
            active: true,
            title,
            icon,
            content,
        }

        const updatedCurrentWindows = [...currentWindows];
        updatedCurrentWindows.push(newWindow);
        dispatch({ type: "SET_CURRENT_WINDOWS", payload: updatedCurrentWindows });
        setIsSelected(false);
    }

    return (
        <div ref={desktopIcon} className={styles.desktopIcon} data-selected={isSelected} onClick={onClickHandler} onPointerDown={(e) => onPointerDown(e)} onDoubleClick={onDoubleClickHandler} style={{ left: position[0], top: position[1] }}>
            <span><img src={iconLarge || icon} width="50" height="50" draggable={false}/></span>
            <h4>{title}</h4>
        </div>
    );
};

export default DesktopIcon;