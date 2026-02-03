import type { currentWindow } from "../context/types";
import type { Action } from "../context/types";

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

export const updateCurrentActiveWindow = (windowId: string | number, currentWindows: currentWindow[]) => {
    const updatedCurrentWindows = [...currentWindows];
    updatedCurrentWindows.map((currentWindow) => {
        if (windowId === currentWindow.id) {
            currentWindow.hidden = false
            currentWindow.active = true
        } else currentWindow.active = false
    });

    return updatedCurrentWindows;
}

export const openApplication = (appId: string, currentWindows: currentWindow[], dispatch: (value: Action) => void) => {
    const newWindow: currentWindow = {
        id: generateUniqueId(),
        appId,
        active: true,
        history: [],
        forward: []
    }

    const updatedCurrentWindows = [...currentWindows];
    updatedCurrentWindows.push(newWindow);
    dispatch({ type: "SET_CURRENT_WINDOWS", payload: updatedCurrentWindows });
}

export const getCurrentWindow = (currentWindows: currentWindow[]) => {
    const updatedCurrentWindows = [...currentWindows];
    const currentWindow = updatedCurrentWindows.find((item) => item.active === true);
    return { currentWindow, updatedCurrentWindows };
}

export const getBaseDomain = (url: string = window.location.hostname) => {
    if (url === "localhost") return "localhost";

    const parts = url.split(".");

    if (parts.length >= 2) {
        return parts.slice(-2).join(".");
    }

    return url;
}

export const sameBaseDomain = (urlA: string, urlB: string = window.location.hostname) => {
    try {
        const a = getBaseDomain(new URL(urlA).hostname);
        const b = getBaseDomain(new URL(urlB).hostname);
        return a === b;
    } catch {
        return false;
    }
}