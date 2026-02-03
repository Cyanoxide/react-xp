import styles from "./StartMenuSubMenu.module.scss";
import subMenusJSON from "../../data/subMenus.json";
import applicationsJSON from "../../data/applications.json"
import { useContext } from "../../context/context"
import type { Application } from "../../context/types";
import { openApplication } from "../../utils/general";

interface StartMenuSubMenuProps {
    data?: SubMenuData;
    parentRef?: React.RefObject<HTMLDivElement | null>;
}

interface SubMenuData {
    id?: string | null;
    featured?: SubMenuItem[];
    contents?: SubMenuItem[];
}

interface SubMenuItem {
    appId: string;
    subMenu?: string;
    disabled?: boolean;
}

const subMenus = (subMenusJSON as unknown as { [key: string]: SubMenuData });
const applications = applicationsJSON as unknown as Record<string, Application>;

const template = (item: SubMenuItem, onClickHandler: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, item: SubMenuItem) => void) => {
    const { appId, subMenu = "" } = { ...item };
    const { title, icon, iconLarge, disabled } = { ...applications[appId] };

    return (
        <div key={appId} className={`${styles.subMenuItem} relative font-normal`} data-has-sub-menu={!!subMenu}>
            <button className={`flex items-center p-1.5 relative ${(disabled) ? "cursor-not-allowed" : ""} ${(subMenu) ? "cursor-default" : ""}`} onClick={(e) => onClickHandler(e, item)} >
                <img src={icon || iconLarge} className="mr-1.5" width="16" height="16" />
                <span>{title}</span>
            </button>
            {subMenu && <StartMenuSubMenu data={subMenus[subMenu]} />}
        </div>
    )
}
const emptySubMenu = <div className={`${styles.emptySubMenu} flex items-center`}>(Empty)</div>

const StartMenuSubMenu = ({ data }: StartMenuSubMenuProps) => {
    const { id, featured, contents } = { ...data };
    const { currentWindows, dispatch } = useContext();

    const onClickHandler = (_: unknown, item: SubMenuItem) => {
        const { subMenu, appId } = { ...item };
        if (subMenu || applications[appId].disabled) return;
        openApplication(appId, currentWindows, dispatch);
        dispatch({ type: "SET_IS_START_VISIBLE", payload: false });
    }

    const hasFeatured = featured && featured.length > 0;
    const hasContents = contents && contents?.length > 0;
    const isEmpty = !featured && (!contents || contents?.length === 0);

    return (
        <div className={`${styles.StartMenuSubMenu} items-center font-normal`} data-sub-menu={id}>
            {hasFeatured && <div className={styles.featured}>
                {featured.map((item) => template(item, onClickHandler))}
            </div>}
            {hasFeatured && hasContents && <hr />}
            {hasContents && <div className={styles.contents}>
                {contents && contents.map((item) => template(item, onClickHandler))}
            </div>}
            {isEmpty && emptySubMenu}
        </div>
    );
};

export default StartMenuSubMenu;