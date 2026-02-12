import { Activity, useEffect, useState } from "react";
import Bios from "./components/Bios/Bios";
import Desktop from "./components/Desktop/Desktop";
import Login from "./components/Login/Login";
import ShutDownModal from "./components/ShutDownModal/ShutDownModal";
import TaskBar from "./components/TaskBar/TaskBar";
import Wallpaper from "./components/Wallpaper/Wallpaper";
import WindowManagement from "./components/WindowManagement/WindowManagement";
import { useContext } from "./context/context";

function App() {
    const {windowsInitiationState, isShutDownModalOpen, dispatch} = useContext();
    const [initiationStage, setInitiationStage] = useState(0);

    useEffect(() => {
        if (windowsInitiationState !== "bios") return;

        const biosDelay = setTimeout(() => {
            dispatch({ type: "SET_WINDOWS_INITIATION_STATE", payload: "welcome" });
        }, 3000);

        return () => clearTimeout(biosDelay);
    }, [dispatch, windowsInitiationState]);

    useEffect(() => {
        const delayMap = [500, 500, 500];
        if (windowsInitiationState !== "loggedIn" || initiationStage >= delayMap.length) return;
        
        const delay = setTimeout(() => {
            setInitiationStage((prev) => prev + 1);
        }, delayMap[initiationStage]);

        return () => clearTimeout(delay);
    }, [initiationStage, windowsInitiationState]);

    return (
        <>
            <Activity mode={(windowsInitiationState === "bios") ? "visible" : "hidden"}>
                <Bios />
            </Activity>
            <Activity mode={(["welcome", "login", "loggingIn"].includes(windowsInitiationState)) ? "visible" : "hidden"}>
                <Login user="User" />
            </Activity>
            <Wallpaper />
            <Activity mode={(initiationStage > 0) ? "visible" : "hidden"}>
                <Desktop />
            </Activity>
            <Activity mode={(initiationStage > 1) ? "visible" : "hidden"}>
                <TaskBar />
            </Activity>
            <Activity mode={(initiationStage > 2) ? "visible" : "hidden"}>
                <WindowManagement />
            </Activity>
            <Activity mode={(isShutDownModalOpen) ? "visible" : "hidden"}>
                <ShutDownModal/>
            </Activity>
            {/* <Activity mode={(isShutDownModalOpen) ? "visible" : "hidden"}>
                <ShutDownModal isLogout={true} />
            </Activity> */}
        </>
    );
}

export default App;
