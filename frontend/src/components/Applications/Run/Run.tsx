import styles from "./Run.module.scss";


const Run = () => {
    return (
        <div className={`${styles.run} py-5 px-4`}>
            <div className="flex">
                <img className="mr-4" src="/icon__run--large.png" width="30" height="30" />
                <p>Type the name of a program, folder, document, or Internet Resource, and Windows will open it for you.</p>
            </div>
            <div className="flex my-5">
                <span className={`${styles.inputLabel} mr-2`}>Open:</span>
                <div className={`${styles.inputField} flex mx-1 h-full`}>
                    <input className={`${styles.input} h-full w-full p-1`} type="text" />
                    <span className={styles.dropDown}></span>
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-8 mb-5">
                <button>Ok</button>
                <button>Cancel</button>
                <button disabled>Browse</button>
            </div>
        </div>
    );
};

export default Run;