import { Activity, useEffect, useState } from "react";
import Bios from "./components/Bios/Bios";
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
    const [isBiosComplete, setIsBiosComplete] = useState(false);

    useEffect(() => {
        const biosDelay = setTimeout(() => {
            setIsBiosComplete(true);
        }, 3000);

        return () => clearTimeout(biosDelay);
    }, []);

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
            <Activity mode={(!isLoginDismissed && !isBiosComplete) ? "visible" : "hidden"}>
                <Bios />
            </Activity>
            <Activity mode={(!isLoginDismissed && isBiosComplete) ? "visible" : "hidden"}>
                <Login user="User" />
            </Activity>
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
        </>
    );
}

export default App;
