import { useRef, useState } from "react";
import { useContext } from "../../../context/context";
import applicationsJSON from "../../../data/applications.json";
import { openApplication } from "../../../utils/general";
import styles from "./Run.module.scss";
import type { Application } from "../../../context/types";

const Applications = applicationsJSON as unknown as Record<string, Application>;

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

    const onSubmitHandler = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const inputField = form.elements.namedItem("command") as HTMLInputElement;

        if (inputField.value.startsWith("http")) return;
        // Todo: Add Url handling

        if (inputField.value in Applications) {
            openApplication(inputField.value, currentWindows, dispatch);
            return;
        }

        const appId = Object.entries(Applications).find(([, item]) => item.title.toLowerCase() === inputField.value.toLowerCase())?.[0];
        if (appId && !Applications[appId].disabled && !Applications[appId].link) openApplication(appId, currentWindows, dispatch);
    };

    return (
        <form className={`${styles.run} py-5 px-4`} onSubmit={onSubmitHandler}>
            <div className="flex">
                <img className="mr-4" src="/icon__run--large.png" width="30" height="30" />
                <p>Type the name of a program, folder, document, or Internet Resource, and Windows will open it for you.</p>
            </div>
            <div className="flex my-5">
                <span className={`${styles.inputLabel} mr-2`}>Open:</span>
                <div className={`${styles.inputField} flex mx-1 h-full`}>
                    <input name="command" ref={inputFieldRef} className={`${styles.input} h-full w-full p-1`} type="text" onChange={onChangeHandler} />
                    <span className={styles.dropDown}></span>
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-8 mb-5">
                <button type="submit" disabled={isOkayDisabled}>Ok</button>
                <button onClick={onCancelClick}>Cancel</button>
                <button disabled>Browse</button>
            </div>
        </form>
    );
};

export default Run;