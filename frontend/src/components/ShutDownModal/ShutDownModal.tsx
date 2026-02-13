import { createPortal } from "react-dom";
import { useContext } from "../../context/context";
import playSound from "../../utils/sounds";
import Button from "../Button/Button";
import styles from "./ShutDownModal.module.scss";

interface ShutDownModalProps {
    isLogout?: boolean
}

const ShutDownModal = ({ isLogout = true }: ShutDownModalProps) => {
    const {dispatch} = useContext();
    
    const closeModel = () => {
        dispatch({ type: "SET_IS_SHUTDOWN_MODAL_OPEN", payload: false});
    };

    const logOutHandler = (isSwitchUsers = false) => {
        if (!isSwitchUsers) {
            dispatch({ type: "SET_CURRENT_WINDOWS", payload: []});
            playSound("shutdown", true);
        }

        dispatch({ type: "SET_IS_SHUTDOWN_MODAL_OPEN", payload: false});
        dispatch({ type: "SET_TRANSITION_LABEL", payload: "Logging off..."});
        dispatch({ type: "SET_WINDOWS_INITIATION_STATE", payload: "transition"});

        const delayAmount = (isSwitchUsers ? 0 : 1000);
        const delay = setTimeout(() => {
            dispatch({ type: "SET_WINDOWS_INITIATION_STATE", payload: "login"});
            dispatch({ type: "SET_INITIATION_STAGE", payload: 0});
            clearTimeout(delay);
        }, delayAmount);
    };

    const shutDownHandler = (isRestart = false) => {
        dispatch({ type: "SET_CURRENT_WINDOWS", payload: []});
        playSound("shutdown", true);

        dispatch({ type: "SET_IS_SHUTDOWN_MODAL_OPEN", payload: false});
        dispatch({ type: "SET_TRANSITION_LABEL", payload: "Logging off..."});
        dispatch({ type: "SET_WINDOWS_INITIATION_STATE", payload: "transition"});

        const logoutDelay = setTimeout(() => {
            dispatch({ type: "SET_TRANSITION_LABEL", payload: "Windows is shutting down…"});
            clearTimeout(logoutDelay);
        }, 1000);

        const shutdownDelay = setTimeout(() => {
            dispatch({ type: "SET_WINDOWS_INITIATION_STATE", payload: "shutDown"});
            sessionStorage.removeItem("loggedIn");
            
            clearTimeout(shutdownDelay);
            
            if(isRestart) window.location.reload();
        }, 2000);
    };

    const modalElement = document.getElementById("modal");

    return createPortal(
        <div className={`${styles.container} flex h-full w-full absolute z-10 inset-0`}>
            <div className={`${styles.shutDownModal} m-auto flex flex-col`}>
                <div className="flex justify-between items-center h-1/5 pl-5 pr-4">
                    <h3 className="text-2xl">{(isLogout) ? "Log off Windows" : "Turn off computer"}</h3>
                    <img src="/favicon.png" width="28" height="28" />
                </div>
                <main className="flex justify-center gap-16 h-3/5 text-center">
                    {!isLogout && (
                        <>
                            <button className="flex flex-col items-center justify-center font-bold" disabled>
                                <img src="/icon__shut_down--large.png" className="mb-3" height="33" width="33" />
                                <p>Stand By</p>
                            </button>
                            <button className="flex flex-col items-center justify-center font-bold cursor-not-allowed" onClick={() => shutDownHandler()}>
                                <img src="/icon__shut_down--large.png" className="mb-3" height="33" width="33" />
                                <p>Shut Down</p>
                            </button>
                            <button className="flex flex-col items-center justify-center font-bold cursor-not-allowed" onClick={() => shutDownHandler(true)}>
                                <img src="/icon__restart--large.png" className="mb-3" height="33" width="33" />
                                <p>Restart</p>
                            </button>
                        </>
                    )}
                    {isLogout && (
                        <>
                            <button className="flex flex-col items-center justify-center font-bold" onClick={() => logOutHandler(true)}>
                                <img src="/icon__switch_users--large.png" className="mb-3" height="33" width="33" />
                                <p>Switch Users</p>
                            </button>
                            <button className="flex flex-col items-center justify-center font-bold" onClick={() => logOutHandler()}>
                                <img src="/icon__log_out--large.png" className="mb-3" height="33" width="33" />
                                <p>Log Off</p>
                            </button>
                        </>
                    )}
                </main>
                <div className="flex justify-end items-center h-1/5 p-6">
                    <Button onClick={closeModel}>Cancel</Button>
                </div>
            </div>
        </div>
        , modalElement as HTMLElement);
};

export default ShutDownModal;
