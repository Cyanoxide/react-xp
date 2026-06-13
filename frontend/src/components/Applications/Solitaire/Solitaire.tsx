// Solitaire lives in its own repo (github:Cyanoxide/react-solitaire) and is
// consumed here as a component. This thin wrapper keeps the file/folder name
// the WindowContent auto-registry expects (Applications/Solitaire/Solitaire.tsx).
import "react-solitaire/style.css";
export { Solitaire as default } from "react-solitaire";
