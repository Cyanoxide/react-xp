import { useReducer, useEffect } from "react";
import { Context } from "./context";
import { reducer, initialState } from "./reducer";
import type { ReactNode } from "react";

export const Provider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

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
    }, []);

    return (
        <Context value={{ ...state, dispatch }}>
            {children}
        </Context>
    );
};
