// DOOM runs as a self-hosted Chocolate Doom WebAssembly build inside an iframe
// (assets in /public/doom). The iframe isolates the Emscripten runtime — its page
// globals, keyboard/canvas focus and audio — from react-xp, and closing the window
// unmounts this component, which removes the iframe and disposes of the engine.
const Doom = () => {
    return (
        <iframe
            src="/doom/index.html"
            title="DOOM"
            allow="autoplay"
            style={{ width: "100%", height: "100%", border: 0, display: "block", background: "#000" }}
        />
    );
};

export default Doom;
