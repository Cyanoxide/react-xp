import { useContext } from "../../context/context";
import { generateUniqueId } from "../../utils/general";
import type { currentWindow } from "../../context/types";
import type { ReactNode } from "react";

interface StartMenuItemProps {
    title: string;
    subTitle?: string | null;
    icon: string;
    iconSize?: number;
    content: ReactNode;
    subMenu?: string | null;
    onMenuItemHandler?: () => void;
}

const StartMenuItem: React.FC<StartMenuItemProps> = ({ ...props }) => {
    const { title, subTitle = null, icon, content, subMenu = null } = props;
    const { iconSize = (subTitle) ? 30 : 22 } = props;
    const { currentWindows, dispatch } = useContext();

    const onClickHandler = () => {
        if (subMenu) return;

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
        dispatch({ type: "SET_IS_START_VISIBLE", payload: false });
    }

    const onMouseOver = () => {
        dispatch({ type: "SET_IS_ALL_PROGRAMS_OPEN", payload: false });
        dispatch({ type: "SET_IS_RECENT_DOCUMENTS_OPEN", payload: false });
    }

    return (
        <button className="flex items-center p-1" onClick={onClickHandler} onMouseOver={onMouseOver}>
            {subTitle && <>
                <img src={icon} className="mr-2" width={iconSize} height={iconSize} />
                <span>
                    <h5 className="font-bold">{subTitle}</h5>
                    <p>{title}</p>
                </span>
            </>}
            {!subTitle && <>
                <img src={icon} className="mr-2" width={iconSize} height={iconSize} />
                <h5>{title}</h5>
            </>}
        </button>
    );
};

export default StartMenuItem;

