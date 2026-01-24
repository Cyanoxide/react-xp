export const getRegionPosition = (position: number, size: number, edgePadding: number) => {
    if (position <= edgePadding) return "start";
    if (position >= size - edgePadding) return "end";
    return "center";
}

export const getWindowClickRegion = (event: React.PointerEvent<HTMLDivElement>, element: Element, edgePadding: number) => {
    const { left, top, width, height } = element.getBoundingClientRect();

    const x = event.clientX - left;
    const y = event.clientY - top;

    let vertical = "";
    let horizontal = "";

    const horizontalPosition = getRegionPosition(x, width, edgePadding);
    const verticalPosition = getRegionPosition(y, height, edgePadding);

    if (verticalPosition === "start") vertical = "top";
    else if (verticalPosition === "end") vertical = "bottom";

    if (horizontalPosition === "start") horizontal = "left";
    else if (horizontalPosition === "end") horizontal = "right";

    let region = vertical;
    if (horizontal) region = region ? `${region}-${horizontal}` : horizontal;

    return region || "center";
}

export const getWindowPadding = (window: Element) => {
    const styles = getComputedStyle(window) || 0;
    const paddingLeft = parseFloat(styles.paddingLeft) || 0;
    const paddingRight = parseFloat(styles.paddingRight) || 0;
    const gap = parseFloat(styles.gap) || 0;

    return paddingLeft + gap + paddingRight;
}

export const getMinimumWindowSize = (window: Element) => {
    const titleBar = window?.querySelector("[data-label=titlebar]");
    if (!titleBar) return 0;

    const windowPadding = getWindowPadding(window);
    const internalWhiteSpace = getWindowPadding(titleBar);
    let minWidth = internalWhiteSpace;

    titleBar?.childNodes.forEach((element) => {
        if (element instanceof HTMLElement) {
            minWidth = minWidth + element.offsetWidth;
        }
    });

    return minWidth + windowPadding;
}