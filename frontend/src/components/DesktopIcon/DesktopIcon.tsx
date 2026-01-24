import styles from "./DesktopIcon.module.scss";
import type { currentWindow } from "../../context/types";
import { useContext } from "../../context/context";
import { generateUniqueId } from "../../utils/general";

type DesktopIconProps = Omit<currentWindow, "id"> & {
    iconLarge?: string;
};

const DesktopIcon: React.FC<DesktopIconProps> = ({ title, iconLarge, icon, content }) => {
    const { currentWindows, dispatch } = useContext();

    const onDoubleClickHandler = () => {
        const newWindow: currentWindow = {
            id: generateUniqueId(),
            active: true,
            title,
            icon,
            content,
        }

        const updatedCurrentWindows = [...currentWindows];
        updatedCurrentWindows.push(newWindow);
        dispatch({ type: "SET_CURRENT_WINDOWS", payload: updatedCurrentWindows });
    }

    return (
        <div className={styles.desktopIcon} onDoubleClick={onDoubleClickHandler}>
            <img src={iconLarge || icon} width="50" height="50" />
            <h4>{title}</h4>
        </div>
    );
};

export default DesktopIcon;