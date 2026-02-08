import { Activity } from "react";
import Desktop from "./components/Desktop/Desktop";
import Login from "./components/Login/Login";
import TaskBar from "./components/TaskBar/TaskBar";
import Wallpaper from "./components/Wallpaper/Wallpaper";
import WindowManagement from "./components/WindowManagement/WindowManagement";
import { useContext } from "./context/context";

function App() {
    const {isLoginDismissed} = useContext();

    return (
        <>
            <Wallpaper />
            <Desktop />
            <TaskBar />
            <WindowManagement />
            <Activity mode={(!isLoginDismissed) ? "visible" : "hidden"}>
                <Login user="User" />
            </Activity>
        </>
    );
}

export default App;
