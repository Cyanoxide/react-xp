import { useState } from "react";
import filesJSON from "../../data/files.json";
import DesktopIcon from "../DesktopIcon/DesktopIcon";
import styles from "./Desktop.module.scss";
import type { AbsoluteObject } from "../../context/types";

const Files = filesJSON as unknown as Record<string, [string, AbsoluteObject][]>;

const Desktop = () => {
    const [selectedId, setSelectedId] = useState<number | string>("");
    const next = (() => { let count = 0; return () => ++count; })();

    const desktopItems = Files["desktop"];

    return (
        <div className={styles.desktop}>
            {desktopItems.map((item) => { 
                const [ id, {top=undefined, right=undefined, bottom=undefined, left=undefined}] = item;
                console.log(id, top);
                
                return (
                    <DesktopIcon key={next()} id={next()} appId={id} top={top} right={right} bottom={bottom} left={left} selectedId={selectedId} setSelectedId={setSelectedId} />
                );
            })}
        </div>
    );
};

export default Desktop;
