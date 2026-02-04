import { useRef, useState, useEffect } from "react";
import { useContext } from "../../../context/context";
import applicationsJSON from "../../../data/applications.json";
import { getBaseDomain, sameBaseDomain } from "../../../utils/general";
import { getCurrentWindow } from "../../../utils/general";
import WindowMenu from "../../WindowMenu/WindowMenu";
import styles from "./InternetExplorer.module.scss";
import type { Application } from "../../../context/types";


const Applications = applicationsJSON as unknown as Record<string, Application>;

const InternetExplorer = ({ appId }: Record<string, string>) => {
    const { currentWindows, dispatch } = useContext();
    const [isBackDisabled, setIsBackDisabled] = useState(true);
    const [isForwardDisabled, setIsForwardDisabled] = useState(true);
    const HOMEPAGE = "https://www.jamiepates.com";

    useEffect(() => {
        const { currentWindow } = getCurrentWindow(currentWindows);
        if (!currentWindow) return;

        if (currentWindow.history) setIsBackDisabled(currentWindow.history.length === 0);
        if (currentWindow.forward) setIsForwardDisabled(currentWindow.forward.length === 0);
    }, [currentWindows]);

    const inputFieldRef = useRef<HTMLInputElement | null>(null);
    const inputField = inputFieldRef.current;
    const currentUrl = (inputField) ? inputField.value : null;

    const appData = Applications[appId];

    const keyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            goClickHandler();
        }
    };

    const backClickHandler = () => {
        const { currentWindow, updatedCurrentWindows } = getCurrentWindow(currentWindows);
        if (!currentWindow || !currentWindow.history || !inputField) return;

        if (currentWindow.forward && currentUrl) currentWindow.forward.push(currentUrl);
        const previousUrl = currentWindow.history.pop() || "";

        inputField.value = previousUrl;
        updateIframe();

        dispatch({ type: "SET_CURRENT_WINDOWS", payload: updatedCurrentWindows });
    };

    const forwardClickHandler = () => {
        const { currentWindow, updatedCurrentWindows } = getCurrentWindow(currentWindows);
        if (!currentWindow || !currentWindow.forward || !inputField) return;

        if (currentWindow.history && currentUrl) currentWindow.history.push(currentUrl);
        const previousUrl = currentWindow.forward.pop() || "";

        inputField.value = previousUrl;
        updateIframe();

        dispatch({ type: "SET_CURRENT_WINDOWS", payload: updatedCurrentWindows });
    };

    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const iframe = iframeRef.current;

    const updateIframe = () => {
        const value = (!inputField?.value.startsWith("http")) ? `https://${inputField?.value}` : inputField?.value;
        const wayBackUrl = "https://web.archive.org/web/20030612074004if_/";
        const url = (!value.includes(getBaseDomain())) ? `/proxy.php?url=${wayBackUrl}${value}` : value;

        if (iframe) {
            if (sameBaseDomain(value)) {
                iframe.setAttribute("sandbox", "allow-same-origin allow-forms");
                iframe.setAttribute("referrerPolicy", "no-referrer");
            } else {
                iframe.removeAttribute("sandbox");
                iframe.removeAttribute("referrerPolicy");
            }
        }

        if (inputField && iframe) iframe.setAttribute("src", url);
    };

    const goClickHandler = () => {
        const { currentWindow, updatedCurrentWindows } = getCurrentWindow(currentWindows);
        if (currentWindow && currentWindow.history && currentUrl) {
            currentWindow.history.push(currentUrl);
        }
        dispatch({ type: "SET_CURRENT_WINDOWS", payload: updatedCurrentWindows });
        updateIframe();
    };

    const stopClickHandler = () => {
        if (iframe) iframe.setAttribute("src", "about:blank");
    };

    const refreshClickHandler = () => {
        updateIframe();
    };

    const homeClickHandler = () => {
        if (inputField) inputField.value = HOMEPAGE;
        if (iframe) iframe.setAttribute("src", HOMEPAGE);
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
                            <button className="flex items-center m-0.5" onClick={stopClickHandler}>
                                <img src="/icon__stop--large.png" width="20" height="20" />
                                <h4 className="hidden">Stop</h4>
                            </button>
                            <button className="flex items-center m-0.5" onClick={refreshClickHandler}>
                                <img src="/icon__refresh--large.png" width="20" height="20" />
                                <h4 className="hidden">Refresh</h4>
                            </button>
                            <button className="flex items-center m-0.5" onClick={homeClickHandler}>
                                <img src="/icon__home--large.png" width="20" height="20" />
                                <h4 className="hidden">Home</h4>
                            </button>
                        </div>
                        <div className="flex shrink-0">
                            <button className="flex items-center m-0.5 cursor-not-allowed">
                                <img className="mr-2" src="/icon__search--large.png" width="20" height="20" />
                                <h4>Search</h4>
                            </button>
                            <button className="flex items-center m-0.5 cursor-not-allowed">
                                <img className="mr-2" src="/icon__favourites--large.png" width="20" height="20" />
                                <h4>Favourites</h4>
                            </button>
                            <button className="flex items-center m-0.5 cursor-not-allowed">
                                <img className="mr-2" src="/icon__history--large.png" width="20" height="20" />
                                <h4 className="hidden">History</h4>
                            </button>
                        </div>
                        <div className="flex shrink-0">
                            <button className="flex items-center m-0.5 cursor-not-allowed">
                                <img className="mr-2" src="/icon__mail--large.png" width="20" height="20" />
                                <h4 className="hidden">Mail</h4>
                            </button>
                            <button className="flex items-center m-0.5 cursor-not-allowed">
                                <img className="mr-2" src="/icon__print--large.png" width="20" height="20" />
                                <h4 className="hidden">Print</h4>
                            </button>
                        </div>
                    </div>
                </section>
                <section className={`${styles.navMenu} relative`}>
                    <div className="w-full h-full flex items-center absolute px-3">
                        <span className={`${styles.navLabel} mr-1`}>Address</span>

                        <div className={`${styles.navBar} flex mx-1 h-full`}>
                            <img src={appData.icon || appData.iconLarge} className="mx-1" width="14" height="14" />
                            <input ref={inputFieldRef} className={`${styles.navBar} h-full`} type="text" defaultValue={HOMEPAGE} onKeyDown={keyDownHandler} />
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
                <iframe ref={iframeRef} src={HOMEPAGE} width="100%" height="100%" />
            </main >
            <div className={`${styles.statusBar} flex justify-between px-2 py-0.5`}>
                <div className="flex items-center gap-1">
                    <img src="icon__internet_explorer.png" height="12" width="12" />
                    <p>Done</p>
                </div>
                <div className="flex">
                    <div className="flex items-center">
                        {Array.from({ length: 6 }).map(() => (
                            <div className={styles.verticaLine}></div>
                        ))}
                    </div>
                    <div className="flex items-center gap-1 ml-3 w-44">
                        <img src="icon__globe.png" height="12" width="12" />
                        <p>Internet</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default InternetExplorer;