import { useRef, useState } from "react";
import { useContext } from "../../../context/context";
import Button from "../../Button/Button";
import styles from "./Setting.module.scss";

const Setting = () => {
    const { currentWindows, isCRTEnabled, wallpaper, dispatch } = useContext();

    const tabMenuRef = useRef<HTMLElement | null>(null);
    const zoomRangeRef = useRef<HTMLInputElement | null>(null);
    
    const [selectedWallpaper, setSelectedWallpaper] = useState(wallpaper);
    const [enableCRT, setEnableCRT] = useState(true);
    const [selectedTab, setSelectedTab] = useState<string | undefined>("desktop");
    const [zoomValue, setZoomValue] = useState(10);

    if (!tabMenuRef) return;
    
    const tabClickHandler = (event: React.MouseEvent) => {
        if (!(event.target as HTMLElement).dataset.tabName || !tabMenuRef.current) return;
        
        const tabs = tabMenuRef.current.querySelectorAll("[data-tab-name]") as NodeListOf<HTMLElement>;
        const selectedTabName = (event.target as HTMLElement).dataset.tabName;
        setSelectedTab(selectedTabName);

        const content = tabMenuRef.current.querySelectorAll("[data-content-tab]");
        const selectedContent = tabMenuRef.current.querySelector(`[data-content-tab="${selectedTabName}"]`);
        if (!selectedTab || !content) return;

        tabs.forEach((item) => {
            item.dataset.active = "false";
        });
        (event.target as HTMLElement).dataset.active = "true";

        content.forEach((item) => {
            item.classList.add("hidden");
        });
        selectedContent?.classList.remove("hidden");
    };

    const onWallpaperSelect = (wallpaperName: string) => {
        setSelectedWallpaper(wallpaperName);
    };

    const onSubmit = () => {
        onApply();
        dispatch({type: "SET_CURRENT_WINDOWS", payload: currentWindows.filter((item) => !item.active)});
    };

    const onApply = () => {
        if (selectedTab === "desktop") {
            dispatch({ type: "SET_WALLPAPER", payload: selectedWallpaper});
            sessionStorage.setItem("wallpaper", selectedWallpaper);
        }

        if (selectedTab === "settings") {
            document.documentElement.style.fontSize = (zoomValue).toString() + "px";
            dispatch({ type: "SET_IS_CRT_ENABLED", payload: enableCRT });
        }
    };

    const onZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const zoomValue = parseInt(event.target.value);
        if (!zoomValue) return;

        setZoomValue(zoomValue);
    };

    const wallpapersMap = [
        ["bliss", "Bliss"],
        ["autumn", "Autumn"],
        ["red_moon_desert", "Red Moon Desert"],
        ["friend", "Friend"],
        ["follow", "Follow"],
    ];

    return (
        <div className={`${styles.settings} flex flex-col justify-between gap-3 h-full p-3`}>
            <main className="h-full mt-6" ref={tabMenuRef}>
                <nav>
                    <ul className="flex">
                        {/* <li onClick={tabClickHandler} className="px-2 cursor-pointer" data-tab-name="themes">Themes</li> */}
                        <li onClick={tabClickHandler} className="px-2 cursor-pointer" data-tab-name="desktop" data-active="true">Desktop</li>
                        {/* <li onClick={tabClickHandler} className="px-2 cursor-pointer" data-tab-name="screensaver">Screensaver</li>
                        <li onClick={tabClickHandler} className="px-2 cursor-pointer" data-tab-name="appearance">Appearance</li> */}
                        <li onClick={tabClickHandler} className="px-2 cursor-pointer" data-tab-name="settings">Settings</li>
                    </ul>
                </nav>
                <div className="p-3 h-full">
                    <section className="hidden" data-content-tab="themes">Themes</section>
                    <section className="h-full" data-content-tab="desktop">
                        <div className="flex flex-col justify-between h-full">
                            <div className={`${styles.wallpaperPreview} flex h-full`}>
                                <img className="m-auto" src={`/wallpaper__${selectedWallpaper}.jpg`} width="110" />
                            </div>
                            <div>
                                <p>Background:</p>
                                <div className="flex justify-between gap-3 mb-3">
                                    <ul className={`${styles.wallpaperList} w-4/5 p-1`}>
                                        {wallpapersMap.map(([id, name], key) => (<li key={key} className="cursor-pointer flex my-0.5" data-selected={id === selectedWallpaper} onClick={() => onWallpaperSelect(id)}><img src="/icon__jpg_file.png" width="11" className="mr-1"/><span>{name}</span></li>))}
                                    </ul>
                                    <div className="flex flex-col gap-3 w-1/5">
                                        <Button disabled>Browse</Button>
                                        <div>
                                            <p>Position:</p>
                                            <div className={`${styles.inputField} flex h-full`} data-disabled>
                                                <input type="text" className={`${styles.selectInput} w-full pl-1`} disabled defaultValue="stretch"/>
                                                <span className={styles.dropDown}></span>
                                            </div>
                                        </div>
                                        <div>
                                            <p>Color:</p>
                                            <div className={`${styles.inputField} flex h-full pr-5.5`} data-disabled>
                                                <input type="color" className={`${styles.selectInput} h-auto m-0.5`} disabled />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Button disabled>Customize Desktop</Button>
                            </div>
                        </div>
                    </section>
                    <section className="hidden" data-content-tab="screensaver">Screensaver</section>
                    <section className="hidden" data-content-tab="appearance">Appearance</section>
                    <section className="hidden h-full" data-content-tab="settings">
                        <div className="flex flex-col justify-between h-full">
                            <div className={`${styles.wallpaperPreview} flex h-full`}>
                                <img className="m-auto" src={`/spritesheet__zoom_range.png`} width="110" style={{objectPosition: (zoomValue === 11) ? "0%" : (zoomValue === 9) ? "100%" : "50%"}} />
                            </div>
                            <div>
                                <div className="mt-4.5">
                                    <p>Display:</p>
                                    <p>(Default Monitor) on</p>
                                </div>
                                <div className="flex gap-4 my-4">
                                    <div className={`${styles.inputGroup} border-gray-300 border rounded-md p-3 relative flex-1 flex flex-col items-center`}>
                                        <label htmlFor="zoom-range" className="absolute px-1 top-0 left-2">Screen Resolution</label>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span>Less</span>
                                            <div className={styles.rangeContainer}>
                                                <input name="zoom-range" id="zoom-range" ref={zoomRangeRef} className="w-full max-w-28 mb-1.5" type="range" min="9" defaultValue={zoomValue} max="11" onChange={onZoomChange} style={{direction: "rtl"}}/>
                                                <div className={`${styles.rangeNotches} w-full max-w-28`}>
                                                    <span></span>
                                                    <span></span>
                                                    <span></span>
                                                </div>
                                            </div>
                                            <span>More</span>
                                        </div>
                                        
                                        <span className="mt-2">{zoomValue === 9 ? "1280 by 1024 pixels" : zoomValue === 11 ? "800 by 600 pixels" : "1024 by 768 pixels"}</span>
                                    </div>
                                    <div className={`${styles.inputGroup} border-gray-300 border rounded-md p-3 relative flex-1`}>
                                        <label htmlFor="image-quality" className="absolute px-1 top-0 left-2">Image Quality</label>
                                        <div className={`${styles.selectField} mt-2`}>
                                            <select className="w-full pl-2 pt-1" onChange={(e) => setEnableCRT(!!Number(e.currentTarget.value))}>
                                                <option value="1">CRT Scanlines</option>
                                                <option value="0">No Scanlines</option>
                                            </select>
                                            <span className={styles.dropDown}></span>
                                        </div>
                                        <div className="w-full relative mt-4">
                                            <img className={`${styles.imageQualityPreview} object-cover h-[1.33rem] absolute m-0 w-full`} src={`/spritesheet__image_quality.png`} width="110" style={{objectPosition: (enableCRT) ? "0%" : "100%"}} />
                                        </div>
                                    </div>
                                </div>
    
                                <div className="flex justify-end gap-2">
                                    <Button disabled>Troubleshoot</Button>
                                    <Button disabled>Advanced</Button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            <footer className="flex justify-end gap-2">
                <Button onClick={onSubmit}>Ok</Button>
                <Button>Cancel</Button>
                <Button onClick={onApply}>Apply</Button>
            </footer>
        </div>
    );
};

export default Setting;