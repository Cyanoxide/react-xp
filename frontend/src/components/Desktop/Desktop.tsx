import styles from "./Desktop.module.scss";
import { useRef } from "react";
import DesktopIcon from "../DesktopIcon/DesktopIcon";

const Desktop = () => {
    const desktop = useRef<HTMLDivElement | null>(null);

    return (
        <div ref={desktop} className={styles.desktop}>
            <DesktopIcon title="My Documents" iconLarge="/icon__documents--large.png" icon="/icon__documents.png" content="" width={500} height={350} top={5} left={5} active={true} />
        </div>
    );
};

export default Desktop;