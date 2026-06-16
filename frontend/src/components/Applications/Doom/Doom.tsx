import { useEffect, useRef } from "react";

// DOOM runs as a self-hosted PrBoom+ (Dwasm) WebAssembly build inside an iframe
// (assets in /public/doom). The iframe isolates the Emscripten runtime/keyboard/
// audio from react-xp, and closing the window unmounts this component, removing
// the iframe and disposing of the engine.
//
// The iframe is focused as soon as it opens so the keyboard reaches the game
// immediately; the player's first keypress/click then both controls DOOM and
// satisfies the browser autoplay policy, starting the music + sound effects.
const Doom = () => {
    const frameRef = useRef<HTMLIFrameElement>(null);
    const focusFrame = () => frameRef.current?.focus();

    useEffect(() => {
        const timer = window.setTimeout(focusFrame, 150);
        return () => window.clearTimeout(timer);
    }, []);

    return (
        <iframe
            ref={frameRef}
            src="/doom/index.html"
            title="DOOM"
            allow="autoplay"
            onLoad={focusFrame}
            style={{ width: "100%", height: "100%", border: 0, display: "block", background: "#000" }}
        />
    );
};

export default Doom;
