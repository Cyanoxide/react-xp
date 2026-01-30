import styles from "./DesktopIcon.module.scss";
import type { AbsoluteObject, Application } from "../../context/types";
import { useContext } from "../../context/context";
import { useState, useRef } from "react";
import { throttle } from "../../utils/general";
import applicationsJSON from "../../data/applications.json";
import { openApplication } from "../../utils/general";

type DesktopIconProps = AbsoluteObject & {
    id: string | number;
    appId: string;
    selectedId: string | number;
    setSelectedId: (value: string | number) => void;
};

const applications = applicationsJSON as unknown as Record<string, Application>;

const DesktopIcon = ({ appId, top = undefined, right = undefined, bottom = undefined, left = undefined, id, selectedId, setSelectedId }: DesktopIconProps) => {
    const { currentWindows, dispatch } = useContext();
    const [position, setPosition] = useState<AbsoluteObject>({ top, right, bottom, left });
    const desktopIcon = useRef<HTMLDivElement | null>(null);
    const isActive = id === selectedId;
    const appData = applications[appId];
    const { title, icon, iconLarge, link } = { ...appData };

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
        if (link) return window.open(link, "_blank", "noopener,noreferrer");

        openApplication(appId, currentWindows, dispatch);
        setSelectedId("");
    }

    const imageMask = (isActive) ? `url("${iconLarge || icon}")` : "";

    return (
        <div ref={desktopIcon} className={styles.desktopIcon} data-selected={isActive} data-link={!!link} onClick={onClickHandler} onPointerDown={onPointerDown} onDoubleClick={onDoubleClickHandler} style={{ top: position.top, right: position.right, bottom: position.bottom, left: position.left }}>
            <span style={{ maskImage: imageMask }}><img src={iconLarge || icon} width="50" height="50" draggable={false} /></span>
            <h4 className="text-center">{title}</h4>
        </div>
    );
};

export default DesktopIcon;