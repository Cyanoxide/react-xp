import { useContext } from "../../context/context";
import applicationsJSON from "../../data/applications.json";
import Window from "../Window/Window";
import { WindowContent } from "../WindowContent/WindowContent";
import type { Application } from "../../context/types";

const applications = applicationsJSON as unknown as Record<string, Application>;

const WindowManagement = () => {
    const { currentWindows } = useContext();

    return (
        currentWindows.map((currentWindow) => {
            const appId = currentWindow.appId;

            const {component, content} = applications[currentWindow.appId];
            return <Window key={currentWindow.id} {...currentWindow}><WindowContent key={appId} componentId={component} appId={appId} content={content} /></Window>;
        })
    );
};

export default WindowManagement;