import { useReducer, useEffect } from "react";
import { Context } from "./context";
import { reducer, initialState } from "./reducer";
import type { ReactNode } from "react";

export const Provider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const loginDismissedJSON = sessionStorage.getItem("loginDismissed");
        if (loginDismissedJSON) {
            try {
                const loginDismissed = JSON.parse(loginDismissedJSON);
                dispatch({ type: "SET_IS_LOGIN_DISMISSED", payload: loginDismissed });
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
