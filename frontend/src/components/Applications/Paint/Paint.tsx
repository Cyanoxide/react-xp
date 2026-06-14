import { useEffect, useRef, useState } from "react";
import WindowMenu from "../../WindowMenu/WindowMenu";
import XPScrollbars from "../../XPScrollbars/XPScrollbars";
import styles from "./Paint.module.scss";
import type { PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from "react";

type Tool =
    | "freeSelect" | "select" | "eraser" | "fill" | "eyedropper" | "magnifier"
    | "pencil" | "brush" | "airbrush" | "text" | "line" | "curve"
    | "rectangle" | "polygon" | "ellipse" | "roundRectangle";

interface ToolDef {
    id: Tool;
    title: string;
}

// Tools in the same left-to-right order as spritemap__paint-tools.png.
const TOOLS: ToolDef[] = [
    { id: "freeSelect", title: "Free-Form Select" },
    { id: "select", title: "Select" },
    { id: "eraser", title: "Eraser/Color Eraser" },
    { id: "fill", title: "Fill With Color" },
    { id: "eyedropper", title: "Pick Color" },
    { id: "magnifier", title: "Magnifier" },
    { id: "pencil", title: "Pencil" },
    { id: "brush", title: "Brush" },
    { id: "airbrush", title: "Airbrush" },
    { id: "text", title: "Text" },
    { id: "line", title: "Line" },
    { id: "curve", title: "Curve" },
    { id: "rectangle", title: "Rectangle" },
    { id: "polygon", title: "Polygon" },
    { id: "ellipse", title: "Ellipse" },
    { id: "roundRectangle", title: "Rounded Rectangle" },
];

// Icons come from a single-row spritemap (16 icons, evenly ~50px apart, varying
// widths). Each cell is [startX, width] in source pixels, measured from the gap
// midpoints so a cell's edges fall in the blank gaps and no neighbour bleeds in.
// The sheet is scaled by height, so every icon shares one scale and the wider
// shapes (rectangle, fill) stay proportionally wider — as in the real toolbox.
const SPRITE_W = 2517;
const SPRITE_H = 129;
const ICON_H = 16;
const SCALE = ICON_H / SPRITE_H;
const CELLS: Array<[number, number]> = [
    [0, 152], [152, 170], [322, 165], [487, 180], [667, 179], [846, 170], [1016, 122], [1138, 122],
    [1260, 179], [1439, 163], [1602, 164], [1766, 100], [1866, 171], [2037, 163], [2200, 171], [2371, 146],
];

// Tools whose options box shows a line-width picker (matches Paint, where the
// pencil/select/fill/text/pick/magnifier have no width option).
const WIDTH_TOOLS = new Set<Tool>(["brush", "eraser", "airbrush", "line", "curve", "rectangle", "polygon", "ellipse", "roundRectangle"]);

// The classic Windows Paint 28-colour palette (two rows of fourteen).
const PALETTE = [
    "#000000", "#808080", "#800000", "#808000", "#008000", "#008080", "#000080", "#800080", "#808040", "#004040", "#0080ff", "#004080", "#8000ff", "#804000",
    "#ffffff", "#c0c0c0", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ffff80", "#00ff80", "#80ffff", "#8080ff", "#ff0080", "#ff8040",
];

const SIZES = [1, 2, 3, 5, 8];

// Bottom-right resize grip: six bevelled squares in a 3-2-1 staircase whose
// right angle points into the corner. Each entry is a dark square's top-left
// (a white highlight is drawn one pixel down-right of it).
const GRIP: Array<[number, number]> = [[5, 13], [9, 13], [13, 13], [9, 9], [13, 9], [13, 5]];

const hexToRgba = (hex: string): [number, number, number, number] => {
    const v = hex.replace("#", "");
    return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16), 255];
};

const rgbToHex = (r: number, g: number, b: number) =>
    "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");

// Scanline flood fill with a small tolerance (for anti-aliased edges) and a
// visited mask so a near-match fill colour can't cause it to loop forever.
const floodFill = (ctx: CanvasRenderingContext2D, x: number, y: number, fill: [number, number, number, number]) => {
    const { width, height } = ctx.canvas;
    if (x < 0 || y < 0 || x >= width || y >= height) return;

    const img = ctx.getImageData(0, 0, width, height);
    const data = img.data;
    const visited = new Uint8Array(width * height);
    const at = (px: number, py: number) => (py * width + px) * 4;
    const start = at(x, y);
    const target = [data[start], data[start + 1], data[start + 2], data[start + 3]];
    if (target[0] === fill[0] && target[1] === fill[1] && target[2] === fill[2] && target[3] === fill[3]) return;

    const tol = 32;
    const matches = (px: number, py: number) => {
        if (visited[py * width + px]) return false;
        const i = at(px, py);
        return (
            Math.abs(data[i] - target[0]) <= tol &&
            Math.abs(data[i + 1] - target[1]) <= tol &&
            Math.abs(data[i + 2] - target[2]) <= tol &&
            Math.abs(data[i + 3] - target[3]) <= tol
        );
    };

    const stack: Array<[number, number]> = [[x, y]];
    while (stack.length) {
        const [sx, sy] = stack.pop()!;
        let nx = sx;
        while (nx >= 0 && matches(nx, sy)) nx--;
        nx++;
        let spanUp = false;
        let spanDown = false;
        while (nx < width && matches(nx, sy)) {
            const i = at(nx, sy);
            data[i] = fill[0];
            data[i + 1] = fill[1];
            data[i + 2] = fill[2];
            data[i + 3] = fill[3];
            visited[sy * width + nx] = 1;

            if (sy > 0) {
                if (matches(nx, sy - 1)) { if (!spanUp) { stack.push([nx, sy - 1]); spanUp = true; } }
                else spanUp = false;
            }
            if (sy < height - 1) {
                if (matches(nx, sy + 1)) { if (!spanDown) { stack.push([nx, sy + 1]); spanDown = true; } }
                else spanDown = false;
            }
            nx++;
        }
    }
    ctx.putImageData(img, 0, 0);
};

const Paint = () => {
    const rootRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasAreaRef = useRef<HTMLDivElement>(null);
    const initedRef = useRef(false);

    const [tool, setTool] = useState<Tool>("pencil");
    const [fgColor, setFgColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [size, setSize] = useState(2);
    const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

    // Mutable per-stroke state (avoids re-render churn while dragging)
    const drawingRef = useRef(false);
    const startRef = useRef<{ x: number; y: number } | null>(null);
    const lastRef = useRef<{ x: number; y: number } | null>(null);
    const snapshotRef = useRef<ImageData | null>(null);
    const buttonRef = useRef(0);
    const undoStackRef = useRef<ImageData[]>([]);

    // Size the canvas to the drawing area once it has a real layout, leaving a
    // grey margin to the right/bottom (XP Paint's bitmap is a fixed size inside a
    // scrollable grey area). The bitmap then stays fixed.
    useEffect(() => {
        const canvas = canvasRef.current;
        const area = canvasAreaRef.current;
        if (!canvas || !area) return;

        const observer = new ResizeObserver(() => {
            if (initedRef.current) return;
            const w = Math.floor(area.clientWidth - 28);
            const h = Math.floor(area.clientHeight - 28);
            if (w <= 1 || h <= 1) return;
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, w, h);
            }
            initedRef.current = true;
            observer.disconnect();
        });
        observer.observe(area);
        return () => observer.disconnect();
    }, []);

    const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

    const getPos = (event: ReactPointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((event.clientX - rect.left) * (canvas.width / rect.width)),
            y: Math.round((event.clientY - rect.top) * (canvas.height / rect.height)),
        };
    };

    const pushUndo = (ctx: CanvasRenderingContext2D) => {
        undoStackRef.current.push(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height));
        if (undoStackRef.current.length > 25) undoStackRef.current.shift();
    };

    const undo = () => {
        const ctx = getCtx();
        const img = undoStackRef.current.pop();
        if (ctx && img) ctx.putImageData(img, 0, 0);
    };

    const clearCanvas = () => {
        const ctx = getCtx();
        const canvas = canvasRef.current;
        if (!ctx || !canvas) return;
        pushUndo(ctx);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const saveImage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = "untitled.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    const strokeColor = (button: number) => (button === 2 ? bgColor : fgColor);

    const drawSegment = (ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }, button: number) => {
        ctx.strokeStyle = tool === "eraser" ? bgColor : strokeColor(button);
        ctx.lineWidth = tool === "eraser" ? Math.max(size * 3, 8) : tool === "pencil" ? 1 : size;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
    };

    const spray = (ctx: CanvasRenderingContext2D, at: { x: number; y: number }, button: number) => {
        ctx.fillStyle = strokeColor(button);
        const radius = Math.max(size * 2, 6);
        for (let i = 0; i < 14; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * radius;
            ctx.fillRect(Math.round(at.x + Math.cos(angle) * dist), Math.round(at.y + Math.sin(angle) * dist), 1, 1);
        }
    };

    const drawShape = (ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }, button: number) => {
        ctx.strokeStyle = strokeColor(button);
        ctx.lineWidth = size;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        if (tool === "rectangle" || tool === "polygon") {
            ctx.rect(from.x, from.y, to.x - from.x, to.y - from.y);
        } else if (tool === "roundRectangle") {
            const r = 10;
            const x = Math.min(from.x, to.x);
            const y = Math.min(from.y, to.y);
            ctx.roundRect(x, y, Math.abs(to.x - from.x), Math.abs(to.y - from.y), r);
        } else if (tool === "ellipse") {
            ctx.ellipse((from.x + to.x) / 2, (from.y + to.y) / 2, Math.abs(to.x - from.x) / 2, Math.abs(to.y - from.y) / 2, 0, 0, Math.PI * 2);
        } else {
            // line and curve (curve approximated as a straight line for now)
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
        }
        ctx.stroke();
    };

    const isFreehand = tool === "pencil" || tool === "brush" || tool === "eraser";
    const isShape = tool === "line" || tool === "curve" || tool === "rectangle" || tool === "polygon" || tool === "ellipse" || tool === "roundRectangle";

    const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const ctx = getCtx();
        if (!canvas || !ctx) return;
        rootRef.current?.focus();
        const pos = getPos(event);

        if (tool === "eyedropper") {
            const p = ctx.getImageData(pos.x, pos.y, 1, 1).data;
            const hex = rgbToHex(p[0], p[1], p[2]);
            if (event.button === 2) setBgColor(hex); else setFgColor(hex);
            return;
        }
        // Selection / text / magnifier are present in the toolbox but not yet
        // interactive — ignore canvas input for them.
        if (tool === "freeSelect" || tool === "select" || tool === "text" || tool === "magnifier") return;

        canvas.setPointerCapture(event.pointerId);
        buttonRef.current = event.button;
        pushUndo(ctx);

        if (tool === "fill") {
            floodFill(ctx, pos.x, pos.y, hexToRgba(strokeColor(event.button)));
            return;
        }

        drawingRef.current = true;
        startRef.current = pos;
        lastRef.current = pos;
        if (isShape) {
            snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } else if (tool === "airbrush") {
            spray(ctx, pos, event.button);
        } else {
            drawSegment(ctx, pos, pos, event.button);
        }
    };

    const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
        const ctx = getCtx();
        if (!ctx) return;
        const pos = getPos(event);
        setCursor(pos);
        if (!drawingRef.current) return;

        if (isFreehand) {
            if (lastRef.current) drawSegment(ctx, lastRef.current, pos, buttonRef.current);
            lastRef.current = pos;
        } else if (tool === "airbrush") {
            spray(ctx, pos, buttonRef.current);
        } else if (isShape && snapshotRef.current && startRef.current) {
            ctx.putImageData(snapshotRef.current, 0, 0);
            drawShape(ctx, startRef.current, pos, buttonRef.current);
        }
    };

    const endStroke = () => {
        drawingRef.current = false;
        startRef.current = null;
        lastRef.current = null;
        snapshotRef.current = null;
    };

    // Dragging a canvas handle resizes the bitmap, anchored top-left, preserving
    // the existing drawing (new area is filled white).
    const resizeRef = useRef<{ dir: string; startX: number; startY: number; startW: number; startH: number; snapshot: ImageData } | null>(null);

    const handleResizeDown = (dir: string) => (event: ReactPointerEvent<HTMLSpanElement>) => {
        const canvas = canvasRef.current;
        const ctx = getCtx();
        if (!canvas || !ctx) return;
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        resizeRef.current = {
            dir,
            startX: event.clientX,
            startY: event.clientY,
            startW: canvas.width,
            startH: canvas.height,
            snapshot: ctx.getImageData(0, 0, canvas.width, canvas.height),
        };
        // Past snapshots no longer match the new dimensions
        undoStackRef.current = [];
    };

    const handleResizeMove = (event: ReactPointerEvent<HTMLSpanElement>) => {
        const r = resizeRef.current;
        const canvas = canvasRef.current;
        const ctx = getCtx();
        if (!r || !canvas || !ctx) return;
        const w = r.dir.includes("e") ? Math.max(1, r.startW + Math.round(event.clientX - r.startX)) : r.startW;
        const h = r.dir.includes("s") ? Math.max(1, r.startH + Math.round(event.clientY - r.startY)) : r.startH;
        canvas.width = w;
        canvas.height = h;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.putImageData(r.snapshot, 0, 0);
    };

    const handleResizeUp = (event: ReactPointerEvent<HTMLSpanElement>) => {
        if (!resizeRef.current) return;
        event.currentTarget.releasePointerCapture(event.pointerId);
        resizeRef.current = null;
    };

    const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
        if (!(event.ctrlKey || event.metaKey)) return;
        const key = event.key.toLowerCase();
        if (key === "z") { event.preventDefault(); undo(); }
        else if (key === "s") { event.preventDefault(); saveImage(); }
        else if (key === "n") { event.preventDefault(); clearCanvas(); }
    };

    const showWidths = WIDTH_TOOLS.has(tool);

    return (
        <div ref={rootRef} className={`${styles.paint} flex flex-col h-full`} tabIndex={0} onKeyDown={handleKeyDown}>
            <WindowMenu menuItems={["File", "Edit", "View", "Image", "Colors", "Help"]} />

            <div className={`${styles.main} flex flex-1 min-h-0`}>
                <div className={styles.toolbox}>
                    <div className={styles.tools}>
                        {TOOLS.map((t, i) => (
                            <button
                                key={t.id}
                                type="button"
                                title={t.title}
                                aria-label={t.title}
                                className={styles.toolButton}
                                data-active={tool === t.id}
                                onClick={() => setTool(t.id)}
                            >
                                <span
                                    className={styles.toolIcon}
                                    style={{
                                        width: `${(CELLS[i][1] * SCALE).toFixed(2)}px`,
                                        height: `${ICON_H}px`,
                                        backgroundSize: `${(SPRITE_W * SCALE).toFixed(2)}px ${ICON_H}px`,
                                        backgroundPosition: `${(-CELLS[i][0] * SCALE).toFixed(2)}px 0`,
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                    <div className={styles.options}>
                        {showWidths && (
                            <div className={styles.sizes}>
                                {SIZES.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        title={`${s}px`}
                                        aria-label={`${s} pixel width`}
                                        className={styles.sizeOption}
                                        data-active={size === s}
                                        onClick={() => setSize(s)}
                                    >
                                        <span style={{ height: `${s}px` }} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div ref={canvasAreaRef} className={styles.canvasArea}>
                    <XPScrollbars className={styles.scroll} viewportClassName={styles.scrollViewport}>
                        <div className={styles.canvasWrap}>
                            <canvas
                                ref={canvasRef}
                                className={styles.canvas}
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={endStroke}
                                onPointerCancel={endStroke}
                                onPointerLeave={() => setCursor(null)}
                                onContextMenu={(e) => e.preventDefault()}
                            />
                            {([["e", styles.handleRight], ["s", styles.handleBottom], ["se", styles.handleCorner]] as const).map(([dir, cls]) => (
                                <span
                                    key={dir}
                                    className={`${styles.handle} ${cls}`}
                                    onPointerDown={handleResizeDown(dir)}
                                    onPointerMove={handleResizeMove}
                                    onPointerUp={handleResizeUp}
                                    onPointerCancel={handleResizeUp}
                                />
                            ))}
                        </div>
                    </XPScrollbars>
                </div>
            </div>

            <div className={styles.palette}>
                <div className={styles.swatches} title="Foreground / background">
                    <span className={styles.swatchBg} style={{ background: bgColor }} />
                    <span className={styles.swatchFg} style={{ background: fgColor }} />
                </div>
                <div className={styles.paletteGrid}>
                    {PALETTE.map((color) => (
                        <button
                            key={color}
                            type="button"
                            aria-label={color}
                            className={styles.colorCell}
                            style={{ background: color }}
                            onClick={() => setFgColor(color)}
                            onContextMenu={(e) => { e.preventDefault(); setBgColor(color); }}
                        />
                    ))}
                </div>
            </div>

            <div className={styles.statusBar}>
                <span className={styles.statusHelp}>For Help, click Help Topics on the Help Menu.</span>
                <span className={styles.statusPanel}>{cursor ? `${cursor.x},${cursor.y}` : ""}</span>
                <span className={styles.statusPanel} />
                <svg className={styles.statusGrip} viewBox="0 0 16 16" aria-hidden="true">
                    {GRIP.map(([x, y]) => (
                        <g key={`${x}-${y}`}>
                            <rect x={x + 1} y={y + 1} width="2" height="2" fill="#fff" />
                            <rect x={x} y={y} width="2" height="2" fill="#9d9d92" />
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
};

export default Paint;
