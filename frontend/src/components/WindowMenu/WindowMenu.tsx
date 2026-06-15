import { useEffect, useRef, useState } from "react";
import styles from "./WindowMenu.module.scss";

export interface WindowMenuItem {
    label?: string;
    onClick?: () => void;
    disabled?: boolean;
    separator?: boolean;
    /** Right-aligned accelerator hint, e.g. "Ctrl+S" */
    shortcut?: string;
}

export interface WindowMenuDef {
    label: string;
    disabled?: boolean;
    items?: WindowMenuItem[];
}

interface WindowMenuProps {
    /** Legacy: flat, non-interactive labels (placeholder menus) */
    menuItems?: string[];
    /** Interactive dropdown menus */
    menus?: WindowMenuDef[];
    hasWindowsLogo?: boolean;
    isMinified?: boolean;
}

const WindowMenu = ({ menuItems = [], menus, hasWindowsLogo = false, isMinified = false }: WindowMenuProps) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const menuRef = useRef<HTMLElement | null>(null);

    const isInteractive = (def: WindowMenuDef) => !def.disabled && !!def.items?.length;

    // Close the open menu on an outside click or Escape
    useEffect(() => {
        if (openIndex === null) return;

        const onPointerDown = (event: PointerEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpenIndex(null);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpenIndex(null);
        };

        window.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [openIndex]);

    if (menus) {
        const toggleMenu = (index: number, def: WindowMenuDef) => {
            if (!isInteractive(def)) return;
            setOpenIndex((current) => (current === index ? null : index));
        };
        // With a menu open, hovering another top-level item switches to it
        const onTopPointerEnter = (index: number, def: WindowMenuDef) => {
            if (openIndex !== null && isInteractive(def)) setOpenIndex(index);
        };
        const runItem = (item: WindowMenuItem) => {
            if (item.separator || item.disabled || !item.onClick) return;
            setOpenIndex(null);
            item.onClick();
        };

        return (
            <section ref={menuRef} className={`${styles.windowMenu} ${styles.dropdownMenu}`} data-minified={isMinified}>
                <div className={styles.menuInner}>
                    <ul className={styles.menuList}>
                        {menus.map((def, index) => (
                            <li key={index} className={styles.menuItem} data-disabled={!isInteractive(def)} data-open={openIndex === index}>
                                <button type="button" onClick={() => toggleMenu(index, def)} onPointerEnter={() => onTopPointerEnter(index, def)} disabled={def.disabled}>
                                    {def.label}
                                </button>
                                {openIndex === index && def.items?.length ? (
                                    <ul className={styles.dropdown}>
                                        {def.items.map((item, itemIndex) => (
                                            item.separator ? (
                                                <li key={itemIndex} className={styles.separator} role="separator" />
                                            ) : (
                                                <li key={itemIndex} className={styles.dropdownItem} data-disabled={!!item.disabled}>
                                                    <button type="button" onClick={() => runItem(item)} disabled={item.disabled}>
                                                        <span>{item.label}</span>
                                                        {item.shortcut ? <span className={styles.shortcut}>{item.shortcut}</span> : null}
                                                    </button>
                                                </li>
                                            )
                                        ))}
                                    </ul>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                </div>
                {hasWindowsLogo && <img src="icon__windows_logo.png" height="100%" width="40" />}
            </section>
        );
    }

    return (
        <section className={`${styles.windowMenu} flex ${hasWindowsLogo ? "justify-between" : "justify-start"}`} data-minified={isMinified}>
            <div className="relative overflow-hidden w-full">
                <ul className={`${styles.flatList} flex mx-1`}>
                    {menuItems.map((item, index) => <li key={index} className="display-block my-1 px-2.5 py-1"><button>{item}</button></li>)}
                </ul>
            </div>
            {hasWindowsLogo && <img src="icon__windows_logo.png" height="100%" width="40" />}
        </section>
    );
};

export default WindowMenu;
