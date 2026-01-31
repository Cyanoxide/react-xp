import styles from "./WindowMenu.module.scss";

interface WindowMenuProps {
    menuItems?: string[];
    hasWindowsLogo?: boolean;
    isMinified?: boolean;
}

const WindowMenu = ({ menuItems = [], hasWindowsLogo = false, isMinified = false }: WindowMenuProps) => {


    return (
        <div className={`${styles.windowMenu} flex ${hasWindowsLogo ? "justify-between" : "justify-start"}`} data-minified={isMinified}>
            <div className="relative overflow-hidden w-full">
                <ul className="flex mx-1">
                    {menuItems.map((item, index) => <li key={index} className="display-block my-1 px-2.5 py-1"><button>{item}</button></li>)}
                </ul>
            </div>
            {hasWindowsLogo && <img src="icon__windows_logo.png" height="100%" width="40" />}
        </div>
    );
};

export default WindowMenu;