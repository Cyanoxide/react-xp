import styles from "./Button.module.scss";

const Button = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    return (
        <button className={styles.btn} {...props}>{children}</button>
    );
};

export default Button;
