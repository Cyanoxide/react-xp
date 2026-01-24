import { useContext } from "../../context/context";
import Window from "../Window/Window";

const WindowManagement = () => {
    const { currentWindows } = useContext();

    return (
        currentWindows.map((currentWindow) => {
            return <Window key={currentWindow.id} {...currentWindow}>{currentWindow.content}</Window>
        })
    )
};

export default WindowManagement;