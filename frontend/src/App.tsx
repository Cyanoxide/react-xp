import { Activity, useEffect, useState } from "react";
import Desktop from "./components/Desktop/Desktop";
import Login from "./components/Login/Login";
import TaskBar from "./components/TaskBar/TaskBar";
import Wallpaper from "./components/Wallpaper/Wallpaper";
import WindowManagement from "./components/WindowManagement/WindowManagement";
import { useContext } from "./context/context";

function App() {
    const {isLoginDismissed} = useContext();
    const [isWindowsInitiated, setIsWindowsInitiated] = useState(false);
    const [isTaskbarInitiated, setIsTaskbarInitiated] = useState(false);
    const [isDesktopInitiated, setIsDesktopInitiated] = useState(false);

    useEffect(() => {
        if (!isLoginDismissed) return;

        const desktopDelay = setTimeout(() => {
            setIsDesktopInitiated(true);
        }, 500);

        const taskbarDelay = setTimeout(() => {
            setIsTaskbarInitiated(true);
        }, 1000);

        const windowDelay = setTimeout(() => {
            setIsWindowsInitiated(true);
        }, 1500);

        return () => {
            clearTimeout(taskbarDelay);
            clearTimeout(desktopDelay);
            clearTimeout(windowDelay);
        };
    }, [isLoginDismissed]);

    return (
        <>
            <Wallpaper />
            <Activity mode={(isDesktopInitiated) ? "visible" : "hidden"}>
                <Desktop />
            </Activity>
            <Activity mode={(isTaskbarInitiated) ? "visible" : "hidden"}>
                <TaskBar />
            </Activity>
            <Activity mode={(isWindowsInitiated) ? "visible" : "hidden"}>
                <WindowManagement />
            </Activity>
            <Activity mode={(!isLoginDismissed) ? "visible" : "hidden"}>
                <Login user="User" />
            </Activity>
        </>
    );
}

export default App;
