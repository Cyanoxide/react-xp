import styles from "./FileExplorer.module.scss";
import WindowMenu from "../../WindowMenu/WindowMenu";

const FileExplorer = () => {

    return (
        <>
            <WindowMenu menuItems={["File", "Edit", "View", "Favorites", "Tools", "Help"]} hasWindowsLogo={true} />
            <section className={`${styles.appMenu} flex`}>
                <div className="flex shrink-0">
                    <button className="flex items-center m-0.5">
                        <img className="mr-2" src="/icon__back.png" width="20" height="20"/>
                        <h4>Back</h4>
                        <span className="h-full"><span className={styles.dropdown}>▼</span></span>
                    </button>
                    <button className="flex items-center m-0.5">
                        <img src="/icon__forward.png" width="20" height="20"/>
                        <h4 className="hidden">Forward</h4>
                        <span className="h-full"><span className={styles.dropdown}>▼</span></span>
                    </button>
                    <button className="flex items-center m-0.5">
                        <img src="/icon__up.png" width="20" height="20"/>
                        <h4 className="hidden">Up</h4>
                    </button>
                </div>
                <div className="flex shrink-0">
                    <button className="flex items-center m-0.5">
                        <img className="mr-2" src="/icon__search--large.png" width="20" height="20"/>
                        <h4>Search</h4>
                    </button>
                    <button className="flex items-center m-0.5">
                        <img className="mr-2" src="/icon__folders.png" width="20" height="20"/>
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
            </section>
            <section>
                <div>
                    <span>Address</span>
                    <input type="text" />
                    <div>
                        <img />
                        <span>Go</span>
                    </div>
                </div>
            </section>
        </>
    );
};

export default FileExplorer;