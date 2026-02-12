import type { ReactNode } from "react";

export interface startMenuItem {
    title: string;
    icon: string;
    content: ReactNode | string;
    hasSubMenu?: boolean;
}

export interface currentWindow {
    appId: string;
    id: string | number;
    width?: number;
    height?: number;
    top?: number;
    left?: number;
    active?: boolean;
    hidden?: boolean;
    history?: string[];
    forward?: string[];
    landingUrl?: string | null;
}
export type currentWindows = currentWindow[];

export interface AbsoluteObject {
    top?: number | undefined;
    right?: number | undefined;
    bottom?: number | undefined;
    left?: number | undefined;
}

export interface Application {
    title: string;
    icon?: string;
    iconLarge?: string;
    content: ReactNode | string;
    component?: string | undefined;
    link?: string;
    disabled?: boolean;
    redirect?: string;
    resizable?: boolean;
}

export type File = AbsoluteObject & {
    id: string;
}

export type windowsInitiationState = "bios" | "welcome" | "login" | "loggingIn" | "loggedIn";

export interface State {
    wallpaper: string;
    currentTime: Date;
    currentWindows: currentWindow[];
    isStartVisible: boolean;
    isAllProgramsOpen: boolean;
    isRecentDocumentsOpen: boolean;
    isShutDownModalOpen: boolean;
    windowsInitiationState: windowsInitiationState;
    initiationStage: number;
}

export type Action =
    | { type: "SET_WALLPAPER"; payload: string }
    | { type: "SET_CURRENT_TIME"; payload: Date }
    | { type: "SET_CURRENT_WINDOWS"; payload: currentWindow[] }
    | { type: "SET_IS_START_VISIBLE"; payload: boolean }
    | { type: "SET_IS_ALL_PROGRAMS_OPEN"; payload: boolean }
    | { type: "SET_IS_RECENT_DOCUMENTS_OPEN"; payload: boolean }
    | { type: "SET_IS_SHUTDOWN_MODAL_OPEN"; payload: boolean }
    | { type: "SET_WINDOWS_INITIATION_STATE"; payload: windowsInitiationState; }
    | { type: "SET_INITIATION_STAGE"; payload: number; }

    

export interface ContextType extends State {
    dispatch: React.Dispatch<Action>;
}