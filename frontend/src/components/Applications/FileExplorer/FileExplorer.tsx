import styles from "./FileExplorer.module.scss";
import WindowMenu from "../../WindowMenu/WindowMenu";
import CollapseBox from "../../CollapseBox/CollapseBox";
import applicationsJSON from "../../../data/applications.json";
import type { Application } from "../../../context/types";
import { useContext } from "../../../context/context";
import { useRef } from "react";

const Applications = applicationsJSON as unknown as Record<string, Application>;

const FileExplorer = ({ appId }: Record<string, string>) => {
    const { currentWindows, dispatch } = useContext();

    const inputField = useRef<HTMLInputElement | null>(null);
    const appData = Applications[appId];

    const bgAccent = (["pictures", "music"].includes(appId) ? appId : null);

    const updateWindow = () => {
        const inputRef = inputField.current;
        const value = (inputRef) ? inputRef.value.toLowerCase() : null;
        if (!inputRef || !value) return;

        const titleAppIdMap = Object.fromEntries(
            Object.entries(Applications).map(([key, app]) => [app.title.toLowerCase(), key])
        );

        const updatedCurrentWindows = [...currentWindows];
        const currentWindow = updatedCurrentWindows.find((item) => item.active === true);
        if (!currentWindow) return;

        if (!(value in titleAppIdMap)) {
            inputRef.value = appData.title;
            return;
        }

        currentWindow.appId = titleAppIdMap[value];
        dispatch({ type: "SET_CURRENT_WINDOWS", payload: updatedCurrentWindows });
    }

    const keyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            updateWindow();
        }
    }

    const onClickHandler = () => {

    }

    return (
        <>
            <WindowMenu menuItems={["File", "Edit", "View", "Favorites", "Tools", "Help"]} hasWindowsLogo={true} />
            <section className={`${styles.appMenu} relative`}>
                <div className="flex absolute">
                    <div className="flex shrink-0">
                        <button className="flex items-center m-0.5">
                            <img className="mr-2" src="/icon__back.png" width="20" height="20" />
                            <h4>Back</h4>
                            <span className="h-full"><span className={styles.dropdown}>▼</span></span>
                        </button>
                        <button className="flex items-center m-0.5">
                            <img src="/icon__forward.png" width="20" height="20" />
                            <h4 className="hidden">Forward</h4>
                            <span className="h-full"><span className={styles.dropdown}>▼</span></span>
                        </button>
                        <button className="flex items-center m-0.5">
                            <img src="/icon__up.png" width="20" height="20" />
                            <h4 className="hidden">Up</h4>
                        </button>
                    </div>
                    <div className="flex shrink-0">
                        <button className="flex items-center m-0.5">
                            <img className="mr-2" src="/icon__search--large.png" width="20" height="20" />
                            <h4>Search</h4>
                        </button>
                        <button className="flex items-center m-0.5">
                            <img className="mr-2" src="/icon__folders.png" width="20" height="20" />
                            <h4>Folders</h4>
                        </button>
                    </div>
                    <div className="flex shrink-0">
                        <button className="flex items-center m-0.5" data-label="views">
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
                        <input ref={inputField} className={`${styles.navBar} h-full`} type="text" defaultValue={appData.title} onKeyDown={keyDownHandler} />
                        <button className={styles.dropDown}>Submit</button>
                    </div>
                    <button className={`${styles.goButton} flex items-center`} onClick={updateWindow}>
                        <img src="/icon__go.png" className="mr-1.5" width="19" height="19" />
                        <span>Go</span>
                    </button>
                </div>
            </section>
            <main className={`${styles.mainContent} h-full flex overflow-auto`} data-bg-accent={bgAccent}>
                <aside className={`${styles.sidebar} h-full`}>
                    <CollapseBox title="File & Folder Tasks">
                        <ul className="flex flex-col gap-2 p-3">
                            <li className="flex items-start">
                                <img src="/icon__new_folder--large.png" className="mr-2" width="12" height="12" />
                                <p>Make a new folder</p>
                            </li>
                            <li className="flex items-start">
                                <img src="/icon__publish_web--large.png" className="mr-2" width="12" height="12" />
                                <p>Publish this folder to the web</p>
                            </li>
                            <li className="flex items-start">
                                <img src="/icon__file_explorer.png" className="mr-2" width="12" height="12" />
                                <p>Share this folder</p>
                            </li>
                        </ul>
                    </CollapseBox>
                    <CollapseBox title="Other Places">
                        <ul className="flex flex-col gap-2 p-3">
                            <li className="flex items-start">
                                <img src="/icon__desktop--large.png" className="mr-2" width="12" height="12" />
                                <p>Desktop</p>
                            </li>
                            <li className="flex items-start">
                                <img src="/icon__computer.png" className="mr-2" width="12" height="12" />
                                <p>My Computer</p>
                            </li>
                            <li className="flex items-start">
                                <img src="/icon__network_places--large.png" className="mr-2" width="12" height="12" />
                                <p>My Network Places</p>
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
            </main>
        </>
    );
};

export default FileExplorer;