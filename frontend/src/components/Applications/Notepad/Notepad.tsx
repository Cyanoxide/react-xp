import WindowMenu from "../../WindowMenu/WindowMenu";
import XPScrollbars from "../../XPScrollbars/XPScrollbars";
import styles from "./Notepad.module.scss";

interface NotepadProps {
    title: string;
    content: string;
}

const Notepad = ({ content }: NotepadProps) => {
    return (
        <div className={`${styles.notepad} flex flex-col h-full`}>
            <WindowMenu menuItems={["File", "Edit", "Format", "View", "Help"]}/>
            <XPScrollbars className="flex-1 min-h-0" bindToChild>
                <textarea className="py-1 px-2" defaultValue={content}></textarea>
            </XPScrollbars>
        </div>
    );
};

export default Notepad;