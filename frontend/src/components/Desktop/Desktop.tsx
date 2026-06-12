import { useRef, useState } from "react";
import filesJSON from "../../data/files.json";
import { throttle } from "../../utils/general";
import DesktopIcon from "../DesktopIcon/DesktopIcon";
import styles from "./Desktop.module.scss";
import type { AbsoluteObject } from "../../context/types";

const Files = filesJSON as unknown as Record<string, [string, AbsoluteObject][]>;

interface SelectionRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

const desktopItems = Files["desktop"].map(([appId, position], index) => ({
    itemId: index + 1,
    appId,
    position,
}));

const Desktop = () => {
    const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);
    const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
    const [positions, setPositions] = useState<Record<string | number, AbsoluteObject>>(() =>
        Object.fromEntries(desktopItems.map(({ itemId, position }) => [itemId, position]))
    );
    const desktopRef = useRef<HTMLDivElement | null>(null);

    // Moves every icon in the drag group, keeping their relative offsets
    const moveIcons = (ids: (number | string)[], startRects: Record<string | number, { top: number; left: number }>, deltaX: number, deltaY: number) => {
        setPositions((prev) => {
            const updated = { ...prev };
            ids.forEach((id) => {
                const start = startRects[id];
                if (start) updated[id] = { top: start.top + deltaY, left: start.left + deltaX };
            });
            return updated;
        });
    };

    const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        // Only begin a marquee from the desktop background itself
        if (event.target !== event.currentTarget) return;

        const startX = event.clientX;
        const startY = event.clientY;
        setSelectedIds([]);
        setSelectionRect({ top: startY, left: startX, width: 0, height: 0 });
        document.body.style.userSelect = "none";

        const onPointerMove = (moveEvent: PointerEvent) => {
            const rect = {
                left: Math.min(startX, moveEvent.clientX),
                top: Math.min(startY, moveEvent.clientY),
                width: Math.abs(moveEvent.clientX - startX),
                height: Math.abs(moveEvent.clientY - startY),
            };
            setSelectionRect(rect);

            const icons = desktopRef.current?.querySelectorAll<HTMLElement>("[data-icon-id]") ?? [];
            const intersecting: (number | string)[] = [];
            icons.forEach((icon) => {
                const iconRect = icon.getBoundingClientRect();
                const overlaps = iconRect.left < rect.left + rect.width &&
                    iconRect.right > rect.left &&
                    iconRect.top < rect.top + rect.height &&
                    iconRect.bottom > rect.top;
                if (overlaps && icon.dataset.iconId) intersecting.push(Number(icon.dataset.iconId));
            });
            setSelectedIds(intersecting);
        };
        const throttledPointerMove = throttle(onPointerMove, 30);

        const onPointerUp = () => {
            window.removeEventListener("pointermove", throttledPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
            document.body.style.userSelect = "";
            setSelectionRect(null);
        };
        window.addEventListener("pointermove", throttledPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    };

    return (
        <div ref={desktopRef} className={styles.desktop} onPointerDown={onPointerDown}>
            {desktopItems.map(({ itemId, appId }) => (
                <DesktopIcon key={itemId} id={itemId} appId={appId} position={positions[itemId]} selectedIds={selectedIds} setSelectedIds={setSelectedIds} moveIcons={moveIcons} />
            ))}
            {selectionRect && <div className={styles.selectionRect} style={{ top: selectionRect.top, left: selectionRect.left, width: selectionRect.width, height: selectionRect.height }} />}
        </div>
    );
};

export default Desktop;
