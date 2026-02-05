import { useRef, useState, useEffect } from "react";
import { useContext } from "../../../context/context";
import applicationsJSON from "../../../data/applications.json";
import filesJSON from "../../../data/files.json";
import { getCurrentWindow } from "../../../utils/general";
import CollapseBox from "../../CollapseBox/CollapseBox";
import WindowMenu from "../../WindowMenu/WindowMenu";
import styles from "./FileExplorer.module.scss";
import type { Application } from "../../../context/types";

const Applications = applicationsJSON as unknown as Record<string, Application>;
const Files = filesJSON as unknown as Record<string, string[] | File[]>;

const FileExplorer = ({ appId }: Record<string, string>) => {
    const { currentWindows, dispatch } = useContext();
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [isBackDisabled, setIsBackDisabled] = useState(true);
    const [isForwardDisabled, setIsForwardDisabled] = useState(true);

    useEffect(() => {
        const { currentWindow } = getCurrentWindow(currentWindows);
        if (!currentWindow) return;

        if (currentWindow.history) setIsBackDisabled(currentWindow.history.length === 0);
        if (currentWindow.forward) setIsForwardDisabled(currentWindow.forward.length === 0);
    }, [currentWindows]);

    const inputFieldRef = useRef<HTMLInputElement | null>(null);
    const appData = Applications[appId];

    const bgAccent = (["pictures", "music"].includes(appId) ? appId : null);
    const documents = Files[appId];

    const updateWindow = (appId: string | null = null) => {
        if (appId && Applications[appId].link) return window.open(Applications[appId].link, "_blank", "noopener,noreferrer");

        const inputField = inputFieldRef.current;
        const value = (inputField) ? inputField.value.toLowerCase() : null;
        if (!inputField || !value) return;

        const titleAppIdMap = Object.fromEntries(
            Object.entries(Applications).map(([key, app]) => [app.title.toLowerCase(), key])
        );

        const { currentWindow, updatedCurrentWindows } = getCurrentWindow(currentWindows);
        if (!currentWindow || currentWindow.appId === appId) return;

        if (!(value in titleAppIdMap)) {
            inputField.value = appData.title;
            return;
        }

        if (currentWindow.history && currentWindow.history.at(-1) !== currentWindow.appId) {
            currentWindow.history.push(currentWindow.appId);
        };

        if (currentWindow.forward) currentWindow.forward = [];

        currentWindow.appId = appId || titleAppIdMap[value];
        dispatch({ type: "SET_CURRENT_WINDOWS", payload: updatedCurrentWindows });
    };

    const keyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            updateWindow();
        }
    };

    const fileDBClickHandler = (_: unknown, appId: string | null = null) => {
        if (!appId || Applications[appId].disabled) return;

        updateWindow(Applications[appId].redirect || appId);
    };

    const fileClickHandler = (_: unknown, appId: string | null = null) => {
        if (!appId) return;
        setSelectedItem(appId);

        const secondClick = (e: PointerEvent) => onSecondClick(e, appId);
        const onSecondClick = (event: PointerEvent, appId: string) => {
            const target = (event.target as HTMLElement);

            const targetId = (target.closest("[data-selected]") as HTMLElement)?.dataset.id;
            if (targetId === appId) return;

            setSelectedItem((targetId) ? targetId : null);

            document.removeEventListener("click", secondClick);
        };
        document.addEventListener("click", secondClick);
    };

    const backClickHandler = () => {
        const { currentWindow, updatedCurrentWindows } = getCurrentWindow(currentWindows);
        if (!currentWindow || !currentWindow.history) return;

        if (currentWindow.forward) currentWindow.forward.push(currentWindow.appId);

        const previousWindowId = currentWindow.history.pop() || "";

        currentWindow.appId = previousWindowId;
        dispatch({ type: "SET_CURRENT_WINDOWS", payload: updatedCurrentWindows });
    };

    const forwardClickHandler = () => {
        const { currentWindow, updatedCurrentWindows } = getCurrentWindow(currentWindows);
        if (!currentWindow || !currentWindow.forward) return;

        if (currentWindow.history && currentWindow.history.at(-1) !== currentWindow.appId) {
            currentWindow.history.push(currentWindow.appId);
        };

        const previousWindowId = currentWindow.forward.pop() || "";

        currentWindow.appId = previousWindowId;
        dispatch({ type: "SET_CURRENT_WINDOWS", payload: updatedCurrentWindows });
    };

    return (
        <>
            <div className={styles.menusContainer}>
                <WindowMenu menuItems={["File", "Edit", "View", "Favorites", "Tools", "Help"]} hasWindowsLogo={true} />
                <section className={`${styles.appMenu} relative`}>
                    <div className="flex absolute">
                        <div className="flex shrink-0">
                            <button className="flex items-center m-0.5" onClick={backClickHandler} disabled={isBackDisabled}>
                                <img className="mr-2" src="/icon__back.png" width="20" height="20" />
                                <h4>Back</h4>
                                <span className="h-full"><span className={styles.dropdown}>▼</span></span>
                            </button>
                            <button className="flex items-center m-0.5" onClick={forwardClickHandler} disabled={isForwardDisabled}>
                                <img src="/icon__forward.png" width="20" height="20" />
                                <h4 className="hidden">Forward</h4>
                                <span className="h-full"><span className={styles.dropdown}>▼</span></span>
                            </button>
                            <button className="flex items-center m-0.5 cursor-not-allowed">
                                <img src="/icon__up.png" width="20" height="20" />
                                <h4 className="hidden">Up</h4>
                            </button>
                        </div>
                        <div className="flex shrink-0">
                            <button className="flex items-center m-0.5 cursor-not-allowed">
                                <img className="mr-2" src="/icon__search--large.png" width="20" height="20" />
                                <h4>Search</h4>
                            </button>
                            <button className="flex items-center m-0.5 cursor-not-allowed">
                                <img className="mr-2" src="/icon__folders.png" width="20" height="20" />
                                <h4>Folders</h4>
                            </button>
                        </div>
                        <div className="flex shrink-0">
                            <button className="flex items-center m-0.5 cursor-not-allowed" data-label="views">
                                <img src="/icon__views.png" width="20" height="20" />
                                <h4 className="hidden">Views</h4>
                                <span className="h-full"><span className={styles.dropdown}>▼</span></span>
                            </button>
                        </div>
                    </div>
                </section>
                <section className={`${styles.navMenu} relative`}>
                    <div className="w-full h-full flex items-center absolute px-3">
                        <span className={`${styles.navLabel} mr-1`}>Address</span>

                        <div className={`${styles.navBar} flex mx-1 h-full`}>
                            <img src={appData.icon || appData.iconLarge} className="mx-1" width="14" height="14" />
                            <input ref={inputFieldRef} className={`${styles.navBar} h-full`} type="text" defaultValue={appData.title} onKeyDown={keyDownHandler} />
                            <button className={styles.dropDown}>Submit</button>
                        </div>
                        <button className={`${styles.goButton} flex items-center`} onClick={() => updateWindow()}>
                            <img src="/icon__go.png" className="mr-1.5" width="19" height="19" />
                            <span>Go</span>
                        </button>
                    </div>
                </section>
            </div>
            <main className={`${styles.mainContent} h-full flex overflow-auto`} data-bg-accent={bgAccent}>
                <aside className={`${styles.sidebar} h-full`}>
                    <CollapseBox title="File & Folder Tasks">
                        <ul className="flex flex-col gap-2 p-3">
                            <li className="flex items-center">
                                <img src="/icon__new_folder--large.png" className="mr-2" width="12" height="12" />
                                <p>Make a new folder</p>
                            </li>
                            <li className="flex items-start">
                                <img src="/icon__publish_web--large.png" className="mr-2" width="12" height="12" />
                                <p>Publish this folder to the web</p>
                            </li>
                            <li className="flex items-center">
                                <img src="/icon__file_explorer.png" className="mr-2" width="12" height="12" />
                                <p>Share this folder</p>
                            </li>
                        </ul>
                    </CollapseBox>
                    <CollapseBox title="Other Places">
                        <ul className="flex flex-col gap-2 p-3">
                            <li>
                                <button className="flex items-center" onClick={() => updateWindow("desktop")}>
                                    <img src="/icon__desktop--large.png" className="mr-2" width="12" height="12" />
                                    <p>Desktop</p>
                                </button>
                            </li>
                            <li>
                                <button className="flex items-center" onClick={() => updateWindow("computer")}>
                                    <img src="/icon__computer.png" className="mr-2" width="12" height="12" />
                                    <p>My Computer</p>
                                </button>
                            </li>
                            <li>
                                <button className="flex items-center" onClick={() => updateWindow("recycleBin")}>
                                    <img src="/icon__recycle_bin.png" className="mr-2" width="12" height="12" />
                                    <p>Recycle Bin</p>
                                </button>
                            </li>
                        </ul>
                    </CollapseBox>
                    <CollapseBox title="Details">
                        <div className="p-3">
                            <h3 className="font-bold">{appData.title}</h3>
                            <p>System Folder</p>
                        </div>
                    </CollapseBox>
                </aside>
                <section className={`${styles.contents} relative w-full`}>
                    <div className="absolute inset-0 p-3 h-fit">
                        {appId === "computer" && <h3 className="w-full">Files Stored on this Computer</h3>}
                        {documents.map((item) => {
                            if (item === appId) return;

                            const itemId = (Array.isArray(item) ? item[0] : item);
                            const appData = Applications[itemId];
                            if (!appData) return;
                            
                            const isActive = (selectedItem === itemId);
                            const { title, icon, iconLarge, disabled, link } = appData;
                            const imageMask = (isActive) ? `url("${iconLarge || icon}")` : "";
                            
                            return (
                                <button key={itemId} data-id={itemId} data-selected={isActive} data-link={!!link} className={`${styles.file} ${(disabled) ? "cursor-not-allowed" : ""}`} onDoubleClick={(e) => fileDBClickHandler(e, itemId)} onClick={(e) => fileClickHandler(e, itemId)}>
                                    <span className="flex items-center shrink-0" style={{ maskImage: imageMask }}><img src={iconLarge || icon} width="35" height="35" draggable={false} /></span>
                                    <h4 className="px-0.5">{title}</h4>
                                </button>
                            );
                        })}
                        {appId === "computer" && <h3 className="w-full">Hard Disk Drives</h3>}

                    </div>
                </section>
            </main>
        </>
    );
};

export default FileExplorer;