import React, { useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { ipcFetch, openSupport, CompareStrings, color_text, size_text, color_code, color_muted, perks, init, debounce, clamp, states, varsAt, chars, char_icons, perks_list, checkForAppUpdates, generateBuild2, save } from "./statics";
import { IconSearch, IconX, IconTrash, IconHome, IconPencil, IconListSearch, IconDesk } from "@tabler/icons-react";
import { VirtuosoGrid, Virtuoso, } from 'react-virtuoso'
import effects from './effects.json'
import * as cur from './effects_edit'
import "./App.css";
import File from "./components/File"
import Home, { Relic } from './components/Home'
import Workshop from "./components/Workshop";
import Builds from "./components/Build";

const option_class = 'aspect-square, h-full, rounded-lg border-[2px] ms-4, border-[#666] hover:border-[#aaa] center text-[#ccc] bg-[#333] text-[18px] p-1 center capitalize';
const effects_keys = Object.keys(effects);
export const throw_frontend_error = (j) => states.setError(j)

// let build_cache = []


let nav_icon = {
  relics: <IconHome size={28} stroke={1.5} />
}



function Config() {

  return (
    <div className="">
      <div className={`${option_class} w-[180px] h-24 border-[#dc3545] text-[#dc3545] mt-[10%],`} onClick={e => {
        // ipcFetch('delete_all_data')
        account = {};
        localStorage.clear()
      }}>Delete All Data</div>
    </div>
  )
}

function App() {
  let [relics, setRelics] = useState(account.relics);
  let [page, setPage] = useState(<Home />);
  let scan_card = useRef();

  const Nav = ({ to, comp, click, className }) => <div className={`w-full, border-[#333] p-1 border-[1px] h-[60px], bg-[#1f1f1f] hover:bg-[#777] rounded-sm center gap-1 capitalize text-[22px] ${className}`} onClick={() => {
    click && click();
    setPage(comp)
  }}>{nav_icon[to]}{to}</div>

  states.relics = relics;
  // console.log(chars.ironeye.recs.map(e => perks[e]));

  useEffect(() => {
    // console.log('use effect reran');
    states.setRelics = setRelics;
    states.setPage = setPage;
    init().then(res => {
      // setRelics(res)
    })
    checkForAppUpdates()
    window.scan_card = scan_card;
  }, []);

  // if (!relics) return;
  return (
    <div style={{ backgroundImage: `url(./bg3.png)` }} className="full, flex flex-col img h-[100svh] w-[100svw] bg-[#202020] ">
      <div className="nav bg-[#0d0d0b] h-[6%] min-h-[50px] max-h-[80px] flex p-2 items-center,">
        <div className="flex items-center h-full w-full gap-1 &>*:[w-fit]">
          {/* <div style={{ backgroundImage: "url(/rblogo.png)", backgroundPosition: "bottom" }} className="img border-[#777] border-[1px] h-full rounded-md w-12"></div> */}
          <img src="./rblogo.png" alt="" className="img border-[#777] border-[1px] h-full rounded-md w-12 bg-bottom" />
          <Nav to={'relics'} comp={<Home />} />
          <Nav to={'Builds'} comp={<Builds />} />
          <Nav to={'Workshop'} comp={<Workshop />} />
          {/* <Nav to={'add'} comp={<Create />} /> */}
          <Nav to={'file'} comp={<File />} />
          {/* <Nav to={'Scan'} comp={<Scan relics={relics} />} click={() => { window.scanning = true; scan_card.current.style.display = 'flex'; ipcFetch('scan_rdy') }} /> */}
          <Nav className="mt-" to={'Config'} comp={<Config />} />
          <div className="ms-auto"></div>
          {/* <div className="ms-auto opacity-15">v1.0.3</div> */}
        </div>
      </div>
      <div className="main grow flex ">
        <div key={Math.random()} className="mid grow p-1 w-1">{page || <Home />}</div>
      </div>
      {/* <div className="fixed left-0 bottom-0 flex items-center border border-[#555] p-1 gap-1 cursor-pointer" onClick={openSupport}>
        <img height={18} width={26} src="https://storage.ko-fi.com/cdn/logomarkLogo.png" alt="" />
        <span>Support Me</span>
      </div> */}
    </div>
  );
}

export default App;
