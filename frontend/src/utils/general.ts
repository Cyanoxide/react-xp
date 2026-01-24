import type { currentWindow } from "../context/types";

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const throttle = (fn: Function, delay: number) => {
    let lastTime = 0;

    return function (...args: unknown[]) {
        const now = new Date().getTime();
        if (now - lastTime >= delay) {
            fn(...args);
            lastTime = now;
        }
    };
}

export const generateUniqueId = () => {
    // Use randomUUID if available otherwise use polyfill
    if (crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = crypto.getRandomValues(new Uint8Array(1))[0] & 15;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export const updateCurrentActiveWindow = (windowId: string, currentWindows: currentWindow[]) => {
    const updatedCurrentWindows = [...currentWindows];
    updatedCurrentWindows.map((currentWindow) => {
        currentWindow.active = (windowId === currentWindow.id) ? true : false;
        console.log(currentWindow.id);
    });

    

    return updatedCurrentWindows;
}