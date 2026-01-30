import styles from "./Desktop.module.scss";
import { useState, useRef } from "react";
import DesktopIcon from "../DesktopIcon/DesktopIcon";

const Desktop = () => {
    const desktop = useRef<HTMLDivElement | null>(null);
    const [selectedId, setSelectedId] = useState<number | string>("");

    return (
        <div ref={desktop} className={styles.desktop}>
            <DesktopIcon id={1} appId="documents" top={5} left={5} selectedId={selectedId} setSelectedId={setSelectedId} />
            <DesktopIcon id={2} appId="internetExplorer" top={70} left={5} selectedId={selectedId} setSelectedId={setSelectedId} />
            <DesktopIcon id={3} appId="recycleBin" bottom={5} right={5} selectedId={selectedId} setSelectedId={setSelectedId} />
        </div>
    );
};

export default Desktop;