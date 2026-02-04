import { useState } from "react";
import styles from "./CollapseBox.module.scss";
import type { ReactNode } from "react";

interface CollapseBoxProps {
    title: string;
    children: ReactNode;
}

const CollapseBox = ({ title, children }: CollapseBoxProps) => {
    const [isCollapseBoxOpen, setIsCollapseBoxOpen] = useState(true);

    const onClickHandler = () => {
        setIsCollapseBoxOpen((isCollapseBoxOpen) ? false : true);
    };

    return (
        <section className={`${styles.collapseBox} m-5`} data-open={isCollapseBoxOpen}>
            <button className={`${styles.header} flex justify-between items-center w-full pl-3 pr-1 py-1`} onClick={onClickHandler}>
                <h5 className="font-bold">{title}</h5>
                <span className={styles.icon}></span>
            </button>
            <div className={styles.content}>{children}</div>
        </section>
    );
};

export default CollapseBox;