import { useContext } from "../../context/context";
import { openApplication } from "../../utils/general";
import type { Application } from "../../context/types";
import applicationsJSON from "../../data/applications.json";

const applications = applicationsJSON as unknown as Record<string, Application>;

interface StartMenuItemProps {
    appId: string;
    subTitle?: string | null;
    iconSize?: number;
    subMenu?: string | null;
    disabled?: boolean;
    onMenuItemHandler?: () => void;
}

const StartMenuItem = ({ ...props }: StartMenuItemProps) => {
    const { subTitle = null, appId, subMenu = null } = props;
    const { iconSize = (subTitle) ? 30 : 22 } = props;
    const { currentWindows, dispatch } = useContext();
    const appData = applications[appId];
    const { title, icon, iconLarge, disabled } = { ...appData };

    const onClickHandler = () => {
        if (subMenu || disabled) return;

        openApplication(appId, currentWindows, dispatch);
        dispatch({ type: "SET_IS_START_VISIBLE", payload: false });
    }

    const onMouseOver = () => {
        dispatch({ type: "SET_IS_ALL_PROGRAMS_OPEN", payload: false });
        dispatch({ type: "SET_IS_RECENT_DOCUMENTS_OPEN", payload: false });
    }

    return (
        <button className={`flex items-center p-1 ${(disabled) ? "cursor-not-allowed" : ""} ${(subMenu) ? "cursor-default" : ""}`} onClick={onClickHandler} onMouseOver={onMouseOver}>
            {subTitle && <>
                <img src={iconLarge || icon} className="mr-2" width={iconSize} height={iconSize} />
                <span>
                    <h5 className="font-bold">{subTitle}</h5>
                    <p>{title}</p>
                </span>
            </>}
            {!subTitle && <>
                <img src={iconLarge || icon} className="mr-2" width={iconSize} height={iconSize} />
                <h5>{title}</h5>
            </>}
        </button>
    );
};

export default StartMenuItem;

