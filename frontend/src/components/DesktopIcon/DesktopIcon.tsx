import { useRef } from "react";
import { useContext } from "../../context/context";
import applicationsJSON from "../../data/applications.json";
import { throttle } from "../../utils/general";
import { openApplication } from "../../utils/general";
import playSound from "../../utils/sounds";
import styles from "./DesktopIcon.module.scss";
import type { AbsoluteObject, Application } from "../../context/types";

type DesktopIconProps = {
    id: string | number;
    appId: string;
    position: AbsoluteObject;
    selectedIds: (string | number)[];
    setSelectedIds: (value: (string | number)[]) => void;
    moveIcons: (ids: (string | number)[], startRects: Record<string | number, { top: number; left: number }>, deltaX: number, deltaY: number) => void;
    // For saved files: a label override, the payload to reopen the app with, and
    // an icon image override (e.g. a thumbnail of the saved bitmap)
    label?: string;
    content?: unknown;
    iconSrc?: string;
};

const applications = applicationsJSON as unknown as Record<string, Application>;

const DesktopIcon = ({ appId, id, position, selectedIds, setSelectedIds, moveIcons, label, content, iconSrc }: DesktopIconProps) => {
    const { currentWindows, recycledItems, savedImages, dispatch } = useContext();
    const desktopIconRef = useRef<HTMLButtonElement | null>(null);
    const isActive = selectedIds.includes(id);
    const appData = applications[appId];
    const { title, name, icon, iconLarge, link } = { ...appData };

    const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
        if (!desktopIconRef.current) return;

        // Dragging one icon of a multi-selection moves the whole group
        const isGroupDrag = selectedIds.includes(id) && selectedIds.length > 1;
        const dragIds = (isGroupDrag) ? selectedIds : [id];
        if (!isGroupDrag) setSelectedIds([id]);

        const startRects: Record<string | number, { top: number; left: number }> = {};
        dragIds.forEach((dragId) => {
            const element = document.querySelector(`[data-icon-id="${dragId}"]`) as HTMLElement | null;
            if (!element) return;
            const rect = element.getBoundingClientRect();
            startRects[dragId] = { top: rect.top, left: rect.left };
        });

        const startX = event.clientX;
        const startY = event.clientY;
        let hasMoved = false;

        const onPointerMove = (moveEvent: PointerEvent) => {
            // Raise the dragged icons only once a drag begins, so a plain click
            // (selection) never briefly lifts the label above overlapping windows
            if (!hasMoved) {
                dragIds.forEach((dragId) => {
                    const element = document.querySelector(`[data-icon-id="${dragId}"]`) as HTMLElement | null;
                    if (element) element.style.zIndex = "1";
                });
            }
            hasMoved = true;
            moveIcons(dragIds, startRects, moveEvent.clientX - startX, moveEvent.clientY - startY);
            document.body.style.userSelect = "none";
        };
        const throttledPointerMove = throttle(onPointerMove, 50);

        // Also fired on pointercancel so an interrupted touch drag never leaves icons raised
        const endDrag = () => {
            window.removeEventListener("pointermove", throttledPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
            window.removeEventListener("pointercancel", endDrag);
            document.body.style.userSelect = "";
            dragIds.forEach((dragId) => {
                const element = document.querySelector(`[data-icon-id="${dragId}"]`) as HTMLElement | null;
                if (element) element.style.zIndex = "";
            });
        };

        const onPointerUp = (upEvent: PointerEvent) => {
            endDrag();
            if (!hasMoved) return;

            // The dragged icon sits under the cursor, so test the cursor against the bin's rect directly
            const bin = document.querySelector('[data-app-id="recycleBin"]');
            if (!bin) return;

            const binRect = bin.getBoundingClientRect();
            const isOverBin = upEvent.clientX >= binRect.left && upEvent.clientX <= binRect.right && upEvent.clientY >= binRect.top && upEvent.clientY <= binRect.bottom;
            if (!isOverBin) return;

            // Saved-image icons are flagged recycled by id (so they can be
            // restored from the bin); other icons are recycled by appId
            const savedToRecycle = dragIds.filter((dragId) => savedImages.some((image) => image.id === dragId));
            const binnedAppIds = dragIds
                .filter((dragId) => !savedToRecycle.includes(dragId))
                .map((dragId) => (document.querySelector(`[data-icon-id="${dragId}"]`) as HTMLElement)?.dataset.appId)
                .filter((itemAppId): itemAppId is string => !!itemAppId && itemAppId !== "recycleBin" && !recycledItems.includes(itemAppId));
            if (!savedToRecycle.length && !binnedAppIds.length) return;

            if (savedToRecycle.length) dispatch({ type: "SET_SAVED_IMAGES", payload: savedImages.map((image) => savedToRecycle.includes(image.id) ? { ...image, recycled: true } : image) });
            if (binnedAppIds.length) dispatch({ type: "SET_RECYCLED_ITEMS", payload: [...recycledItems, ...binnedAppIds] });
            playSound("recycle", true);
            setSelectedIds([]);
        };
        window.addEventListener("pointermove", throttledPointerMove);
        window.addEventListener("pointerup", onPointerUp);
        window.addEventListener("pointercancel", endDrag);
    };

    const onClickHandler = () => {
        if (!selectedIds.includes(id)) setSelectedIds([id]);

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

        openApplication(appId, currentWindows, dispatch, content);
        setSelectedIds([]);
    };

    const iconImage = iconSrc ?? iconLarge ?? icon;
    // The selection tint masks with the icon's own shape; a rectangular thumbnail
    // has no shape to mask, so skip it for saved-image icons
    const imageMask = (isActive && !iconSrc) ? `url("${iconLarge || icon}")` : "";

    return (
        <button ref={desktopIconRef} className={styles.desktopIcon} data-icon-id={id} data-app-id={appId} data-selected={isActive} data-link={!!link} onClick={onClickHandler} onPointerDown={onPointerDown} onDoubleClick={onDoubleClickHandler} style={{ top: position?.top, right: position?.right, bottom: position?.bottom, left: position?.left }}>
            <span style={{ maskImage: imageMask }}><img src={iconImage} width="50" draggable={false} style={iconSrc ? { padding: 0, width: "auto", height: "3rem", maxWidth: "5.5rem", objectFit: "contain", background: "#fff" } : undefined} /></span>
            <div className="relative w-full flex justify-center"><h4 className="text-center">{label ?? name ?? title}</h4></div>
        </button>
    );
};

export default DesktopIcon;
