import { Provider } from "./context/provider";
import TaskBar from "./components/TaskBar/TaskBar";
import Wallpaper from "./components/Wallpaper/Wallpaper";
import Window from "./components/Window/Window";
import './App.css';

function App() {
  return (
    <Provider>
      <Wallpaper />
      <TaskBar />
      <Window />
    </Provider>
  )
}

export default App;
