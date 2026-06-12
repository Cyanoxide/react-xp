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

const Desktop = () => {
    const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);
    const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
    const desktopRef = useRef<HTMLDivElement | null>(null);
    const next = (() => { let count = 0; return () => ++count; })();

    const desktopItems = Files["desktop"];

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
            {desktopItems.map((item) => {
                const [ id, {top=undefined, right=undefined, bottom=undefined, left=undefined}] = item;
                const itemId = next();

                return (
                    <DesktopIcon key={itemId} id={itemId} appId={id} top={top} right={right} bottom={bottom} left={left} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />
                );
            })}
            {selectionRect && <div className={styles.selectionRect} style={{ top: selectionRect.top, left: selectionRect.left, width: selectionRect.width, height: selectionRect.height }} />}
        </div>
    );
};

export default Desktop;
