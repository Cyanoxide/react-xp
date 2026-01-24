import type { State, Action } from "./types";
import { defaultWallpaper } from "./defaults";
import { generateUniqueId } from "../utils/general";

export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case "SET_WALLPAPER":
            return { ...state, wallpaper: action.payload };
        case "SET_CURRENT_TIME":
            return { ...state, currentTime: action.payload };
        case "SET_CURRENT_WINDOWS":
            return { ...state, currentWindows: action.payload };
        default:
            return state;
    }
};

export const initialState: State = {
    wallpaper: defaultWallpaper,
    currentTime: new Date(),
    currentWindows: [
        {
            id: generateUniqueId(),
            title: "My Documents",
            icon: "/icon__documents.png",
            content: <div></div>,
            width: 500,
            height: 350,
            top: 5,
            left: 5,
            active: false,
            hidden: false,
        },
        {
            id: generateUniqueId(),
            title: "Internet Explorer",
            icon: "/icon__internet_explorer.png",
            content: <div></div>,
            width: 300,
            height: 450,
            top: 30,
            left: 30,
            active: true,
            hidden: false,
        }
    ]
};