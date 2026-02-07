import { useEffect, useRef } from "react";
import { useContext } from "../../context/context";
import subMenus from "../../data/subMenus.json";
import StartMenuItem from "../StartMenuItem/StartMenuItem";
import StartMenuSubMenu from "../StartMenuSubMenu/StartMenuSubMenu";
import styles from "./StartMenu.module.scss";

interface StartMenuProps {
    startButton: HTMLElement | null;
}

const StartMenu = ({ startButton }: StartMenuProps) => {
    const { isStartVisible, isAllProgramsOpen, isRecentDocumentsOpen, dispatch } = useContext();
    const startMenuRef = useRef<HTMLDivElement | null>(null);
    const startMenu = startMenuRef.current;
    const allProgramsRef = useRef<HTMLDivElement | null>(null);
    const allPrograms = allProgramsRef.current;

useEffect(() => {
  if (!isStartVisible || !startMenuRef.current || !startButton) return;

  const onClick = (event: MouseEvent) => {
    const target = event.target as Node;
    if (!startMenuRef.current) return;

    if (!startMenuRef.current.contains(target) && !startButton.contains(target)) {
      dispatch({ type: "SET_IS_START_VISIBLE", payload: false });
      dispatch({ type: "SET_IS_RECENT_DOCUMENTS_OPEN", payload: false });
    }
  };

  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}, [isStartVisible, startMenu, startButton, dispatch]);

    const allProgramsClickHandler = () => {
        dispatch({ type: "SET_IS_ALL_PROGRAMS_OPEN", payload: true });

        const onSecondClick = (event: MouseEvent) => {
            const target = (event.target as Node);

            if (!allPrograms?.contains(target)) {
                document.removeEventListener("click", onSecondClick);
                dispatch({ type: "SET_IS_ALL_PROGRAMS_OPEN", payload: false });
            }
        };

        document.addEventListener("click", onSecondClick);
    };

    const onRecentDocumentsHandler = () => {
        dispatch({ type: "SET_IS_RECENT_DOCUMENTS_OPEN", payload: true });
    };

    return (
        <div ref={startMenuRef} className={`${styles.startMenu} bg-[#3e75d8] absolute left-0 bottom-12`}>
            <header className="flex items-center p-3">
                <img src="/avatar__skateboard.png" className="mr-3" width="50" height="50" />
                <h1>User</h1>
            </header>
            <main className="flex">
                <section className="bg-white text-[#373738] flex flex-col justify-between">
                    <div>
                        <ul className="flex flex-col p-3">
                            <li><StartMenuItem appId="internetExplorer" subTitle="Internet" /></li>
                            <li><StartMenuItem appId="outlook" subTitle="E-mail" /></li>
                        </ul>
                        <ul className="flex flex-col p-3">
                            <li><StartMenuItem appId="winMessenger" iconSize={30} /></li>
                            <li><StartMenuItem appId="msn" iconSize={30} /></li>
                            <li><StartMenuItem appId="winMediaPlayer" iconSize={30} /></li>
                            <li><StartMenuItem appId="notepad" iconSize={30} /></li>
                        </ul>
                    </div>
                    <div>
                        <div ref={allProgramsRef} className={`${styles.allPrograms} p-2 relative`}>
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
                        <li><StartMenuItem appId="documents" /></li>
                        <li onMouseOver={onRecentDocumentsHandler} className="relative" data-open={isRecentDocumentsOpen}>
                            <StartMenuItem appId="recentDocuments" subMenu="recentDocuments" />
                            {isRecentDocumentsOpen && <StartMenuSubMenu data={subMenus.recentDocuments} />}
                        </li>
                        <li><StartMenuItem appId="pictures" /></li>
                        <li><StartMenuItem appId="music" /></li>
                        <li><StartMenuItem appId="computer" /></li>
                    </ul>
                    <ul className="p-2">
                        <li><StartMenuItem appId="controlPanel" /></li>
                        <li><StartMenuItem appId="programDefaults" /></li>
                        <li><StartMenuItem appId="printersFaxes" /></li>
                    </ul>
                    <ul className="p-2">
                        <li><StartMenuItem appId="support" /></li>
                        <li><StartMenuItem appId="search" /></li>
                        <li><StartMenuItem appId="run" /></li>
                    </ul>
                </section>
            </main>
            <footer>
                <ul className="flex justify-end gap-2 p-2">
                    <li>
                        <button className="flex items-center p-2 cursor-not-allowed">
                            <img src="/icon__log_out--large.png" className="mr-2" width="22" height="22" />
                            <h6>Log Off</h6>
                        </button>
                    </li>
                    <li>
                        <button className="flex items-center p-2 cursor-not-allowed">
                            <img src="/icon__shut_down--large.png" className="mr-2" width="22" height="22" />
                            <h6>Turn Off Computer</h6>
                        </button>
                    </li>
                </ul>
            </footer>
        </div>
    );
};

export default StartMenu;