import styles from "./CollapseBox.module.scss";
import { useState } from "react";
import type { ReactNode } from "react";

interface CollapseBoxProps {
    title: string;
    children: ReactNode;
}

const CollapseBox = ({ title, children }: CollapseBoxProps) => {
    const [isCollapseBoxOpen, setIsCollapseBoxOpen] = useState(true);

    const onClickHandler = () => {
        setIsCollapseBoxOpen((isCollapseBoxOpen) ? false : true);
    }

    return (
        <section className={`${styles.collapseBox} m-5`} data-open={isCollapseBoxOpen}>
            <div className={`${styles.header} flex justify-between items-center pl-3 pr-1 py-1`}>
                <h5 className="font-bold">{title}</h5>
                <img src="icon__dropdown.png" width="14" height="14" onClick={onClickHandler} />
            </div>
            <div className={styles.content}>{children}</div>
        </section>
    );
};

export default CollapseBox;