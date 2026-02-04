import { useReducer } from "react";
import { Context } from "./context";
import { reducer, initialState } from "./reducer";
import type { ReactNode } from "react";

export const Provider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <Context value={{ ...state, dispatch }}>
            {children}
        </Context>
    );
};
