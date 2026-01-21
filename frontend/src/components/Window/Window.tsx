import styles from "./Window.module.scss";

const Window = () => {

    return (
        <>
            <div className={`${styles.window} relative`} data-label="window">
                <div className={`${styles.windowHeader} flex justify-between`}>
                    <div className="flex items-center">
                        <img src="/icon__documents.png" width="14" height="14" className="mx-2 min-w-[14px]"></img>
                        <h3>My Documents</h3>
                    </div>
                    <div className="flex">
                        <button data-button="minimize">Minimise</button>
                        <button data-button="maximize">Maximise</button>
                        <button data-button="close">Close</button>
                    </div>
                </div>
                <div className={`${styles.windowContent}`} style={{ height: 200 + "px", width: 500 + "px", background: "#fff" }}></div>
            </div>
        </>
    )
};

export default Window;