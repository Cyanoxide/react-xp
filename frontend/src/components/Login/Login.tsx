import { Activity } from "react";
import { useState, useEffect } from "react";
import { useContext } from "../../context/context";
import playSound from "../../utils/sounds";
import styles from "./Login.module.scss";

interface LoginProps {
    user: string;
}

const Login = ({ user }: LoginProps) => {
    const {dispatch} = useContext();
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    useEffect(() => {
        const welcomeDelay = setTimeout(() => {
            setIsLoading(false);
        }, 3000);

        return () => clearTimeout(welcomeDelay);
    }, []);


    const onUserClickHandler = () => {
        setIsLoggingIn(true);
        const loggingInDelay = setTimeout(() => {
            playSound("startup", true);
            dispatch({ type: "SET_IS_LOGIN_DISMISSED", payload: true });
            sessionStorage.setItem("loginDismissed", "true");
        }, 500);

        return () => clearTimeout(loggingInDelay);
    };

    return (
        <div className={`${styles.login} flex flex-col justify-center relative w-full h-full`}>
            <div className="grow h-1/7"></div>
            <Activity mode={(isLoading) ? "visible" : "hidden"}>
                <main className="flex h-6/7 px-8">
                    <h1 className="text-9xl">Welcome</h1>
                </main>
            </Activity>
            <Activity mode={(!isLoading) ? "visible" : "hidden"}>
                <main className="flex h-6/7 px-8">
                    <div className={`${styles.details} flex flex-col justify-center items-end`}>
                        {!isLoggingIn && (
                            <>
                                <img className="mb-6" src="/logo__windows_xp.png" height="150" width="150" />
                                <h3 className="text-right">To begin, click your user name</h3>
                            </>
                        )}
                        {isLoggingIn && <h1 className={styles.loginMsg}>Welcome</h1>}
                    </div>
                    <span className={`${styles.seperator} m-9`}></span>
                    <div className="flex flex-col justify-center">
                        <button className={`${styles.userContainer} flex p-3 gap-5`} data-logging-in={isLoggingIn} onClick={onUserClickHandler}>
                            <img className={`${styles.avatar} m-1.5`} width="50" height="50" data-logging-in={isLoggingIn} src="/avatar__skateboard.png" />
                            <div className={`${styles.userNameContainer} flex flex-col`}>
                                <h3  data-logging-in={isLoggingIn}>{user}</h3>
                                {isLoggingIn && <p>Loading your personal settings...</p>}
                            </div>
                        </button>
                    </div>
                </main>
            </Activity>

            <div className={`flex justify-center grow h-1/7`}>
                <div className={`${styles.footer} w-full p-9 flex`}>
                    {(!isLoading && !isLoggingIn) && (
                        <>
                            <button className={`${styles.shutDown} flex items-center cursor-not-allowed mb-4`}>
                                <img className="mr-3" width="22" height="22" src="/icon__shut_down--large.png" />
                                <h3>Turn off Computer</h3>
                            </button>
                            <div className="max-w-90">
                                <p>After you log on, you can add or change accounts. Just go to Control Panel and click User Accounts.</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>    
    );
};

export default Login;