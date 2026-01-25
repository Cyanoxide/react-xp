import type { ReactNode } from "react";

export interface currentWindow {
    title: string,
    icon: string,
    content: ReactNode,
    id: string,
    width?: number,
    height?: number,
    top?: number,
    left?: number,
    active?: boolean,
    hidden?: boolean,
}
export type currentWindows = currentWindow[];

export interface State {
    wallpaper: string;
    currentTime: Date;
    currentWindows: currentWindow[];
}

export type Action =
    | { type: "SET_WALLPAPER"; payload: string }
    | { type: "SET_CURRENT_TIME"; payload: Date }
    | { type: "SET_CURRENT_WINDOWS"; payload: currentWindow[] }


export interface ContextType extends State {
    dispatch: React.Dispatch<Action>;
}