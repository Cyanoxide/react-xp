import styles from "./Desktop.module.scss";
import { useState, useRef } from "react";
import DesktopIcon from "../DesktopIcon/DesktopIcon";

const Desktop = () => {
    const desktop = useRef<HTMLDivElement | null>(null);
    const [selectedId, setSelectedId] = useState<number | string>("");

    return (
        <div ref={desktop} className={styles.desktop}>
            <DesktopIcon id={1} title="My Documents" iconLarge="/icon__documents--large.png" icon="/icon__documents.png" content="" width={500} height={350} top={5} left={5} selectedId={selectedId} setSelectedId={setSelectedId}/>
            <DesktopIcon id={2} title="Internet Explorer" iconLarge="/icon__internet_explorer--large.png" icon="/icon__internet_explorer.png" content="" width={500} height={350} top={70} left={5} selectedId={selectedId} setSelectedId={setSelectedId}/>
            <DesktopIcon id={3} title="Recycle Bin" iconLarge="/icon__recycle_bin--large.png" icon="/icon__recycle_bin.png" content="" width={500} height={350} bottom={5} right={5} selectedId={selectedId} setSelectedId={setSelectedId}/>
        </div>
    );
};

export default Desktop;