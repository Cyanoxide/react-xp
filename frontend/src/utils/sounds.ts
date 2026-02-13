type sounds = "startup" | "shutdown";

export const loadSound = (sound: sounds) => {
    if (typeof window == "undefined") return;

    const src = "/audio/";

    const sounds = {
        "startup": "audio__startup.wav",
        "shutdown": "audio__shutdown.wav",
    };

    return new Audio(`${src}${sounds[sound]}`);
};

export const playLoadedSound = (audio: HTMLAudioElement | undefined, isSoundEnabled: boolean, isLoop: boolean = false) => {
    if (isSoundEnabled && audio) {
        if (isLoop) audio.loop = true;

        audio.preload = "auto";
        audio.volume = 0.2;

        audio.play().catch(console.error);
    }
};

export const stopLoadedSound = (audio: HTMLAudioElement | undefined) => {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.loop = false;
    }
};

const playSound = (soundName: sounds, isSoundEnabled: boolean, isloop: boolean = false) => {
    const audio = loadSound(soundName);

    if (isSoundEnabled && audio) {
        if (isloop) audio.loop = true;
        audio.volume = 0.2;
        audio.play();
    }
};

export default playSound;