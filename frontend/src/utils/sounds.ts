/**
 * Sound effects, played through the Web Audio API.
 *
 * The obvious implementation — `new Audio(src).play()` per sound — is what this
 * replaces, and it behaves badly on iOS:
 *
 *  - **Late.** Each call built a fresh element, which then had to fetch and
 *    decode the file before it made a sound. These are uncompressed .wav files,
 *    so on a phone the delay is audible against the click that caused it.
 *  - **Silent.** Safari only lets audio start from inside a user gesture, and
 *    an element created after a timeout has no gesture behind it. The startup
 *    sound is fired 500ms after the login click and is exactly that case.
 *  - **Unbounded.** A new element per play, none of them released.
 *
 * Decoding each clip once and firing a buffer source per play fixes all three:
 * playback becomes a scheduling call with no I/O, and one unlock during the
 * first gesture covers every sound afterwards.
 */

export type sounds = "startup" | "shutdown" | "recycle";

const FILES: Record<sounds, string> = {
    startup: "audio__startup.wav",
    shutdown: "audio__shutdown.wav",
    recycle: "audio__recycle.wav",
};

const VOLUME = 0.2;

/**
 * Two events landing on the same element from one tap — a synthetic mouseenter
 * and the click behind it — would otherwise fire the same clip twice a few
 * milliseconds apart, which reads as one smeared sound rather than two.
 */
const DEDUPE_MS = 20;

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

let context: AudioContext | null = null;
let contextUnavailable = false;

/**
 * Whether a user gesture has happened yet. Until one has, the context cannot be
 * running, and a sound started against a suspended context is not dropped by the
 * browser — it is scheduled, then fires late and all at once.
 */
let gestureSeen = false;

const buffers = new Map<sounds, AudioBuffer>();
const loading = new Map<sounds, Promise<void>>();
const lastPlayed = new Map<sounds, number>();

const getContext = (): AudioContext | null => {
    if (context || contextUnavailable) return context;
    if (typeof window === "undefined") return null;

    const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
    if (!Ctor) {
        // Nothing to fall back to, but the desktop must not break over a sound
        contextUnavailable = true;
        return null;
    }

    context = new Ctor();
    preload();
    return context;
};

const load = (name: sounds): Promise<void> => {
    const existing = loading.get(name);
    if (existing) return existing;

    const request = (async () => {
        const ctx = getContext();
        if (!ctx) return;

        const response = await fetch(`/audio/${FILES[name]}`);
        const encoded = await response.arrayBuffer();
        // Safari's decodeAudioData settles its callbacks, not the promise
        const decoded = await new Promise<AudioBuffer>((resolve, reject) => {
            ctx.decodeAudioData(encoded, resolve, reject);
        });
        buffers.set(name, decoded);
    })().catch(() => {
        // A clip that will not decode should cost silence, not a crash. Drop the
        // record so a later play retries rather than being stuck on a failure.
        loading.delete(name);
    });

    loading.set(name, request);
    return request;
};

/** Decodes the whole set, so no single play is the one that pays for loading */
const preload = () => {
    (Object.keys(FILES) as sounds[]).forEach(load);
};

/**
 * Safari starts the context suspended and only resumes it from inside a user
 * gesture. Resuming is most of the job; the silent one-frame source is what
 * convinces older iOS the context is genuinely gesture-backed.
 */
const unlock = () => {
    // Set before resume() is even asked for: the click that follows a
    // pointerdown arrives long before the resume promise settles, and that
    // click's own sound is one we do want to hear.
    gestureSeen = true;

    const ctx = getContext();
    if (!ctx) return;

    if (ctx.state !== "running") void ctx.resume();

    const source = ctx.createBufferSource();
    source.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    source.connect(ctx.destination);
    source.start(0);
};

/**
 * Only these count. The activation events a browser will unlock audio on are
 * pointer and key presses — a hover is not one. touchend is here for iOS, which
 * treats it as the activation rather than the pointerdown.
 */
const GESTURES = ["pointerdown", "touchend", "keydown"] as const;

const armUnlock = () => {
    const onGesture = () => {
        unlock();
        GESTURES.forEach((type) => window.removeEventListener(type, onGesture));
    };
    GESTURES.forEach((type) => window.addEventListener(type, onGesture, { passive: true }));
};

if (typeof window !== "undefined") {
    armUnlock();

    /**
     * iOS suspends the context when the page goes into the background, and on an
     * audio interruption such as a call. Coming back needs a fresh gesture, so
     * the listeners go back rather than being a one-time thing — otherwise sound
     * stops working for the rest of the visit.
     */
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState !== "visible") return;
        if (context && context.state !== "running") {
            gestureSeen = false;
            armUnlock();
        }
    });
}

const start = (name: sounds, isLoop: boolean) => {
    const ctx = getContext();
    const buffer = ctx && buffers.get(name);
    if (!ctx || !buffer) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = isLoop;

    const gain = ctx.createGain();
    gain.gain.value = VOLUME;

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);

    // Each play gets its own nodes, released once the clip ends rather than
    // accumulating across a long session
    source.onended = () => {
        source.disconnect();
        gain.disconnect();
    };
};

const playSound = (soundName: sounds, isSoundEnabled: boolean, isLoop: boolean = false) => {
    if (!isSoundEnabled) return;

    const ctx = getContext();
    if (!ctx) return;

    // Nothing has unlocked audio yet, so this cannot be heard now and must not
    // be scheduled for later — that is the backlog. Drop it.
    if (ctx.state !== "running" && !gestureSeen) return;

    const now = performance.now();
    if (now - (lastPlayed.get(soundName) ?? -Infinity) < DEDUPE_MS) return;
    lastPlayed.set(soundName, now);

    const play = () => {
        if (buffers.has(soundName)) {
            start(soundName, isLoop);
            return;
        }
        // Only reachable before the preload finishes. Late beats silent, and it
        // corrects itself immediately after.
        void load(soundName).then(() => start(soundName, isLoop));
    };

    if (ctx.state === "running") {
        play();
        return;
    }

    /**
     * A gesture has happened but resume() has not settled yet. Checked again on
     * the way out: resume() settling does not promise the context actually
     * started, and playing into one that is still suspended is what schedules a
     * sound for later instead of playing it.
     */
    void ctx.resume().then(() => {
        if (ctx.state === "running") play();
    });
};

export default playSound;
