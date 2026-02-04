import { useState } from "react";
import DesktopIcon from "../DesktopIcon/DesktopIcon";
import styles from "./Desktop.module.scss";

const Desktop = () => {
    const [selectedId, setSelectedId] = useState<number | string>("");
    const next = (() => { let count = 0; return () => ++count; })();


    return (
        <div className={styles.desktop}>
            <DesktopIcon id={next()} appId="documents" top={5} left={5} selectedId={selectedId} setSelectedId={setSelectedId} />
            <DesktopIcon id={next()} appId="internetExplorer" top={70} left={5} selectedId={selectedId} setSelectedId={setSelectedId} />
            <DesktopIcon id={next()} appId="gitHub" top={145} left={5} selectedId={selectedId} setSelectedId={setSelectedId} />
            <DesktopIcon id={next()} appId="kofi" top={210} left={5} selectedId={selectedId} setSelectedId={setSelectedId} />
            <DesktopIcon id={next()} appId="recycleBin" bottom={5} right={5} selectedId={selectedId} setSelectedId={setSelectedId} />
        </div>
    );
};

export default Desktop;
