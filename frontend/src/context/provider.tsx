import { useReducer, useEffect } from "react";
import { Context } from "./context";
import { reducer, initialState } from "./reducer";
import type { ReactNode } from "react";

export const Provider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        if (state.isCRTEnabled) {
            document.body.classList.add("crt-effect");
        } else {
            document.body.classList.remove("crt-effect");
        }
    }, [state.isCRTEnabled]);

    useEffect(() => {
        if (state.themeColor) {
            document.body.setAttribute("data-theme", state.themeColor);
        } else {
            document.body.removeAttribute("data-theme");
        }
    }, [state.themeColor]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const loggedInJSON = sessionStorage.getItem("loggedIn");
        if (loggedInJSON) {
            try {
                const loggedIn = JSON.parse(loggedInJSON);
                if(!loggedIn) return;
                
                dispatch({ type: "SET_WINDOWS_INITIATION_STATE", payload: "loggedIn"});
            } catch (error) {
                console.error("Failed to parse windowColor from localStorage", error);
            }
        }

        const wallpaper = sessionStorage.getItem("wallpaper");
        if (wallpaper) {
            try {
                if(!wallpaper) return;
                
                dispatch({ type: "SET_WALLPAPER", payload: wallpaper});
            } catch (error) {
                console.error("Failed to parse wallpaper from localStorage", error);
            }
        }
    }, []);

    return (
        <Context value={{ ...state, dispatch }}>
            {children}
        </Context>
    );
};
