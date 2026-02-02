import { useContext } from "../../context/context";
import Window from "../Window/Window";
import applicationsJSON from "../../data/applications.json";
import type { Application } from "../../context/types";
import { WindowContent } from "../WindowContent/WindowContent";

const applications = applicationsJSON as unknown as Record<string, Application>;

const WindowManagement = () => {
    const { currentWindows } = useContext();

    return (
        currentWindows.map((currentWindow) => {
            const appId = currentWindow.appId;
            const componentId = applications[currentWindow.appId].component;
            return <Window key={currentWindow.id} {...currentWindow}><WindowContent key={appId} componentId={componentId} appId={appId} /></Window>
        })
    )
};

export default WindowManagement;