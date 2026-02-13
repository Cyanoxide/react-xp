import { Activity, useEffect } from "react";
import Desktop from "./components/Desktop/Desktop";
import Login from "./components/Login/Login";
import TaskBar from "./components/TaskBar/TaskBar";
import Wallpaper from "./components/Wallpaper/Wallpaper";
import WindowManagement from "./components/WindowManagement/WindowManagement";
import { useContext } from "./context/context";

function App() {
    const {windowsInitiationState, isInitialBoot, initiationStage, dispatch} = useContext();

    useEffect(() => {
        const delayMap = [500, 500, 500];
        if (windowsInitiationState !== "loggedIn" || initiationStage >= delayMap.length) return;
        
        if(isInitialBoot) dispatch({ type: "SET_IS_INITIAL_BOOT", payload: false });
        
        const delay = setTimeout(() => {
            dispatch({ type: "SET_INITIATION_STAGE", payload: initiationStage + 1});

        }, delayMap[initiationStage]);

        return () => clearTimeout(delay);
    }, [isInitialBoot, initiationStage, windowsInitiationState, dispatch]);

    return (
        <>
            <Activity mode={(["shutDown", "bios", "welcome", "transition", "login", "loggingIn"].includes(windowsInitiationState)) ? "visible" : "hidden"}>
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
            <div id="modal"></div>
        </>
    );
}

export default App;
