import WindowMenu from "../../WindowMenu/WindowMenu";
import styles from "./Solitaire.module.scss";

const Solitaire = () => {

    return (
        <>
            <WindowMenu menuItems={["Game", "Help"]}/>
            <div className={`${styles.solitaire} w-full h-full`}></div>
        </>
    );
};

export default Solitaire;
