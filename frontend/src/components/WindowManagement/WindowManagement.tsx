import { useContext } from "../../context/context";
import Window from "../Window/Window";
import applicationsJSON from "../../data/applications.json";
import type { Application } from "../../context/types";

const applications = (applicationsJSON as unknown as { [key: string]: Application });

const WindowManagement = () => {
    const { currentWindows } = useContext();

    return (
        currentWindows.map((currentWindow) => {
            const { content } = { ...applications[currentWindow.appId] };

            return <Window key={currentWindow.id} {...currentWindow}>{content}</Window>
        })
    )
};

export default WindowManagement;