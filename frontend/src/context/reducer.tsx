import { generateUniqueId } from "../utils/general";
import { defaultWallpaper } from "./defaults";
import type { State, Action } from "./types";

export const reducer = (state: State, action: Action): State => {
    switch (action.type) {
    case "SET_WALLPAPER":
        return { ...state, wallpaper: action.payload };
    case "SET_CURRENT_TIME":
        return { ...state, currentTime: action.payload };
    case "SET_CURRENT_WINDOWS":
        return { ...state, currentWindows: action.payload };
    case "SET_IS_START_VISIBLE":
        return { ...state, isStartVisible: action.payload };
    case "SET_IS_ALL_PROGRAMS_OPEN":
        return { ...state, isAllProgramsOpen: action.payload };
    case "SET_IS_RECENT_DOCUMENTS_OPEN":
        return { ...state, isRecentDocumentsOpen: action.payload };
        case "SET_IS_LOGIN_DISMISSED":
        return { ...state, isLoginDismissed: action.payload };
    default:
        return state;
    }
};

export const initialState: State = {
    wallpaper: defaultWallpaper,
    currentTime: new Date(),
    currentWindows: [{
        id: generateUniqueId(),
        appId: "readme",
        active: true,
        history: [],
        forward: []
    }],
    isStartVisible: false,
    isAllProgramsOpen: false,
    isRecentDocumentsOpen: false,
    isLoginDismissed: false,
};