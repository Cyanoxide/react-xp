// import styles from "./FileExplorer.module.scss";
import WindowMenu from "../../WindowMenu/WindowMenu";

const FileExplorer = () => {
    // const onClickHandler = () => {

    // }

    return (
        <WindowMenu menuItems={["File", "Edit", "View", "Favorites", "Tools", "Help"]} hasWindowsLogo={true} />
    );
};

export default FileExplorer;