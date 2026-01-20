import './App.css';
import TaskBar from "./components/TaskBar/TaskBar"
import { useState } from "react";

function App() {
  const [backgroundImage, setBackgroundImage] = useState("/wallpaper__default.jpg");

  return (
    <>
      <img src={backgroundImage} width="100%" height="100%" className="fixed inset-0 object-cover object-center h-full" />
      <TaskBar />
    </>
  )
}

export default App;
