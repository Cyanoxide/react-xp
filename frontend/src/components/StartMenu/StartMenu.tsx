import styles from "./StartMenu.module.scss";
import { useContext } from "../../context/context";
import { useEffect, useRef } from "react";
import StartMenuItem from "../StartMenuItem/StartMenuItem";
import StartMenuSubMenu from "../StartMenuSubMenu/StartMenuSubMenu";
import subMenus from "../../data/subMenus.json"

interface StartMenuProps {
    startButton: React.RefObject<HTMLButtonElement | null>
}

const StartMenu: React.FC<StartMenuProps> = ({ startButton }) => {
    const { isStartVisible, isAllProgramsOpen, dispatch } = useContext();
    const startMenu = useRef<HTMLDivElement | null>(null);
    const allPrograms = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            const target = (event.target as Node);
            const startMenuRef = startMenu.current;
            const startButtonRef = startButton.current;
            if (!startButtonRef || !startMenuRef) return;

            if (!startMenuRef.contains(target) && !startButtonRef.contains(target)) {
                dispatch({ type: "SET_IS_START_VISIBLE", payload: false });
                document.removeEventListener("click", onClick);
            }
        }
        document.addEventListener("click", onClick);
    }, [startButton, isStartVisible, dispatch]);

    const allProgramsClickHandler = () => {
        dispatch({ type: "SET_IS_ALL_PROGRAMS_OPEN", payload: true });



        const onSecondClick = (event: MouseEvent) => {
            const target = (event.target as Node);
            const allProgramsRef = allPrograms.current;

            if (!allProgramsRef?.contains(target)) {
                document.removeEventListener("click", onSecondClick);
                dispatch({ type: "SET_IS_ALL_PROGRAMS_OPEN", payload: false });
            }
        }

        document.addEventListener("click", onSecondClick);
    }

    const onMenuItemHandler = () => {
        return;
    }

    return (
        <div ref={startMenu} className={`${styles.startMenu} bg-[#3e75d8] absolute left-0 bottom-12`}>
            <header className="flex items-center p-3">
                <img src="/avatar__skateboard.png" className="mr-3" width="50" height="50" />
                <h1>User</h1>
            </header>
            <main className="flex">
                <section className="bg-white text-[#373738] flex flex-col justify-between">
                    <div>
                        <ul className="flex flex-col p-3">
                            <li>
                                <StartMenuItem title="Internet Explorer" subTitle="Internet" icon="/icon__internet_explorer--large.png" content={<div></div>} />
                            </li>
                            <li>
                                <StartMenuItem title="Outlook Express" subTitle="E-mail" icon="/icon__outlook--large.png" content={<div></div>} />                            </li>
                        </ul>
                        <ul className="flex flex-col p-3">
                            <li>
                                <StartMenuItem title="Windows Messenger" icon="/icon__messenger--large.png" iconSize={30} content={<div></div>} />
                            </li>
                            <li>
                                <StartMenuItem title="MSN" icon="/icon__msn--large.png" iconSize={30} content={<div></div>} />
                            </li>
                            <li>
                                <StartMenuItem title="Windows Media Player" icon="/icon__media_player--large.png" iconSize={30} content={<div></div>} />
                            </li>
                        </ul>
                    </div>
                    <div>
                        <div ref={allPrograms} className={`${styles.allPrograms} p-2 relative`}>
                            <button className="flex items-center justify-center gap-2 p-1" onMouseOver={allProgramsClickHandler} data-open={isAllProgramsOpen}>
                                <h5 className="font-bold">All Programs</h5>
                                <img src="/icon__green_arrow--large.png" className="mr-3" width="20" height="20" />
                            </button>
                            {isAllProgramsOpen && <StartMenuSubMenu data={subMenus.allPrograms} />}
                        </div>
                    </div>
                </section>
                <section className="bg-[#d6e4f8] text-[#112366]">
                    <ul className="font-bold p-2">
                        <li>
                            <StartMenuItem title="My Documents" icon="/icon__documents--large.png" content={<div></div>} />
                        </li>
                        <li>
                            <StartMenuItem title="My Recent Documents" icon="/icon__recent_documents--large.png" content={<div></div>} onMenuItemHandler={onMenuItemHandler} />
                        </li>
                        <li>
                            <StartMenuItem title="My Pictures" icon="/icon__pictures--large.png" content={<div></div>} />
                        </li>
                        <li>
                            <StartMenuItem title="My Music" icon="/icon__music--large.png" content={<div></div>} />
                        </li>
                        <li>
                            <StartMenuItem title="My Computer" icon="/icon__computer--large.png" content={<div></div>} />
                        </li>
                    </ul>
                    <ul className="p-2">
                        <li>
                            <StartMenuItem title="Control Panel" icon="/icon__control_panel--large.png" content={<div></div>} />
                        </li>
                        <li>
                            <StartMenuItem title="Set Program Access and Defaults" icon="/icon__default_programs--large.png" content={<div></div>} />
                        </li>
                        <li>
                            <StartMenuItem title="Printers and Faxes" icon="/icon__printers_faxes--large.png" content={<div></div>} />
                        </li>
                    </ul>
                    <ul className="p-2">
                        <li>
                            <StartMenuItem title="Help and Support" icon="/icon__recent_documents--large.png" content={<div></div>} />
                        </li>
                        <li>
                            <StartMenuItem title="Search" icon="/icon__search--large.png" content={<div></div>} />
                        </li>
                        <li>
                            <StartMenuItem title="Run..." icon="/icon__run--large.png" content={<div></div>} />
                        </li>
                    </ul>
                </section>
            </main>
            <footer>
                <ul className="flex justify-end gap-2 p-2">
                    <li>
                        <button className="flex items-center p-2">
                            <img src="/icon__log_out--large.png" className="mr-2" width="22" height="22" />
                            <h6>Log Off</h6>
                        </button>
                    </li>
                    <li>
                        <button className="flex items-center p-2">
                            <img src="/icon__shut_down--large.png" className="mr-2" width="22" height="22" />
                            <h6>Turn Off Computer</h6>
                        </button>
                    </li>
                </ul>
            </footer>
        </div >
    );
};

export default StartMenu;