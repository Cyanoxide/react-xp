import { useEffect, useRef, useState } from "react";
import { useContext } from "../../context/context";
import { throttle } from "../../utils/general";
import styles from "./Clippy.module.scss";
import agentData from "./clippyAgent.json";
import type { AbsoluteObject } from "../../context/types";

interface ClippyFrame {
    duration: number;
    images?: number[][];
    sound?: string;
    exitBranch?: number;
    branching?: { branches: { frameIndex: number; weight: number }[] };
}

interface ClippyAnimation {
    frames: ClippyFrame[];
}

const animations = agentData.animations as unknown as Record<string, ClippyAnimation>;
const [FRAME_WIDTH, FRAME_HEIGHT] = agentData.framesize;

// Calmer animations played on a timer while Clippy sits idle
const IDLE_ANIMATIONS = [
    "IdleAtom", "IdleEyeBrowRaise", "IdleFingerTap", "IdleHeadScratch", "IdleRopePile",
    "IdleSideToSide", "IdleSnooze", "Idle1_1", "LookUp", "LookDown", "LookLeft", "LookRight",
    "Thinking", "Searching", "CheckingSomething", "GetTechy", "GetArtsy", "GetWizardy", "Writing", "Print",
];

// Showier animations played when Clippy is clicked
const REACTION_ANIMATIONS = ["Congratulate", "GetAttention", "Wave", "Explain", "Alert", "GestureUp", "GestureLeft", "GestureRight"];

const IDLE_DELAY_MIN = 4000;
const IDLE_DELAY_MAX = 12000;
// Safety cap on branching loops so an animation can't play forever
const MAX_ANIMATION_STEPS = 200;
const DRAG_THRESHOLD = 5;

const randomFrom = (pool: string[]) => pool[Math.floor(Math.random() * pool.length)];

const Clippy = () => {
    const { isClippyMinimised, dispatch } = useContext();
    const [position, setPosition] = useState<AbsoluteObject>({ right: 60, bottom: 110 });
    const [framePosition, setFramePosition] = useState<number[]>([0, 0]);
    const clippyRef = useRef<HTMLDivElement | null>(null);
    const animationTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const wasDraggedRef = useRef(false);

    const clearTimers = () => {
        clearTimeout(animationTimerRef.current);
        clearTimeout(idleTimerRef.current);
    };

    const scheduleIdle = () => {
        clearTimeout(idleTimerRef.current);
        const delay = IDLE_DELAY_MIN + Math.random() * (IDLE_DELAY_MAX - IDLE_DELAY_MIN);
        idleTimerRef.current = setTimeout(() => playAnimation(randomFrom(IDLE_ANIMATIONS)), delay);
    };

    // Plays an animation frame-by-frame using the original Office Assistant
    // timing and branching data
    const playAnimation = (name: string) => {
        const animation = animations[name];
        if (!animation) return;

        clearTimers();
        let frameIndex = 0;
        let steps = 0;

        const playFrame = () => {
            const frame = animation.frames[frameIndex];
            if (!frame) return scheduleIdle();
            if (frame.images) setFramePosition(frame.images[0]);

            animationTimerRef.current = setTimeout(() => {
                steps++;
                let next = frameIndex + 1;

                if (frame.branching && steps < MAX_ANIMATION_STEPS) {
                    let roll = Math.random() * 100;
                    for (const branch of frame.branching.branches) {
                        if (roll < branch.weight) {
                            next = branch.frameIndex;
                            break;
                        }
                        roll -= branch.weight;
                    }
                }

                if (next >= animation.frames.length || steps >= MAX_ANIMATION_STEPS) {
                    setFramePosition([0, 0]);
                    scheduleIdle();
                    return;
                }

                frameIndex = next;
                playFrame();
            }, frame.duration);
        };

        playFrame();
    };

    useEffect(() => {
        if (isClippyMinimised) return;
        playAnimation("Greeting");
        return clearTimers;
    }, [isClippyMinimised]); // eslint-disable-line react-hooks/exhaustive-deps

    const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
        const clippyRect = clippyRef.current?.getBoundingClientRect();
        if (!clippyRect) return;

        const xOffset = event.clientX - clippyRect.left;
        const yOffset = event.clientY - clippyRect.top;
        const startX = event.clientX;
        const startY = event.clientY;
        wasDraggedRef.current = false;

        const onPointerMove = (moveEvent: PointerEvent) => {
            if (Math.abs(moveEvent.clientX - startX) + Math.abs(moveEvent.clientY - startY) < DRAG_THRESHOLD) return;
            wasDraggedRef.current = true;
            setPosition({
                top: moveEvent.clientY - yOffset,
                left: moveEvent.clientX - xOffset,
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
        if (wasDraggedRef.current) return;
        playAnimation(randomFrom(REACTION_ANIMATIONS));
    };

    const onMinimiseHandler = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        clearTimers();
        dispatch({ type: "SET_IS_CLIPPY_MINIMISED", payload: true });
        sessionStorage.setItem("isClippyMinimised", "true");
    };

    if (isClippyMinimised) return null;

    return (
        <div ref={clippyRef} className={styles.clippy} onPointerDown={onPointerDown} onClick={onClickHandler} style={{ top: position.top, right: position.right, bottom: position.bottom, left: position.left }}>
            <button className={styles.minimiseButton} title="Minimise Clippy" onClick={onMinimiseHandler} onPointerDown={(event) => event.stopPropagation()}>_</button>
            <div
                className={styles.sprite}
                style={{
                    width: FRAME_WIDTH,
                    height: FRAME_HEIGHT,
                    backgroundPosition: `-${framePosition[0]}px -${framePosition[1]}px`,
                }}
            />
        </div>
    );
};

export default Clippy;
