import { useRef } from "react";
import Button from "../../Button/Button";
import styles from "./Setting.module.scss";

const Setting = () => {
    const tabMenuRef = useRef<HTMLElement | null>(null);

    const tabClickHandler = (event: React.MouseEvent) => {
        if (!(event.target as HTMLElement).dataset.tabName || !tabMenuRef.current) return;

        const tabs = tabMenuRef.current.querySelectorAll("[data-tab-name]") as NodeListOf<HTMLElement>;
        const selectedTab = (event.target as HTMLElement).dataset.tabName;
        const content = tabMenuRef.current.querySelectorAll("[data-content-tab]");
        const selectedContent = tabMenuRef.current.querySelector(`[data-content-tab="${selectedTab}"]`);
        if (!selectedTab || !content) return;

        tabs.forEach((item) => {
            item.dataset.active = "false";
        });
        (event.target as HTMLElement).dataset.active = "true";

        content.forEach((item) => {
            item.classList.add("hidden");
        });
        selectedContent?.classList.remove("hidden");
    };

    return (
        <div className={`${styles.settings} flex flex-col justify-between gap-3 h-full p-3`}>
            <main className="h-full mt-6" ref={tabMenuRef}>
                <nav>
                    <ul className="flex">
                        <li onClick={tabClickHandler} className="px-2" data-tab-name="themes">Themes</li>
                        <li onClick={tabClickHandler} className="px-2" data-tab-name="desktop" data-active="true">Desktop</li>
                        <li onClick={tabClickHandler} className="px-2" data-tab-name="screensaver">Screensaver</li>
                        <li onClick={tabClickHandler} className="px-2" data-tab-name="appearance">Appearance</li>
                        <li onClick={tabClickHandler} className="px-2" data-tab-name="settings">Settings</li>
                    </ul>
                </nav>
                <div className="p-3">
                    <section className="" data-content-tab="themes">Themes</section>
                    <section className="hidden" data-content-tab="desktop">Desktop</section>
                    <section className="hidden" data-content-tab="screensaver">Screensaver</section>
                    <section className="hidden" data-content-tab="appearance">Appearance</section>
                    <section className="hidden" data-content-tab="settings">Settings</section>
                </div>
            </main>
            <footer className="flex justify-end gap-2">
                <Button>Ok</Button>
                <Button>Cancel</Button>
                <Button disabled>Apply</Button>
            </footer>
        </div>
    );
};

export default Setting;