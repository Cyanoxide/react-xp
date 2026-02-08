import GitHubButton from "react-github-btn";
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
            <p className="text-left mb-3">{content}</p>
            <div className={`${styles.social} flex gap-3`}>
                <GitHubButton href="https://github.com/Cyanoxide/react-xp" data-show-count="true" data-color-scheme="no-preference: light_high_contrast; light: light_high_contrast; dark: light_high_contrast;" aria-label="Star Cyanoxide/react-xp on GitHub">Star</GitHubButton>
                <GitHubButton href="https://github.com/Cyanoxide" data-color-scheme="no-preference: light_high_contrast; light: light_high_contrast; dark: light_high_contrast;" data-show-count="true" aria-label="Follow @Cyanoxide on GitHub">Follow</GitHubButton>
            </div>
        </span>
    );
};

export default Tooltip;
