import { useEffect, useRef } from "react";
import type { CardType, Suit } from "../Solitaire";

interface WinAnimationProps {
    foundations: CardType[][];
    onCardLaunch: (pileIndex: number) => void;
    onComplete: () => void;
}

// Sprite sheet grid: 923x576px, 13 columns x 6 rows
const SPRITE_SRC = "/spritemap__solitaire-cards.png";
const CELL_WIDTH = 71;
const CELL_HEIGHT = 96;
const SUIT_ROW: Record<Suit, number> = { spades: 0, hearts: 1, clubs: 2, diamonds: 3 };

// Physics, in pixels per 60Hz step (all tunable)
const STEP_MS = 1000 / 60;
const GRAVITY = 0.35;
const BOUNCE = 0.82;
const MIN_LAUNCH_VX = 2;
const MAX_LAUNCH_VX = 5.5;
const MAX_LAUNCH_VY = 4;
const STAMP_EVERY_N = 1;
// 1 = cards may launch both left and right (as in the original); -1 = left only
const ALLOW_RIGHTWARD = 1;

interface ActiveCard {
    suit: Suit;
    rank: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    width: number;
    height: number;
}

const WinAnimation = ({ foundations, onCardLaunch, onComplete }: WinAnimationProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const onCardLaunchRef = useRef(onCardLaunch);
    const onCompleteRef = useRef(onComplete);
    onCardLaunchRef.current = onCardLaunch;
    onCompleteRef.current = onComplete;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context) return;

        let rafId = 0;
        let finished = false;
        let lastTime: number | null = null;
        let accumulator = 0;
        let stepCount = 0;
        let active: ActiveCard | null = null;
        let lastRect = { x: 100, y: 100, width: 71, height: 96 };
        let bounds = { width: 0, height: 0 };

        // Launch order: cycle the piles taking the top card of each in turn
        const piles = foundations.map((pile) => [...pile]);
        const queue: { card: CardType; pileIndex: number }[] = [];
        while (piles.some((pile) => pile.length > 0)) {
            piles.forEach((pile, pileIndex) => {
                const card = pile.pop();
                if (card) queue.push({ card, pileIndex });
            });
        }

        const sprite = new Image();
        sprite.src = SPRITE_SRC;

        const sizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;
            const dpr = window.devicePixelRatio || 1;

            // Preserve the painted trails across resizes
            let snapshot: HTMLCanvasElement | null = null;
            const previous = { ...bounds };
            if (canvas.width > 0 && canvas.height > 0) {
                snapshot = document.createElement("canvas");
                snapshot.width = canvas.width;
                snapshot.height = canvas.height;
                snapshot.getContext("2d")?.drawImage(canvas, 0, 0);
            }

            bounds = { width: rect.width, height: rect.height };
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            context.setTransform(dpr, 0, 0, dpr, 0, 0);

            if (snapshot && previous.width > 0) {
                context.drawImage(snapshot, 0, 0, previous.width, previous.height);
            }
        };
        sizeCanvas();

        const launchNext = (): boolean => {
            const next = queue.shift();
            if (!next) return false;

            const canvasRect = canvas.getBoundingClientRect();
            const slot = document.querySelector(`[data-foundation="${next.pileIndex}"] > div:last-child > div`);
            const rect = slot?.getBoundingClientRect();
            if (rect && rect.width > 0) {
                lastRect = {
                    x: rect.left - canvasRect.left,
                    y: rect.top - canvasRect.top,
                    width: rect.width,
                    height: rect.height,
                };
            }

            const direction = (ALLOW_RIGHTWARD && Math.random() < 0.5) ? 1 : -1;
            active = {
                suit: next.card.suit,
                rank: next.card.rank,
                x: lastRect.x,
                y: lastRect.y,
                vx: (MIN_LAUNCH_VX + Math.random() * (MAX_LAUNCH_VX - MIN_LAUNCH_VX)) * direction,
                vy: Math.random() * -MAX_LAUNCH_VY,
                width: lastRect.width,
                height: lastRect.height,
            };
            onCardLaunchRef.current(next.pileIndex);
            return true;
        };

        const stamp = (card: ActiveCard) => {
            context.drawImage(
                sprite,
                (card.rank - 1) * CELL_WIDTH,
                SUIT_ROW[card.suit] * CELL_HEIGHT,
                CELL_WIDTH,
                CELL_HEIGHT,
                card.x,
                card.y,
                card.width,
                card.height
            );
        };

        const finish = () => {
            if (finished) return;
            finished = true;
            cancelAnimationFrame(rafId);
            onCompleteRef.current();
        };

        const step = () => {
            if (!active && !launchNext()) {
                finish();
                return;
            }
            if (!active) return;

            active.vy += GRAVITY;
            active.x += active.vx;
            active.y += active.vy;

            const floor = bounds.height - active.height;
            if (active.y >= floor) {
                active.y = floor;
                active.vy = -active.vy * BOUNCE;
            }

            stepCount++;
            if (stepCount % STAMP_EVERY_N === 0) stamp(active);

            if (active.x + active.width < 0 || active.x > bounds.width) {
                active = null;
            }
        };

        const loop = (time: number) => {
            if (finished) return;
            if (lastTime === null) lastTime = time;
            accumulator += Math.min(time - lastTime, 100);
            lastTime = time;

            while (accumulator >= STEP_MS && !finished) {
                step();
                accumulator -= STEP_MS;
            }

            rafId = requestAnimationFrame(loop);
        };

        const start = () => {
            if (finished) return;
            rafId = requestAnimationFrame(loop);
        };

        sprite.decode().then(start).catch(start);

        const handleSkip = () => finish();
        window.addEventListener("keydown", handleSkip);
        const resizeObserver = new ResizeObserver(sizeCanvas);
        resizeObserver.observe(canvas);

        return () => {
            finished = true;
            cancelAnimationFrame(rafId);
            window.removeEventListener("keydown", handleSkip);
            resizeObserver.disconnect();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <canvas
            ref={canvasRef}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 2 }}
            onPointerDown={() => onCompleteRef.current()}
        />
    );
};

export default WinAnimation;
