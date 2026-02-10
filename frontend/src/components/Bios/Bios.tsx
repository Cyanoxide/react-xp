import styles from "./Bios.module.scss";

const Bios = () => {    
    return (
        <div className={`${styles.bios} flex flex-col items-center relative z-10 bg-black w-full h-full`}>
            {(<div className="w-full h-full p-12">
                <div className="flex flex-col justify-center items-center h-7/8">
                    <img width="200" className="mb-10" src="/bios__primary_logo.png" />
                    <img width="150" src="/bios__loading_bar.gif" />
                </div>
                <div className="flex justify-center h-1/8">
                    <div className={`${styles.meta} flex flex-wrap items-end w-full gap-x-20`}>
                        <img width="200" src="/bios__copyright.png" />
                        <img width="75" className="mb-0.5" src="/bios__secondary_logo.png" />
                    </div>
                </div>
            </div>)}
        </div>
    );
};

export default Bios;
