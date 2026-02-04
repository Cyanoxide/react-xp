import styles from "./Tooltip.module.scss";

interface TooltipProps {
    heading: string;
    content: string;
    systemTrayIconDismissed: boolean;
    setSystemTrayIconDismissed: (dismissed: boolean) => void;
}

const Tooltip = ({ heading, content, systemTrayIconDismissed, setSystemTrayIconDismissed }: TooltipProps) => {
    const onClickHandler = () => {
        setSystemTrayIconDismissed(true);
    };

    return (
        <span className={`${styles.tooltip} absolute`} data-dismissed={(systemTrayIconDismissed) ? "true" : "false"} data-label="tooltip">
            <span className="flex items-center mb-1.5">
                <img src="/icon__info.png" width="14" height="14" className="cursor-pointer mr-2 min-w-[14px]"></img>
                <h4>{heading}</h4>
                <button className={styles.tooltipClose} onClick={onClickHandler}><span>+</span></button>
            </span>
            <p className="text-left">{content}</p>
        </span>
    );
};

export default Tooltip;