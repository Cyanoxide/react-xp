import styles from "./DesktopIcon.module.scss";
import type { currentWindow } from "../../context/types";
import { useContext } from "../../context/context";
import { generateUniqueId } from "../../utils/general";
import { useState, useRef } from "react";
import { throttle } from "../../utils/general";

type AbsoluteObject = {
    top?: number | undefined;
    right?: number | undefined;
    bottom?: number | undefined;
    left?: number | undefined;
}

type DesktopIconProps = AbsoluteObject & currentWindow & {
    iconLarge?: string;
    selectedId: string;
    id: string;
    setSelectedId: (value: string) => void;
};

const DesktopIcon: React.FC<DesktopIconProps> = ({ title, iconLarge, icon, content, top = undefined, right = undefined, bottom = undefined, left = undefined, id, selectedId, setSelectedId }) => {
    const { currentWindows, dispatch } = useContext();
    const [position, setPosition] = useState<AbsoluteObject>({ top, right, bottom, left });
    const desktopIcon = useRef<HTMLDivElement | null>(null);
    const isActive = id === selectedId;

    const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        const desktopIconRect = desktopIcon.current?.getBoundingClientRect();
        if (!desktopIconRect) return;

        const xOffset = event.clientX - desktopIconRect.left;
        const yOffset = event.clientY - desktopIconRect.top;
        setSelectedId(id);

        const onPointerMove = (event: PointerEvent) => {
            setPosition({
                top: event.clientY - yOffset,
                left: event.clientX - xOffset,
            });
            document.body.style.userSelect = "none";
            setSelectedId(id);
        }
        const throttledPointerMove = throttle(onPointerMove, 50);

        const onPointerUp = () => {
            window.removeEventListener("pointermove", throttledPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
            document.body.style.userSelect = "";
        }
        window.addEventListener("pointermove", throttledPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    }

    const onClickHandler = () => {
        setSelectedId(id);

        const onSecondClick = (event: PointerEvent) => {
            const target = (event.target as HTMLElement);
            if (event.target && target.closest("[data-selected") === desktopIcon.current) return;
            setSelectedId("");
            window.removeEventListener("pointerdown", onSecondClick);
        }

        window.addEventListener("pointerdown", onSecondClick);
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
        setSelectedId("");
    }

    const imageMask = (isActive) ? `url("${iconLarge || icon}")` : "";

    return (
        <div ref={desktopIcon} className={styles.desktopIcon} data-selected={isActive} onClick={onClickHandler} onPointerDown={(e) => onPointerDown(e)} onDoubleClick={onDoubleClickHandler} style={{ top: position.top, right: position.right, bottom: position.bottom, left: position.left }}>
            <span style={{ maskImage: imageMask }}><img src={iconLarge || icon} width="50" height="50" draggable={false} /></span>
            <h4>{title}</h4>
        </div>
    );
};

export default DesktopIcon;