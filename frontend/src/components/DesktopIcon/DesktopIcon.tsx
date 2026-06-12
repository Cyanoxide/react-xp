import { useState, useRef } from "react";
import { useContext } from "../../context/context";
import applicationsJSON from "../../data/applications.json";
import { throttle } from "../../utils/general";
import { openApplication } from "../../utils/general";
import styles from "./DesktopIcon.module.scss";
import type { AbsoluteObject, Application } from "../../context/types";

type DesktopIconProps = AbsoluteObject & {
    id: string | number;
    appId: string;
    selectedIds: (string | number)[];
    setSelectedIds: (value: (string | number)[]) => void;
};

const applications = applicationsJSON as unknown as Record<string, Application>;

const DesktopIcon = ({ appId, top = undefined, right = undefined, bottom = undefined, left = undefined, id, selectedIds, setSelectedIds }: DesktopIconProps) => {
    const { currentWindows, dispatch } = useContext();
    const [position, setPosition] = useState<AbsoluteObject>({ top, right, bottom, left });
    const desktopIconRef = useRef<HTMLButtonElement | null>(null);
    const desktopIcon = desktopIconRef.current;
    const isActive = selectedIds.includes(id);
    const appData = applications[appId];
    const { title, icon, iconLarge, link } = { ...appData };

    const select = () => {
        // Keep a marquee multi-selection intact when grabbing one of its icons
        if (!selectedIds.includes(id)) setSelectedIds([id]);
    };

    const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
        const desktopIconRect = desktopIcon?.getBoundingClientRect();
        if (!desktopIconRect) return;

        const xOffset = event.clientX - desktopIconRect.left;
        const yOffset = event.clientY - desktopIconRect.top;
        select();

        const onPointerMove = (event: PointerEvent) => {
            setPosition({
                top: event.clientY - yOffset,
                left: event.clientX - xOffset,
            });
            document.body.style.userSelect = "none";
        };
        const throttledPointerMove = throttle(onPointerMove, 50);

        const onPointerUp = () => {
            window.removeEventListener("pointermove", throttledPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
            document.body.style.userSelect = "";
        };
        window.addEventListener("pointermove", throttledPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    };

    const onClickHandler = () => {
        select();

        const onSecondClick = (event: PointerEvent) => {
            const target = (event.target as HTMLElement);
            if (event.target && target.closest("[data-icon-id]")) return;
            setSelectedIds([]);
            window.removeEventListener("pointerdown", onSecondClick);
        };

        window.addEventListener("pointerdown", onSecondClick);
    };

    const onDoubleClickHandler = () => {
        if (link) return window.open(link, "_blank", "noopener,noreferrer");

        openApplication(appId, currentWindows, dispatch);
        setSelectedIds([]);
    };

    const imageMask = (isActive) ? `url("${iconLarge || icon}")` : "";

    return (
        <button ref={desktopIconRef} className={styles.desktopIcon} data-icon-id={id} data-selected={isActive} data-link={!!link} onClick={onClickHandler} onPointerDown={onPointerDown} onDoubleClick={onDoubleClickHandler} style={{ top: position.top, right: position.right, bottom: position.bottom, left: position.left }}>
            <span style={{ maskImage: imageMask }}><img src={iconLarge || icon} width="50" draggable={false} /></span>
            <div className="relative w-full flex justify-center"><h4 className="text-center">{title}</h4></div>
        </button>
    );
};

export default DesktopIcon;
