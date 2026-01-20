import { Provider } from "./context/provider";
import TaskBar from "./components/TaskBar/TaskBar"
import Wallpaper from "./components/Wallpaper/Wallpaper"
import './App.css';

function App() {
  return (
    <Provider>
      <Wallpaper />
      <TaskBar />
    </Provider>
  )
}

export default App;
