import Desktop from "./components/Desktop/Desktop";
import TaskBar from "./components/TaskBar/TaskBar";
import Wallpaper from "./components/Wallpaper/Wallpaper";
import WindowManagement from "./components/WindowManagement/WindowManagement";
import { Provider } from "./context/provider";

function App() {
  return (
    <Provider>
      <Wallpaper />
      <Desktop />
      <TaskBar />
      <WindowManagement />
    </Provider>
  );
}

export default App;
