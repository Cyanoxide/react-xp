import { useContext } from "../../context/context";

const Wallpaper = () => {
    const { wallpaper } = useContext();

    return (
        <img src={wallpaper} width="100%" height="100%" className="fixed inset-0 object-cover object-center h-full" draggable={false} />
    );
};

export default Wallpaper;