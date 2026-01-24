import { Provider } from "./context/provider";
import TaskBar from "./components/TaskBar/TaskBar";
import Wallpaper from "./components/Wallpaper/Wallpaper";
import WindowManagement from "./components/WindowManagement/WindowManagement";
import './App.css';

function App() {
  return (
    <Provider>
      <Wallpaper />
      <TaskBar />
      <WindowManagement />
    </Provider>
  )
}

export default App;
