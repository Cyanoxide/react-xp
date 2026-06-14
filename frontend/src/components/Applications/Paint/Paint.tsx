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

// Icons come from a single-row spritemap (16 icons). Each cell is the icon's
// tight bounding box [x, y, w, h] in source pixels, so the sheet is scaled by a
// single factor (by height) and each box is flex-centred in its button — every
// icon lands centred on both axes, including the ones flush to the sheet edges.
const SPRITE_W = 2517;
const SPRITE_H = 129;
const ICON_H = 16;
const SCALE = ICON_H / SPRITE_H;
const CELLS: Array<[number, number, number, number]> = [
    [0, 0, 130, 129], [175, 16, 122, 90], [348, 19, 114, 90], [512, 7, 130, 114],
    [692, 3, 130, 122], [871, 0, 122, 129], [1040, 3, 74, 122], [1162, 0, 74, 129],
    [1284, 11, 130, 106], [1464, 13, 114, 98], [1627, 9, 114, 106], [1791, 1, 50, 122],
    [1891, 17, 122, 90], [2061, 9, 114, 106], [2225, 20, 122, 82], [2395, 12, 122, 90],
];

// Per-tool option sets shown in the options box.
const ERASER_SIZES = [4, 6, 9, 13];
const ZOOMS = [1, 2, 6, 8];
const SPRAYS = [{ id: "s", r: 4 }, { id: "m", r: 8 }, { id: "l", r: 13 }];
const SHAPE_FILLS = ["stroke", "both", "fill"] as const;
type BrushKind = "circle" | "square" | "diag" | "diag2";
const BRUSHES: Array<{ id: string; kind: BrushKind; v: number }> = [
    { id: "c-l", kind: "circle", v: 4 }, { id: "c-m", kind: "circle", v: 2.5 }, { id: "c-s", kind: "circle", v: 1.2 },
    { id: "s-l", kind: "square", v: 8 }, { id: "s-m", kind: "square", v: 5 }, { id: "s-s", kind: "square", v: 2 },
    { id: "d-r", kind: "diag", v: 9 }, { id: "d-l", kind: "diag2", v: 9 },
];

const SHAPE_TOOLS = new Set<Tool>(["rectangle", "polygon", "ellipse", "roundRectangle"]);

// The classic Windows Paint 28-colour palette (two rows of fourteen).
const PALETTE = [
    "#000000", "#808080", "#800000", "#808000", "#008000", "#008080", "#000080", "#800080", "#808040", "#004040", "#0080ff", "#004080", "#8000ff", "#804000",
    "#ffffff", "#c0c0c0", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ffff80", "#00ff80", "#80ffff", "#8080ff", "#ff0080", "#ff8040",
];

const SIZES = [1, 2, 3, 5, 8];
const TEXT_SIZE = 14;

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
    const [eraserSize, setEraserSize] = useState(6);
    const [brushId, setBrushId] = useState("c-m");
    const [sprayId, setSprayId] = useState("m");
    const [shapeFill, setShapeFill] = useState<(typeof SHAPE_FILLS)[number]>("stroke");
    const [zoom, setZoom] = useState(1);
    const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
    // Text tool: a box (dragged out like a selection) you type plain text into
    const [textBox, setTextBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
    const [textValue, setTextValue] = useState("");
    const [textEditing, setTextEditing] = useState(false);
    // Rectangular selection (Select / Free-Form Select): the marquee rectangle
    const [selection, setSelection] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

    // Mutable per-stroke state (avoids re-render churn while dragging)
    const drawingRef = useRef(false);
    const startRef = useRef<{ x: number; y: number } | null>(null);
    const lastRef = useRef<{ x: number; y: number } | null>(null);
    const snapshotRef = useRef<ImageData | null>(null);
    const buttonRef = useRef(0);
    const undoStackRef = useRef<ImageData[]>([]);

    // Selection drag state: define a region (rectangle, or a freehand lasso for
    // Free-Form Select), then drag inside it to move the pixels (lifted, leaving
    // white behind). selCanvas = lifted pixels (masked to the lasso when present),
    // selBase = the canvas with the original area cleared, selPath = lasso points.
    const selDefiningRef = useRef(false);
    const selMovingRef = useRef(false);
    const selStartRef = useRef({ x: 0, y: 0 });
    const selGrabRef = useRef({ dx: 0, dy: 0 });
    const selBaseRef = useRef<ImageData | null>(null);
    const selCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const selPathRef = useRef<Array<{ x: number; y: number }> | null>(null);

    // Polygon: click to drop vertices (rubber-band preview between clicks),
    // double-click to close. polyBase is the canvas before the polygon started.
    const polyPointsRef = useRef<Array<{ x: number; y: number }> | null>(null);
    const polyBaseRef = useRef<ImageData | null>(null);
    const polyLastClickRef = useRef<{ t: number; x: number; y: number } | null>(null);
    const polyDraggingRef = useRef(false);

    // Curve: drag a straight line (phase 1), then drag to bend it (phase 2),
    // keeping the endpoints fixed. base = the canvas before the curve started.
    const curveRef = useRef<{ phase: number; a: { x: number; y: number }; b: { x: number; y: number }; base: ImageData } | null>(null);
    const curveDraggingRef = useRef(false);

    // Text define-drag state + the textarea overlay
    const textDefiningRef = useRef(false);
    const textStartRef = useRef({ x: 0, y: 0 });
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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

    // Switching away from a selection tool commits the floating selection (its
    // pixels are already drawn) and drops the marquee.
    useEffect(() => {
        if (tool !== "select" && tool !== "freeSelect") {
            setSelection(null);
            selCanvasRef.current = null;
            selBaseRef.current = null;
            selPathRef.current = null;
        }
        // Leaving the polygon tool commits the segments drawn so far (they're
        // already on the canvas) — just drop the in-progress state, don't erase.
        if (tool !== "polygon" && polyBaseRef.current) {
            polyPointsRef.current = null;
            polyBaseRef.current = null;
            polyDraggingRef.current = false;
            polyLastClickRef.current = null;
        }
        // Leaving the curve tool finalises whatever's already drawn
        if (tool !== "curve") {
            curveRef.current = null;
            curveDraggingRef.current = false;
        }
    }, [tool]);

    // Focus the text box when it opens for editing
    useEffect(() => {
        if (textEditing) textareaRef.current?.focus();
    }, [textEditing]);

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

    // Stamp a single brush/eraser nib at a point
    const stampNib = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, kind: BrushKind, v: number) => {
        if (kind === "circle") {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, v, 0, Math.PI * 2);
            ctx.fill();
        } else if (kind === "square") {
            ctx.fillStyle = color;
            ctx.fillRect(Math.round(x - v / 2), Math.round(y - v / 2), v, v);
        } else {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
            ctx.beginPath();
            const h = v / 2;
            if (kind === "diag") { ctx.moveTo(x - h, y + h); ctx.lineTo(x + h, y - h); } // right-leaning /
            else { ctx.moveTo(x - h, y - h); ctx.lineTo(x + h, y + h); } // left-leaning \
            ctx.stroke();
        }
    };

    // Freehand draw (pencil / brush / eraser). Pencil is a 1px line; brush and
    // eraser stamp their nib densely along the segment.
    const drawSegment = (ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }, button: number) => {
        if (tool === "pencil") {
            ctx.strokeStyle = strokeColor(button);
            ctx.lineWidth = 1;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
            return;
        }
        const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y)));
        const brush = BRUSHES.find((b) => b.id === brushId) ?? BRUSHES[1];
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = from.x + (to.x - from.x) * t;
            const y = from.y + (to.y - from.y) * t;
            if (tool === "eraser") stampNib(ctx, x, y, bgColor, "square", eraserSize);
            else stampNib(ctx, x, y, strokeColor(button), brush.kind, brush.v);
        }
    };

    const spray = (ctx: CanvasRenderingContext2D, at: { x: number; y: number }, button: number) => {
        ctx.fillStyle = strokeColor(button);
        const radius = (SPRAYS.find((s) => s.id === sprayId) ?? SPRAYS[1]).r;
        const count = Math.round(radius * 1.6);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * radius;
            ctx.fillRect(Math.round(at.x + Math.cos(angle) * dist), Math.round(at.y + Math.sin(angle) * dist), 1, 1);
        }
    };

    // Border colour is the draw colour; fill is the opposite (bg) colour, except
    // the fill-only style which fills with the draw colour.
    const fillShape = (ctx: CanvasRenderingContext2D, button: number) => {
        if (shapeFill === "stroke") return;
        ctx.fillStyle = shapeFill === "fill" ? strokeColor(button) : (button === 2 ? fgColor : bgColor);
        ctx.fill();
    };

    const drawShape = (ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }, button: number) => {
        ctx.lineWidth = size;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        let closed = true;
        if (tool === "rectangle") {
            ctx.rect(from.x, from.y, to.x - from.x, to.y - from.y);
        } else if (tool === "roundRectangle") {
            const r = 10;
            const x = Math.min(from.x, to.x);
            const y = Math.min(from.y, to.y);
            ctx.roundRect(x, y, Math.abs(to.x - from.x), Math.abs(to.y - from.y), r);
        } else if (tool === "ellipse") {
            ctx.ellipse((from.x + to.x) / 2, (from.y + to.y) / 2, Math.abs(to.x - from.x) / 2, Math.abs(to.y - from.y) / 2, 0, 0, Math.PI * 2);
        } else {
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            closed = false;
        }
        if (closed) fillShape(ctx, button);
        if (!closed || shapeFill !== "fill") {
            ctx.strokeStyle = strokeColor(button);
            ctx.stroke();
        }
    };

    const isFreehand = tool === "pencil" || tool === "brush" || tool === "eraser";
    const isShape = tool === "line" || tool === "rectangle" || tool === "ellipse" || tool === "roundRectangle";
    const isSelect = tool === "select" || tool === "freeSelect";

    // Polygon: click to drop vertices, double-click to close. Each frame redraws
    // from the snapshot taken when the first vertex was placed.
    const drawPolygon = (ctx: CanvasRenderingContext2D, cursor: { x: number; y: number } | null, button: number, close: boolean) => {
        if (!polyBaseRef.current || !polyPointsRef.current) return;
        ctx.putImageData(polyBaseRef.current, 0, 0);
        const pts = polyPointsRef.current;
        ctx.strokeStyle = strokeColor(button);
        ctx.lineWidth = size;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        if (cursor) ctx.lineTo(cursor.x, cursor.y);
        if (close) {
            ctx.closePath();
            fillShape(ctx, button);
        }
        if (!close || shapeFill !== "fill") {
            ctx.strokeStyle = strokeColor(button);
            ctx.stroke();
        }
    };

    // A vertex is committed on pointer-up, so a plain click and a click-drag both
    // work: while the button is held the segment from the last vertex previews
    // (like the Line tool); releasing locks it in.
    const handlePolygonDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const ctx = getCtx();
        if (!canvas || !ctx) return;
        const pos = getPos(event);
        buttonRef.current = event.button;

        // Manual double-click: a second click in the same spot soon after closes
        // the polygon instead of adding another vertex.
        const now = Date.now();
        const last = polyLastClickRef.current;
        if (polyPointsRef.current && polyPointsRef.current.length >= 2 && last && now - last.t < 400 && Math.abs(pos.x - last.x) < 6 && Math.abs(pos.y - last.y) < 6) {
            handlePolygonClose();
            polyLastClickRef.current = null;
            return;
        }
        polyLastClickRef.current = { t: now, x: pos.x, y: pos.y };

        if (!polyPointsRef.current) {
            pushUndo(ctx);
            polyBaseRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
            polyPointsRef.current = [pos];
        }
        polyDraggingRef.current = true;
    };

    const handlePolygonUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
        if (!polyDraggingRef.current) return;
        polyDraggingRef.current = false;
        const ctx = getCtx();
        if (!ctx || !polyPointsRef.current) return;
        const pos = getPos(event);
        const pts = polyPointsRef.current;
        const lastV = pts[pts.length - 1];
        if (lastV.x !== pos.x || lastV.y !== pos.y) pts.push(pos);
        drawPolygon(ctx, null, buttonRef.current, false);
    };

    const handlePolygonClose = () => {
        const ctx = getCtx();
        if (ctx && polyPointsRef.current && polyPointsRef.current.length >= 2) {
            drawPolygon(ctx, null, buttonRef.current, true);
        }
        polyPointsRef.current = null;
        polyBaseRef.current = null;
    };

    // Curve: first drag lays a straight line (phase 1); the second drag bends it
    // into a quadratic curve with the endpoints fixed (phase 2).
    const strokeCurve = (ctx: CanvasRenderingContext2D, c: { phase: number; a: { x: number; y: number }; b: { x: number; y: number } }, ctrl: { x: number; y: number }) => {
        ctx.strokeStyle = strokeColor(buttonRef.current);
        ctx.lineWidth = size;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(c.a.x, c.a.y);
        if (c.phase === 1) ctx.lineTo(ctrl.x, ctrl.y);
        else ctx.quadraticCurveTo(ctrl.x, ctrl.y, c.b.x, c.b.y);
        ctx.stroke();
    };

    const handleCurveDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const ctx = getCtx();
        if (!canvas || !ctx) return;
        buttonRef.current = event.button;
        if (!curveRef.current) {
            pushUndo(ctx);
            const pos = getPos(event);
            curveRef.current = { phase: 1, a: pos, b: pos, base: ctx.getImageData(0, 0, canvas.width, canvas.height) };
        }
        curveDraggingRef.current = true;
    };

    const handleCurveMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
        const ctx = getCtx();
        const c = curveRef.current;
        if (!ctx || !c) return;
        ctx.putImageData(c.base, 0, 0);
        strokeCurve(ctx, c, getPos(event));
    };

    const handleCurveUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
        if (!curveDraggingRef.current) return;
        curveDraggingRef.current = false;
        const ctx = getCtx();
        const c = curveRef.current;
        if (!ctx || !c) return;
        const pos = getPos(event);
        ctx.putImageData(c.base, 0, 0);
        if (c.phase === 1) {
            c.b = pos;
            strokeCurve(ctx, c, c.b);
            c.phase = 2;
        } else {
            strokeCurve(ctx, c, pos);
            curveRef.current = null;
        }
    };

    // Text: drag a box, then type into the overlaid textarea; the text is stamped
    // onto the canvas when it loses focus / the tool changes.
    const commitText = () => {
        const box = textBox;
        const ctx = getCtx();
        if (box && ctx && textValue.length) {
            pushUndo(ctx);
            ctx.fillStyle = fgColor;
            ctx.textBaseline = "top";
            ctx.font = `${TEXT_SIZE}px sans-serif`;
            const lineH = Math.round(TEXT_SIZE * 1.3);
            let y = box.y + 2;
            for (const para of textValue.split("\n")) {
                let line = "";
                for (const word of para.split(" ")) {
                    const test = line ? `${line} ${word}` : word;
                    if (ctx.measureText(test).width > box.w - 4 && line) {
                        ctx.fillText(line, box.x + 2, y);
                        y += lineH;
                        line = word;
                    } else {
                        line = test;
                    }
                }
                ctx.fillText(line, box.x + 2, y);
                y += lineH;
            }
        }
        setTextBox(null);
        setTextValue("");
        setTextEditing(false);
    };

    const handleTextDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.setPointerCapture(event.pointerId);
        const pos = getPos(event);
        textStartRef.current = pos;
        textDefiningRef.current = true;
        setTextEditing(false);
        setTextBox({ x: pos.x, y: pos.y, w: 0, h: 0 });
    };

    const handleTextMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
        if (!textDefiningRef.current) return;
        const pos = getPos(event);
        setTextBox({
            x: Math.min(pos.x, textStartRef.current.x),
            y: Math.min(pos.y, textStartRef.current.y),
            w: Math.abs(pos.x - textStartRef.current.x),
            h: Math.abs(pos.y - textStartRef.current.y),
        });
    };

    const handleTextUp = () => {
        if (!textDefiningRef.current) return;
        textDefiningRef.current = false;
        if (textBox && textBox.w > 8 && textBox.h > 8) setTextEditing(true);
        else setTextBox(null);
    };

    // Selection. Select drags a rectangle; Free-Form Select traces a freehand
    // lasso (its marquee becomes the bounding box once complete, but only the
    // pixels inside the lasso are lifted). Drag inside to move; Delete clears.
    const tracePath = (c: CanvasRenderingContext2D, path: Array<{ x: number; y: number }>, ox: number, oy: number) => {
        c.beginPath();
        path.forEach((p, i) => (i === 0 ? c.moveTo(p.x - ox, p.y - oy) : c.lineTo(p.x - ox, p.y - oy)));
        c.closePath();
    };

    // Lift the selected pixels into an offscreen canvas (clipped to the lasso when
    // present) and clear the original area to white.
    const liftSelection = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, sel: { x: number; y: number; w: number; h: number }) => {
        const off = document.createElement("canvas");
        off.width = Math.max(1, sel.w);
        off.height = Math.max(1, sel.h);
        const octx = off.getContext("2d");
        if (!octx) return;
        octx.save();
        if (selPathRef.current) { tracePath(octx, selPathRef.current, sel.x, sel.y); octx.clip(); }
        octx.drawImage(canvas, -sel.x, -sel.y);
        octx.restore();
        selCanvasRef.current = off;

        ctx.save();
        if (selPathRef.current) tracePath(ctx, selPathRef.current, 0, 0);
        else { ctx.beginPath(); ctx.rect(sel.x, sel.y, sel.w, sel.h); }
        ctx.clip();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(sel.x, sel.y, sel.w, sel.h);
        ctx.restore();

        selBaseRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.drawImage(off, sel.x, sel.y);
    };

    const handleSelectDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const ctx = getCtx();
        if (!canvas || !ctx) return;
        canvas.setPointerCapture(event.pointerId);
        const pos = getPos(event);
        const inside = selection && pos.x >= selection.x && pos.x < selection.x + selection.w && pos.y >= selection.y && pos.y < selection.y + selection.h;

        if (inside && selection) {
            pushUndo(ctx);
            if (!selCanvasRef.current) liftSelection(ctx, canvas, selection);
            selGrabRef.current = { dx: pos.x - selection.x, dy: pos.y - selection.y };
            selMovingRef.current = true;
        } else {
            // Commit any floating selection (already drawn) and start a new one
            selCanvasRef.current = null;
            selBaseRef.current = null;
            selDefiningRef.current = true;
            if (tool === "freeSelect") {
                selPathRef.current = [pos];
                snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
                setSelection(null);
            } else {
                selPathRef.current = null;
                selStartRef.current = pos;
                setSelection({ x: pos.x, y: pos.y, w: 0, h: 0 });
            }
        }
    };

    const handleSelectMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
        const ctx = getCtx();
        if (!ctx) return;
        const pos = getPos(event);
        if (selDefiningRef.current) {
            if (tool === "freeSelect" && selPathRef.current && snapshotRef.current) {
                selPathRef.current.push(pos);
                ctx.putImageData(snapshotRef.current, 0, 0);
                ctx.save();
                ctx.strokeStyle = "#000";
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                selPathRef.current.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
                ctx.stroke();
                ctx.restore();
            } else {
                setSelection({
                    x: Math.min(pos.x, selStartRef.current.x),
                    y: Math.min(pos.y, selStartRef.current.y),
                    w: Math.abs(pos.x - selStartRef.current.x),
                    h: Math.abs(pos.y - selStartRef.current.y),
                });
            }
        } else if (selMovingRef.current && selBaseRef.current && selCanvasRef.current) {
            const nx = pos.x - selGrabRef.current.dx;
            const ny = pos.y - selGrabRef.current.dy;
            ctx.putImageData(selBaseRef.current, 0, 0);
            ctx.drawImage(selCanvasRef.current, nx, ny);
            setSelection((s) => (s ? { ...s, x: nx, y: ny } : s));
        }
    };

    const handleSelectUp = () => {
        const ctx = getCtx();
        if (selDefiningRef.current) {
            selDefiningRef.current = false;
            if (tool === "freeSelect" && selPathRef.current && snapshotRef.current && ctx) {
                ctx.putImageData(snapshotRef.current, 0, 0);
                snapshotRef.current = null;
                const path = selPathRef.current;
                const xs = path.map((p) => p.x);
                const ys = path.map((p) => p.y);
                const x = Math.min(...xs);
                const y = Math.min(...ys);
                const w = Math.max(...xs) - x;
                const h = Math.max(...ys) - y;
                if (path.length > 2 && w > 2 && h > 2) setSelection({ x, y, w, h });
                else { selPathRef.current = null; setSelection(null); }
            } else {
                setSelection((s) => (s && s.w > 2 && s.h > 2 ? s : null));
            }
        }
        selMovingRef.current = false;
    };

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
        if (isSelect) { handleSelectDown(event); return; }
        if (tool === "polygon") { handlePolygonDown(event); return; }
        if (tool === "curve") { handleCurveDown(event); return; }
        if (tool === "text") { handleTextDown(event); return; }
        if (tool === "magnifier") {
            // Cycle through the zoom levels (right-click steps back down)
            setZoom((z) => {
                const i = ZOOMS.indexOf(z);
                const next = (event.button === 2 ? i - 1 : i + 1) + ZOOMS.length;
                return ZOOMS[next % ZOOMS.length];
            });
            return;
        }

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
        if (isSelect) { handleSelectMove(event); return; }
        // Polygon: preview the next segment only while dragging (button held); a
        // plain move shows no trailing line.
        if (tool === "polygon") {
            if (polyDraggingRef.current && polyPointsRef.current) drawPolygon(ctx, pos, buttonRef.current, false);
            return;
        }
        if (tool === "curve") { if (curveDraggingRef.current) handleCurveMove(event); return; }
        if (tool === "text") { if (textDefiningRef.current) handleTextMove(event); return; }
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

    const endStroke = (event?: ReactPointerEvent<HTMLCanvasElement>) => {
        if (isSelect) { handleSelectUp(); return; }
        if (tool === "polygon") { if (event) handlePolygonUp(event); return; }
        if (tool === "curve") { if (event) handleCurveUp(event); return; }
        if (tool === "text") { handleTextUp(); return; }
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
        const w = r.dir.includes("e") ? Math.max(1, r.startW + Math.round((event.clientX - r.startX) / zoom)) : r.startW;
        const h = r.dir.includes("s") ? Math.max(1, r.startH + Math.round((event.clientY - r.startY) / zoom)) : r.startH;
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
        if (event.key === "Delete" || event.key === "Backspace") {
            if (!selection) return;
            event.preventDefault();
            const ctx = getCtx();
            if (ctx) {
                pushUndo(ctx);
                if (selCanvasRef.current && selBaseRef.current) {
                    // Already lifted: drop the floating pixels (base is already cleared)
                    ctx.putImageData(selBaseRef.current, 0, 0);
                } else {
                    ctx.save();
                    if (selPathRef.current) tracePath(ctx, selPathRef.current, 0, 0);
                    else { ctx.beginPath(); ctx.rect(selection.x, selection.y, selection.w, selection.h); }
                    ctx.clip();
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(selection.x, selection.y, selection.w, selection.h);
                    ctx.restore();
                }
            }
            selCanvasRef.current = null;
            selBaseRef.current = null;
            selPathRef.current = null;
            setSelection(null);
            return;
        }
        if (!(event.ctrlKey || event.metaKey)) return;
        const key = event.key.toLowerCase();
        if (key === "z") { event.preventDefault(); undo(); }
        else if (key === "s") { event.preventDefault(); saveImage(); }
        else if (key === "n") { event.preventDefault(); clearCanvas(); }
    };

    // Option-box icons (inline SVG, no sprites)
    const brushIcon = (b: { kind: BrushKind; v: number }) => {
        if (b.kind === "circle") return <circle cx="8" cy="8" r={b.v} fill="#000" />;
        if (b.kind === "square") return <rect x={8 - b.v / 2} y={8 - b.v / 2} width={b.v} height={b.v} fill="#000" />;
        const h = b.v / 2;
        return b.kind === "diag"
            ? <line x1={8 - h} y1={8 + h} x2={8 + h} y2={8 - h} stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
            : <line x1={8 - h} y1={8 - h} x2={8 + h} y2={8 + h} stroke="#000" strokeWidth="2.5" strokeLinecap="round" />;
    };
    const sprayIcon = (r: number) => {
        const n = Math.round(r * 1.4);
        return Array.from({ length: n }, (_, i) => {
            const a = i * 2.39996323;
            const d = (r / 13) * 8 * Math.sqrt(i / n);
            return <circle key={i} cx={10 + Math.cos(a) * d} cy={10 + Math.sin(a) * d} r="0.7" fill="#000" />;
        });
    };
    const fillIcon = (f: string) => {
        if (f === "stroke") return <rect x="3" y="3" width="18" height="10" fill="none" stroke="#000" strokeWidth="1.5" />;
        if (f === "both") return <rect x="3" y="3" width="18" height="10" fill="#808080" stroke="#000" strokeWidth="1.5" />;
        return <rect x="3" y="3" width="18" height="10" fill="#808080" />;
    };

    return (
        <div ref={rootRef} className={`${styles.paint} flex flex-col h-full`} tabIndex={0} onKeyDown={handleKeyDown}>
            <div className={styles.menuBar}>
                <WindowMenu menuItems={["File", "Edit", "View", "Image", "Colors", "Help"]} />
            </div>

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
                                        width: `${(CELLS[i][2] * SCALE).toFixed(2)}px`,
                                        height: `${(CELLS[i][3] * SCALE).toFixed(2)}px`,
                                        backgroundSize: `${(SPRITE_W * SCALE).toFixed(2)}px ${(SPRITE_H * SCALE).toFixed(2)}px`,
                                        backgroundPosition: `${(-CELLS[i][0] * SCALE).toFixed(2)}px ${(-CELLS[i][1] * SCALE).toFixed(2)}px`,
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                    <div className={styles.options}>
                        {tool === "eraser" && (
                            <div className={styles.eraserOpts}>
                                {ERASER_SIZES.map((s) => (
                                    <button key={s} type="button" aria-label={`eraser ${s}`} className={styles.eraserOpt} data-active={eraserSize === s} onClick={() => setEraserSize(s)}>
                                        <span style={{ width: `${s}px`, height: `${s}px` }} />
                                    </button>
                                ))}
                            </div>
                        )}
                        {tool === "magnifier" && (
                            <div className={styles.zooms}>
                                {ZOOMS.map((z) => (
                                    <button key={z} type="button" aria-label={`${z}x zoom`} className={styles.zoomOption} data-active={zoom === z} onClick={() => setZoom(z)}>
                                        <span className={styles.zoomSq} />{z}x
                                    </button>
                                ))}
                            </div>
                        )}
                        {tool === "brush" && (
                            <div className={styles.brushOpts}>
                                {BRUSHES.map((b) => (
                                    <button key={b.id} type="button" aria-label={b.id} className={styles.brushOpt} data-active={brushId === b.id} onClick={() => setBrushId(b.id)}>
                                        <svg viewBox="0 0 16 16" width="16" height="16">{brushIcon(b)}</svg>
                                    </button>
                                ))}
                            </div>
                        )}
                        {tool === "airbrush" && (
                            <div className={styles.sprayOpts}>
                                {SPRAYS.map((s) => (
                                    <button key={s.id} type="button" aria-label={`spray ${s.id}`} className={styles.sprayOpt} data-active={sprayId === s.id} onClick={() => setSprayId(s.id)}>
                                        <svg viewBox="0 0 20 20" width="20" height="20">{sprayIcon(s.r)}</svg>
                                    </button>
                                ))}
                            </div>
                        )}
                        {(tool === "line" || tool === "curve") && (
                            <div className={styles.sizes}>
                                {SIZES.map((s) => (
                                    <button key={s} type="button" aria-label={`${s} pixel width`} className={styles.sizeOption} data-active={size === s} onClick={() => setSize(s)}>
                                        <span style={{ height: `${s}px` }} />
                                    </button>
                                ))}
                            </div>
                        )}
                        {SHAPE_TOOLS.has(tool) && (
                            <div className={styles.fillOpts}>
                                {SHAPE_FILLS.map((f) => (
                                    <button key={f} type="button" aria-label={f} className={styles.fillOpt} data-active={shapeFill === f} onClick={() => setShapeFill(f)}>
                                        <svg viewBox="0 0 24 16" width="24" height="16">{fillIcon(f)}</svg>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div ref={canvasAreaRef} className={styles.canvasArea}>
                    <XPScrollbars className={styles.scroll} viewportClassName={styles.scrollViewport}>
                        <div className={styles.canvasWrap} style={{ zoom }}>
                            <canvas
                                ref={canvasRef}
                                className={styles.canvas}
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={endStroke}
                                onPointerCancel={endStroke}
                                onPointerLeave={() => setCursor(null)}
                                onDoubleClick={() => { if (tool === "polygon") handlePolygonClose(); }}
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
                            {selection && selection.w > 0 && selection.h > 0 && (
                                <div
                                    className={styles.marquee}
                                    style={{ left: selection.x, top: selection.y, width: selection.w, height: selection.h }}
                                />
                            )}
                            {textBox && (textEditing ? (
                                <textarea
                                    ref={textareaRef}
                                    className={styles.textInput}
                                    style={{ left: textBox.x, top: textBox.y, width: textBox.w, height: textBox.h, color: fgColor }}
                                    value={textValue}
                                    onChange={(e) => setTextValue(e.target.value)}
                                    onBlur={commitText}
                                />
                            ) : (
                                <div
                                    className={styles.marquee}
                                    style={{ left: textBox.x, top: textBox.y, width: textBox.w, height: textBox.h }}
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
