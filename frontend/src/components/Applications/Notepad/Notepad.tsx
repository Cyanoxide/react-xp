import WindowMenu from "../../WindowMenu/WindowMenu";
import styles from "./Notepad.module.scss";

interface NotepadProps {
    title: string;
    content: string;
}

const Notepad = ({ content }: NotepadProps) => {
    return (
        <div className={`${styles.notepad} flex flex-col h-full`}>
            <WindowMenu menuItems={["File", "Edit", "Format", "View", "Help"]}/>
            <textarea className="py-1 px-2" defaultValue={content}></textarea>
        </div>
    );
};

export default Notepad;