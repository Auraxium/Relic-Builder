import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { ipcFetch } from "./statics";
import "./App.css";

function App() {

  return (
    <div className="h-12 w-12 bg-neutral-400" onClick={e => ipcFetch('scan').then(console.log)}>
      fix
    </div>
  );
}

export default App;
