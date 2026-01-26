import styles from "./StartMenu.module.scss";

const StartMenu = () => {
    const onClickHandler = () => {

    }

    return (
        <div className={`${styles.startMenu} bg-[#3e75d8] absolute left-0 bottom-12 overflow-hidden`}>
            <header className="flex items-center p-3">
                <img src="/avatar__skateboard.png" className="mr-3" width="50" height="50" />
                <h1>User</h1>
            </header>
            <main className="flex">
                <section className="bg-white text-[#373738] flex flex-col justify-between w-1/2">
                    <div>
                        <ul className="flex flex-col p-3">
                            <li className="flex items-center p-2">
                                <img src="/icon__internet_explorer--large.png" className="mr-3" width="30" height="30" />
                                <span>
                                    <h5 className="font-bold">Internet</h5>
                                    <p>Internet Explorer</p>
                                </span>
                            </li>
                            <li className="flex items-center p-2">
                                <img src="/icon__outlook--large.png" className="mr-3" width="30" height="30" />
                                <span>
                                    <h5 className="font-bold">E-mail</h5>
                                    <p>Outlook Express</p>
                                </span>
                            </li>
                        </ul>
                        <ul className="flex flex-col p-3">
                            <li className="flex p-1 items-center">
                                <img src="/icon__messenger--large.png" className="mr-3" width="30" height="30" />
                                <h5>Windows Messenger</h5>
                            </li>
                            <li className="flex p-1 items-center">
                                <img src="/icon__msn--large.png" className="mr-3" width="30" height="30" />
                                <h5>MSN</h5>
                            </li>
                            <li className="flex p-1 items-center">
                                <img src="/icon__media_player--large.png" className="mr-3" width="30" height="30" />
                                <h5>Windows Media Player</h5>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <div className="flex items-center justify-center gap-2 p-3">
                            <h5 className="font-bold">All Programs</h5>
                            <img src="/icon__green_arrow--large.png" className="mr-3" width="20" height="20" />
                        </div>
                    </div>
                </section>
                <section className="bg-[#d6e4f8] text-[#112366] w-1/2">
                    <ul className="font-bold p-2">
                        <li className="flex p-1 items-center">
                            <img src="/icon__documents--large.png" className="mr-2" width="22" height="22" />
                            <h5>My Documents</h5>
                        </li>
                        <li className="flex p-1 items-center">
                            <img src="/icon__recent_documents--large.png" className="mr-2" width="22" height="22" />
                            <h5>My Recent Documents</h5>
                        </li>
                        <li className="flex p-1 items-center">
                            <img src="/icon__pictures--large.png" className="mr-2" width="22" height="22" />
                            <h5>My Pictures</h5>
                        </li>
                        <li className="flex p-1 items-center">
                            <img src="/icon__music--large.png" className="mr-2" width="22" height="22" />
                            <h5>My Music</h5>
                        </li>
                        <li className="flex p-1 items-center">
                            <img src="/icon__computer--large.png" className="mr-2" width="22" height="22" />
                            <h5>My Computer</h5>
                        </li>
                    </ul>
                    <ul className="p-2">
                        <li className="flex p-1 items-center">
                            <img src="/icon__control_panel--large.png" className="mr-2" width="22" height="22" />
                            <h5>Control Panel</h5>
                        </li>
                        <li className="flex p-1 items-center">
                            <img src="/icon__default_programs--large.png" className="mr-2" width="22" height="22" />
                            <h5>Set Program Access and Defaults</h5>
                        </li>
                        <li className="flex p-1 items-center">
                            <img src="/icon__printers_faxes--large.png" className="mr-2" width="22" height="22" />
                            <h5>Printers and Faxes</h5>
                        </li>
                    </ul>
                    <ul className="p-2">
                        <li className="flex p-1 items-center">
                            <img src="/icon__help--large.png" className="mr-2" width="22" height="22" />
                            <h5>Help and Support</h5>
                        </li>
                        <li className="flex p-1 items-center">
                            <img src="/icon__search--large.png" className="mr-2" width="22" height="22" />
                            <h5>Search</h5>
                        </li>
                        <li className="flex p-1 items-center">
                            <img src="/icon__run--large.png" className="mr-2" width="22" height="22" />
                            <h5>Run...</h5>
                        </li>
                    </ul>
                </section>
            </main>
            <footer>
                <ul className="flex justify-end gap-2 p-2">
                    <li className="flex items-center p-2">
                        <img src="/icon__log_out--large.png" className="mr-2" width="22" height="22" />
                        <h6>Log Off</h6>
                    </li>
                    <li className="flex items-center p-2">
                        <img src="/icon__shut_down--large.png" className="mr-2" width="22" height="22" />
                        <h6>Turn Off Computer</h6>
                    </li>
                </ul>
            </footer>
        </div>
    );
};

export default StartMenu;