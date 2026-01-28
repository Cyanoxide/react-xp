import styles from "./StartMenuSubMenu.module.scss";
import type { ReactNode } from "react";
import subMenusJSON from "../../data/subMenus.json";

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

const template = (item: SubMenuItem) => {
    const { id = null, title, icon, subMenu = "" } = { ...item };
    return (
        <div key={id} className={`${styles.subMenuItem} relative font-normal`} data-has-sub-Menu={!!subMenu}>
            <button className="flex items-center p-1.5 relative">
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

    const isEmpty = !featured && (!contents || contents?.length === 0);

    return (
        <div className={`${styles.StartMenuSubMenu} items-center font-normal`} data-sub-menu={id}>
            {featured && <div className={styles.featured}>
                {featured.map((item) => template(item))}
            </div>}
            {featured && contents && <hr />}
            {contents && <div className={styles.contents}>
                {contents && contents.map((item) => template(item))}
            </div>}
            {isEmpty && emptySubMenu}
        </div>
    );
};

export default StartMenuSubMenu;