import type { ReactNode } from "react";

export interface startMenuItem {
    title: string;
    icon: string;
    content: ReactNode | string;
    hasSubMenu?: boolean;
}

export interface currentWindow {
    title: string;
    icon: string;
    content: ReactNode;
    id: string | number;
    width?: number;
    height?: number;
    top?: number;
    left?: number;
    active?: boolean;
    hidden?: boolean;
}
export type currentWindows = currentWindow[];

export interface State {
    wallpaper: string;
    currentTime: Date;
    currentWindows: currentWindow[];
    isStartVisible: boolean;
    isAllProgramsOpen: boolean;
}

export type Action =
    | { type: "SET_WALLPAPER"; payload: string }
    | { type: "SET_CURRENT_TIME"; payload: Date }
    | { type: "SET_CURRENT_WINDOWS"; payload: currentWindow[] }
    | { type: "SET_IS_START_VISIBLE"; payload: boolean }
    | { type: "SET_IS_ALL_PROGRAMS_OPEN"; payload: boolean }


export interface ContextType extends State {
    dispatch: React.Dispatch<Action>;
}