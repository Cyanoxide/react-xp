import styles from "./InternetExplorer.module.scss";
import WindowMenu from "../../WindowMenu/WindowMenu";
import applicationsJSON from "../../../data/applications.json";
import type { Application } from "../../../context/types";
import { useRef } from "react";
import { getBaseDomain, sameBaseDomain } from "../../../utils/general";


const Applications = applicationsJSON as unknown as Record<string, Application>;

const InternetExplorer = ({ appId }: Record<string, string>) => {
    // const [isBackDisabled, setIsBackDisabled] = useState(true);
    // const [isForwardDisabled, setIsForwardDisabled] = useState(true);

    // useEffect(() => {
    //     const {currentWindow} = getCurrentWindow(currentWindows);
    //     if (!currentWindow) return;

    //     if (currentWindow.history) setIsBackDisabled(currentWindow.history.length === 0);
    //     if (currentWindow.forward) setIsForwardDisabled(currentWindow.forward.length === 0);
    // }, [currentWindows])

    const inputField = useRef<HTMLInputElement | null>(null);
    const appData = Applications[appId];

    const keyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            updateIframe();
        }
    }

    // const backClickHandler = () => {
    //     const {currentWindow, updatedCurrentWindows} = getCurrentWindow(currentWindows);
    //     if (!currentWindow || !currentWindow.history) return;

    //     if (currentWindow.forward) currentWindow.forward.push(currentWindow.appId);

    //     const previousWindowId = currentWindow.history.pop() || "";

    //     currentWindow.appId = previousWindowId;
    //     dispatch({ type: "SET_CURRENT_WINDOWS", payload: updatedCurrentWindows });
    // }

    // const forwardClickHandler = () => {
    //     const {currentWindow, updatedCurrentWindows} = getCurrentWindow(currentWindows);
    //     if (!currentWindow || !currentWindow.forward) return;

    //     if (currentWindow.history) currentWindow.history.push(currentWindow.appId);

    //     const previousWindowId = currentWindow.forward.pop() || "";

    //     currentWindow.appId = previousWindowId;
    //     dispatch({ type: "SET_CURRENT_WINDOWS", payload: updatedCurrentWindows });
    // }

    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    const updateIframe = () => {
        const inputRef = inputField.current;
        const value = (!inputRef?.value.startsWith("http")) ? `https://${inputRef?.value}` : inputRef?.value;
        const wayBackUrl = "https://web.archive.org/web/20030612074004if_/"
        const url = (!value.includes(getBaseDomain())) ? `/proxy.php?url=${wayBackUrl}${value}` : value;

        if (inputRef && iframeRef.current) {
            if (sameBaseDomain(value)) {
                iframeRef.current.setAttribute("sandbox", "allow-same-origin allow-forms");
                iframeRef.current.setAttribute("referrerPolicy", "no-referrer");
            } else {
                iframeRef.current.removeAttribute("sandbox");
                iframeRef.current.removeAttribute("referrerPolicy");
            }
        }

        if (inputRef && iframeRef.current) iframeRef.current.setAttribute("src", url);
    }

    return (
        <>
            <div className={styles.menusContainer}>
                <WindowMenu menuItems={["File", "Edit", "View", "Favorites", "Tools", "Help"]} hasWindowsLogo={true} />
                <section className={`${styles.appMenu} relative`}>
                    <div className="flex absolute">
                        <div className="flex shrink-0">
                            <button className="flex items-center m-0.5 cursor-not-allowed">
                                <img className="mr-2" src="/icon__back.png" width="20" height="20" />
                                <h4>Back</h4>
                                <span className="h-full"><span className={styles.dropdown}>▼</span></span>
                            </button>
                            <button className="flex items-center m-0.5 cursor-not-allowed">
                                <img src="/icon__forward.png" width="20" height="20" />
                                <h4 className="hidden">Forward</h4>
                                <span className="h-full"><span className={styles.dropdown}>▼</span></span>
                            </button>
                            <button className="flex items-center m-0.5 cursor-not-allowed">
                                <img src="" width="20" height="20" />
                                <h4 className="hidden">Stop</h4>
                            </button>
                            <button className="flex items-center m-0.5 cursor-not-allowed">
                                <img src="" width="20" height="20" />
                                <h4 className="hidden">Refresh</h4>
                            </button>
                            <button className="flex items-center m-0.5 cursor-not-allowed">
                                <img src="" width="20" height="20" />
                                <h4 className="hidden">Home</h4>
                            </button>
                        </div>
                        <div className="flex shrink-0">
                            <button className="flex items-center m-0.5 cursor-not-allowed">
                                <img className="mr-2" src="/icon__search--large.png" width="20" height="20" />
                                <h4>Search</h4>
                            </button>
                            <button className="flex items-center m-0.5 cursor-not-allowed">
                                <img className="mr-2" src="" width="20" height="20" />
                                <h4>Favourites</h4>
                            </button>
                            <button className="flex items-center m-0.5 cursor-not-allowed">
                                <img className="mr-2" src="" width="20" height="20" />
                                <h4 className="hidden">History</h4>
                            </button>
                        </div>
                        <div className="flex shrink-0">
                            <button className="flex items-center m-0.5 cursor-not-allowed">
                                <img className="mr-2" src="" width="20" height="20" />
                                <h4 className="hidden">Mail</h4>
                            </button>
                            <button className="flex items-center m-0.5 cursor-not-allowed">
                                <img className="mr-2" src="" width="20" height="20" />
                                <h4 className="hidden">Print</h4>
                            </button>
                            <button className="flex items-center m-0.5 cursor-not-allowed">
                                <img className="mr-2" src="" width="20" height="20" />
                                <h4 className="hidden">Edit</h4>
                            </button>
                            <button className="flex items-center m-0.5 cursor-not-allowed">
                                <img className="mr-2" src="" width="20" height="20" />
                                <h4 className="hidden">Messenger</h4>
                            </button>
                        </div>
                    </div>
                </section>
                <section className={`${styles.navMenu} relative`}>
                    <div className="w-full h-full flex items-center absolute px-3">
                        <span className={`${styles.navLabel} mr-1`}>Address</span>

                        <div className={`${styles.navBar} flex mx-1 h-full`}>
                            <img src={appData.icon || appData.iconLarge} className="mx-1" width="14" height="14" />
                            <input ref={inputField} className={`${styles.navBar} h-full`} type="text" defaultValue="https://www.jamiepates.com" onKeyDown={keyDownHandler} />
                            <button className={styles.dropDown}>Submit</button>
                        </div>
                        <button className={`${styles.goButton} flex items-center`} onClick={() => updateIframe()}>
                            <img src="/icon__go.png" className="mr-1.5" width="19" height="19" />
                            <span>Go</span>
                        </button>
                    </div>
                </section>
            </div>
            <main className={`${styles.mainContent} h-full flex overflow-auto`}>
                <iframe ref={iframeRef} src="https://www.jamiepates.com" width="100%" height="100%" />
            </main >
        </>
    );
};

export default InternetExplorer;