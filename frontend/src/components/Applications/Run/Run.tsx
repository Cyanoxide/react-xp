import { useRef, useState } from "react";
import { useContext } from "../../../context/context";
import styles from "./Run.module.scss";


const Run = () => {
    const { currentWindows, dispatch } = useContext();
    const inputFieldRef = useRef<HTMLInputElement | null>(null);
    const inputField = inputFieldRef.current;

    const [isOkayDisabled, setIsOkayDisabled] = useState(true);

    const onChangeHandler = () => {
        if (!inputField) return;
        setIsOkayDisabled((inputField?.value.length === 0));
    };

    const onCancelClick = () => {
        dispatch({type: "SET_CURRENT_WINDOWS", payload: currentWindows.filter((item) => !item.active)});
    };

    return (
        <div className={`${styles.run} py-5 px-4`}>
            <div className="flex">
                <img className="mr-4" src="/icon__run--large.png" width="30" height="30" />
                <p>Type the name of a program, folder, document, or Internet Resource, and Windows will open it for you.</p>
            </div>
            <div className="flex my-5">
                <span className={`${styles.inputLabel} mr-2`}>Open:</span>
                <div className={`${styles.inputField} flex mx-1 h-full`}>
                    <input ref={inputFieldRef} className={`${styles.input} h-full w-full p-1`} type="text" onChange={onChangeHandler} />
                    <span className={styles.dropDown}></span>
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-8 mb-5">
                <button disabled={isOkayDisabled}>Ok</button>
                <button onClick={onCancelClick}>Cancel</button>
                <button disabled>Browse</button>
            </div>
        </div>
    );
};

export default Run;