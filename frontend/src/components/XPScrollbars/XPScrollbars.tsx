import React, { cloneElement, isValidElement, useCallback, useEffect, useRef, useState } from "react";
import styles from "./XPScrollbars.module.scss";
import type { ReactNode } from "react";

interface XPScrollbarsProps {
    children: ReactNode;
    className?: string;
    viewportClassName?: string;
    contentClassName?: string;
    /** When true the single child element (e.g. a textarea) is used as the scrolling viewport */
    bindToChild?: boolean;
}

interface ThumbState {
    size: number;
    offset: number;
}

const MIN_THUMB = 17;
const LINE_STEP = 40;
const REPEAT_DELAY = 350;
const REPEAT_INTERVAL = 60;

const XPScrollbars = ({ children, className, viewportClassName, contentClassName, bindToChild = false }: XPScrollbarsProps) => {
    const viewportRef = useRef<HTMLElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const verticalTrackRef = useRef<HTMLDivElement | null>(null);
    const horizontalTrackRef = useRef<HTMLDivElement | null>(null);
    const repeatTimersRef = useRef<{ delay?: ReturnType<typeof setTimeout>; interval?: ReturnType<typeof setInterval> }>({});
    const [isVerticalVisible, setIsVerticalVisible] = useState(false);
    const [isHorizontalVisible, setIsHorizontalVisible] = useState(false);
    const [verticalThumb, setVerticalThumb] = useState<ThumbState>({ size: 0, offset: 0 });
    const [horizontalThumb, setHorizontalThumb] = useState<ThumbState>({ size: 0, offset: 0 });

    const update = useCallback(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        const verticalNeeded = viewport.scrollHeight > viewport.clientHeight + 1;
        const horizontalNeeded = viewport.scrollWidth > viewport.clientWidth + 1;
        setIsVerticalVisible(verticalNeeded);
        setIsHorizontalVisible(horizontalNeeded);

        const verticalTrack = verticalTrackRef.current;
        if (verticalNeeded && verticalTrack) {
            const trackLength = verticalTrack.clientHeight;
            const size = Math.max(MIN_THUMB, trackLength * viewport.clientHeight / viewport.scrollHeight);
            const maxOffset = trackLength - size;
            const scrollableLength = viewport.scrollHeight - viewport.clientHeight;
            setVerticalThumb({ size, offset: (scrollableLength) ? maxOffset * viewport.scrollTop / scrollableLength : 0 });
        }

        const horizontalTrack = horizontalTrackRef.current;
        if (horizontalNeeded && horizontalTrack) {
            const trackLength = horizontalTrack.clientWidth;
            const size = Math.max(MIN_THUMB, trackLength * viewport.clientWidth / viewport.scrollWidth);
            const maxOffset = trackLength - size;
            const scrollableLength = viewport.scrollWidth - viewport.clientWidth;
            setHorizontalThumb({ size, offset: (scrollableLength) ? maxOffset * viewport.scrollLeft / scrollableLength : 0 });
        }
    }, []);

    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;

        update();
        viewport.addEventListener("scroll", update);
        viewport.addEventListener("input", update);

        const resizeObserver = new ResizeObserver(update);
        resizeObserver.observe(viewport);
        if (contentRef.current) resizeObserver.observe(contentRef.current);

        return () => {
            viewport.removeEventListener("scroll", update);
            viewport.removeEventListener("input", update);
            resizeObserver.disconnect();
        };
    }, [update]);

    // Bar visibility changes alter the viewport size; re-measure
    useEffect(update, [isVerticalVisible, isHorizontalVisible, update]);

    const stopRepeat = useCallback(() => {
        clearTimeout(repeatTimersRef.current.delay);
        clearInterval(repeatTimersRef.current.interval);
        window.removeEventListener("pointerup", stopRepeat);
    }, []);

    const scrollStep = (x: number, y: number) => {
        viewportRef.current?.scrollBy(x, y);
    };

    // Arrow buttons step once, then repeat while held
    const onArrowPointerDown = (x: number, y: number) => (event: React.PointerEvent) => {
        event.preventDefault();
        scrollStep(x, y);
        repeatTimersRef.current.delay = setTimeout(() => {
            repeatTimersRef.current.interval = setInterval(() => scrollStep(x, y), REPEAT_INTERVAL);
        }, REPEAT_DELAY);
        window.addEventListener("pointerup", stopRepeat);
    };

    useEffect(() => stopRepeat, [stopRepeat]);

    const onTrackPointerDown = (axis: "vertical" | "horizontal") => (event: React.PointerEvent<HTMLDivElement>) => {
        const viewport = viewportRef.current;
        if (!viewport || event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (axis === "vertical") {
            const direction = (event.clientY - rect.top < verticalThumb.offset) ? -1 : 1;
            viewport.scrollBy(0, direction * viewport.clientHeight * 0.9);
        } else {
            const direction = (event.clientX - rect.left < horizontalThumb.offset) ? -1 : 1;
            viewport.scrollBy(direction * viewport.clientWidth * 0.9, 0);
        }
    };

    const onThumbPointerDown = (axis: "vertical" | "horizontal") => (event: React.PointerEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const viewport = viewportRef.current;
        const track = (axis === "vertical") ? verticalTrackRef.current : horizontalTrackRef.current;
        if (!viewport || !track) return;

        const startPointer = (axis === "vertical") ? event.clientY : event.clientX;
        const startScroll = (axis === "vertical") ? viewport.scrollTop : viewport.scrollLeft;

        const onPointerMove = (moveEvent: PointerEvent) => {
            const pointer = (axis === "vertical") ? moveEvent.clientY : moveEvent.clientX;
            if (axis === "vertical") {
                const trackLength = track.clientHeight - verticalThumb.size;
                const scrollable = viewport.scrollHeight - viewport.clientHeight;
                if (trackLength > 0) viewport.scrollTop = startScroll + (pointer - startPointer) * scrollable / trackLength;
            } else {
                const trackLength = track.clientWidth - horizontalThumb.size;
                const scrollable = viewport.scrollWidth - viewport.clientWidth;
                if (trackLength > 0) viewport.scrollLeft = startScroll + (pointer - startPointer) * scrollable / trackLength;
            }
            document.body.style.userSelect = "none";
        };

        const onPointerUp = () => {
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
            document.body.style.userSelect = "";
        };
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    };

    const setViewportRef = (element: HTMLElement | null) => {
        viewportRef.current = element;
    };

    const viewport = (bindToChild && isValidElement(children))
        ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
            ref: setViewportRef,
            className: `${(children.props as Record<string, unknown>).className || ""} ${styles.viewport} ${viewportClassName || ""}`.trim(),
        })
        : (
            <div ref={setViewportRef as React.Ref<HTMLDivElement>} className={`${styles.viewport} ${viewportClassName || ""}`.trim()}>
                <div ref={contentRef} className={`${styles.content} ${contentClassName || ""}`.trim()}>{children}</div>
            </div>
        );

    return (
        <div className={`${styles.container} ${className || ""}`.trim()}>
            {viewport}
            {isVerticalVisible && (
                <div className={`${styles.bar} ${styles.vertical}`}>
                    <button className={styles.arrowUp} onPointerDown={onArrowPointerDown(0, -LINE_STEP)} tabIndex={-1} />
                    <div ref={verticalTrackRef} className={styles.track} onPointerDown={onTrackPointerDown("vertical")}>
                        <div className={styles.thumb} style={{ height: verticalThumb.size, transform: `translateY(${verticalThumb.offset}px)` }} onPointerDown={onThumbPointerDown("vertical")} />
                    </div>
                    <button className={styles.arrowDown} onPointerDown={onArrowPointerDown(0, LINE_STEP)} tabIndex={-1} />
                </div>
            )}
            {isHorizontalVisible && (
                <div className={`${styles.bar} ${styles.horizontal}`}>
                    <button className={styles.arrowLeft} onPointerDown={onArrowPointerDown(-LINE_STEP, 0)} tabIndex={-1} />
                    <div ref={horizontalTrackRef} className={styles.track} onPointerDown={onTrackPointerDown("horizontal")}>
                        <div className={styles.thumb} style={{ width: horizontalThumb.size, transform: `translateX(${horizontalThumb.offset}px)` }} onPointerDown={onThumbPointerDown("horizontal")} />
                    </div>
                    <button className={styles.arrowRight} onPointerDown={onArrowPointerDown(LINE_STEP, 0)} tabIndex={-1} />
                </div>
            )}
            {isVerticalVisible && isHorizontalVisible && <div className={styles.corner} />}
        </div>
    );
};

export default XPScrollbars;
