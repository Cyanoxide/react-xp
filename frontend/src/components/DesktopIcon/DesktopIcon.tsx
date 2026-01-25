import styles from "./DesktopIcon.module.scss";
import type { currentWindow } from "../../context/types";
import { useContext } from "../../context/context";
import { generateUniqueId } from "../../utils/general";
import { useState, useRef } from "react";

type DesktopIconProps = Omit<currentWindow, "id"> & {
    iconLarge?: string;
};

const DesktopIcon: React.FC<DesktopIconProps> = ({ title, iconLarge, icon, content }) => {
    const { currentWindows, dispatch } = useContext();
    const [isSelected, setIsSelected] = useState(false);
    const desktopIcon = useRef<HTMLDivElement | null>(null);

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
        <div ref={desktopIcon} className={styles.desktopIcon} data-selected={isSelected} onClick={onClickHandler} onDoubleClick={onDoubleClickHandler}>
            <span><img src={iconLarge || icon} width="50" height="50" /></span>
            <h4>{title}</h4>
        </div>
    );
};

export default DesktopIcon;