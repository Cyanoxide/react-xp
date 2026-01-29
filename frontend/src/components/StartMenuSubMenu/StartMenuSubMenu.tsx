import styles from "./StartMenuSubMenu.module.scss";
import type { ReactNode } from "react";
import subMenusJSON from "../../data/subMenus.json";
import { useContext } from "../../context/context"
import type { currentWindow } from "../../context/types";
import { generateUniqueId } from "../../utils/general";

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
    id?: string | null;
    title: string;
    icon: string;
    content?: ReactNode | string;
    subMenu?: string;
}

const subMenus = (subMenusJSON as unknown as { [key: string]: SubMenuData });

const template = (item: SubMenuItem, onClickHandler: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, item: SubMenuItem) => void) => {
    const { id = null, title, icon, subMenu = "" } = { ...item };
    return (
        <div key={id} className={`${styles.subMenuItem} relative font-normal`} data-has-sub-Menu={!!subMenu}>
            <button className="flex items-center p-1.5 relative" onClick={(e) => onClickHandler(e, item)}>
                <img src={icon} className="mr-1.5" width="16" height="16" />
                <span>{title}</span>
            </button>
            {subMenu && <StartMenuSubMenu data={subMenus[subMenu]} />}
        </div>
    )
}
const emptySubMenu = <div className={`${styles.emptySubMenu} flex items-center`}>(Empty)</div>

const StartMenuSubMenu: React.FC<StartMenuSubMenuProps> = ({ data }) => {
    const { id, featured, contents } = { ...data };
    const { currentWindows, dispatch } = useContext();

    const onClickHandler = (_: unknown, item: SubMenuItem) => {
        const { title, icon, content, subMenu } = { ...item };
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