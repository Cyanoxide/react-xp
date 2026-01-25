import styles from "./Desktop.module.scss";
import { useRef } from "react";
import DesktopIcon from "../DesktopIcon/DesktopIcon";

const Desktop = () => {
    const desktop = useRef<HTMLDivElement | null>(null);

    return (
        <div ref={desktop} className={styles.desktop}>
            <DesktopIcon title="My Documents" iconLarge="/icon__documents--large.png" icon="/icon__documents.png" content="" width={500} height={350} top={5} left={5} active={true} />
            <DesktopIcon title="Internet Explorer" iconLarge="/icon__internet_explorer--large.png" icon="/icon__internet_explorer.png" content="" width={500} height={350} top={70} left={5} active={true} />
            <DesktopIcon title="Recycle Bin" iconLarge="/icon__recycle_bin--large.png" icon="/icon__recycle_bin.png" content="" width={500} height={350} bottom={5} right={5} active={true} />
        </div>
    );
};

export default Desktop;