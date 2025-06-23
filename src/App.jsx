import React, { useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { ipcFetch, color_text, size_text, color_code, color_muted, perks, init, debounce, states, varsAt } from "./statics";
import { IconSearch, IconX, IconTrash, IconHome } from "@tabler/icons-react";
import "./App.css";

const Relic = ({ relic }) => {

  const List = ({ ind, perk = perks[relic.perks?.[ind]] || '' }) => <div className="text-[clamp(14px,_.85vw,_20px)], border-b-[1px] border-[#777] capitalize flex items-center text-nowrap" style={{ fontSize: `clamp(14px, calc(1vw - ${(perk.length) * .05}px), 26px)`, }}>- {perk || ''}</div>
  //b 13072c g 062609 r 260606 y 302902
  return (
    <div className="border-[1px] w-full xl:w-[49.3%] h-[160px] border-[#777] bg-neutral-950 gap-2 p-4 flex" style={{ borderColor: color_muted[relic.colorl], backgroundColor: color_muted[relic.colorl] }} >
      <div className="img border-s-[3px] w-[5.2vw] min-w-[80px] aspect-square box-content " style={{ backgroundImage: `url(/${relic.color}${relic.perks.length}.png)`, borderColor: color_code[relic.color] }}></div>
      <div className="flex flex-col grow w-1 relative -top-[6px]">
        <div className=" text-[clamp(28px,_2vw,_32px)] font-light capitalize hightop ">{relic.name || `${size_text[relic.perks.length]} ${color_text[relic.color]} Scene`}</div>
        <List ind={0} />
        <List ind={1} />
        <List ind={2} />
      </div>
    </div>
  );
};

function Home({ relics = states.relics }) {
  let [filter, setFilter] = useState({})
  let relics_list = React.useMemo(() => Object.values(relics), [relics])
  if ('rbyg'.split('').some(c => filter[c])) relics_list = relics_list.filter(rel => filter[rel.color]);
  if ('123'.split('').some(c => filter[+c])) relics_list = relics_list.filter(rel => filter[rel.perks.length])
  if ('search' in filter) relics_list = relics_list.filter(rel => rel.perks.map(el => perks[el]).join(' ').includes(filter.search))
  let search_bar = useRef()
  let bounceSearch = debounce((s) => setFilter({ ...filter, search: s }), 400);

  const Option = ({ color }) => (
    <div className="w-[40px] rounded-xl border-[2px] border-[#777] hover:border-[#aaa] center text-[#3a8dc4] bg-[#333] text-[21px] center capitalize" style={{ color: color_code[color], borderColor: filter[color] ? '#fff' : '' }} onClick={() => setFilter({ ...filter, [color]: !filter[color] })}>
      {color}
    </div>
  )

  return (
    <div className="full flex flex-col py-4">
      <div className="flex border-b-[#777]  bg-[#111] p-2 gap-2 w-full ">
        <div className="flex items-center justify-end w-[250px] gap-2 ">
          <div className="w-[20px]"><IconSearch /> </div>
          <input ref={search_bar} type="text" placeholder={'Search'} defaultValue={filter.search || ''} onChange={(e => bounceSearch(e.target.value))} className="grow w-1 bg-[#444] p-1" />
        </div>
        <div className="w-[content] rounded-lg border-[2px] me-4 border-[#777] hover:border-[#aaa] center text-[#ccc] bg-[#333] text-[18px]  p-1 center capitalize" onClick={() => { search_bar.current.value = ''; setFilter({}) }}> Clear </div>
        <Option color={'r'} />
        <Option color={'b'} />
        <Option color={'g'} />
        <Option color={'y'} />
        <div className="aspect-square h-full rounded-lg border-[2px] ms-4 border-[#666] hover:border-[#aaa] center text-[#ccc] bg-[#333] text-[18px]  p-1 center capitalize" style={{ borderColor: filter[1] ? '#fff' : '' }} onClick={() => setFilter({ ...filter, [1]: !filter[1] })}> 1 </div>
        <div className="aspect-square h-full rounded-lg border-[2px] border-[#666] hover:border-[#aaa] center text-[#ccc] bg-[#333] text-[18px] p-1 center capitalize" style={{ borderColor: filter[2] ? '#fff' : '' }} onClick={() => setFilter({ ...filter, [2]: !filter[2] })}> 2 </div>
        <div className="aspect-square h-full rounded-lg border-[2px] border-[#666] hover:border-[#aaa] center text-[#ccc] bg-[#333] text-[18px] p-1 center capitalize" style={{ borderColor: filter[3] ? '#fff' : '' }} onClick={() => setFilter({ ...filter, [3]: !filter[3] })}> 3 </div>
      </div>
      <div className="grow overflow-y-auto overflow-x-hidden h-1">
        <div className="h-full, mt-4 w-full  flex flex-wrap-reverse center, content-end-safe gap-2">
          {relics_list.length ? relics_list.map((rel, i) => <Relic relic={rel} key={i} />) : <div className="bg-neutral-950 p-2 center" >No Results</div>}
        </div>
      </div>
    </div>
  )
}

function Create({ edit }) {
  let [form, setForm] = useState({ perks: [] });
  let [search, setSearch] = useState('');
  let perks_list = React.useMemo(() => perks
    .map((perk, i) => ({ text: perk, ind: i }))
    .slice(0, varsAt)
    .sort((a, b) => {
      const normalize = (s) => s.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      return normalize(a.text).localeCompare(normalize(b.text));
    }), [perks]);
  if (search) search = perks_list.filter(perk => perk.text.includes(search))
  let last = useRef();
  let size = form.perks.length;
  let perk_set = new Set(form.perks);
  let bounceSearch = debounce((s) => setSearch(s), 400);

  const List = ({ ind }) => <div className="text-[20px] border-b-[1px] border-[#777] capitalize flex items-center text-nowrap">- {perks[form.perks[ind]]} {form.perks[ind] > -1 && (<IconX className="ms-auto" onClick={e => { form.perks.splice(ind, 1); setForm({ ...form }) }} />)}  </div>
  const Option = ({ color }) => (
    <div className="w-[120px] aspect-[2.4] rounded-xl border-[2px] border-[#777] hover:border-[#ddd] center text-[#3a8dc4] bg-[#333] text-[21px]  " style={{ color: color_code[color] }} onClick={() => setForm({ ...form, color })}>
      {color_text[color]}
    </div>
  )

  useEffect(() => {
    last.current = `/${form.color || "r"}${form.perks.length || 1}.png`;
  });

  return (
    <div className="full p-[18px] rounded-xl center, flex flex-col">
      <div className="flex">
        <img src={last.current} className={`h-[120px] ${!form.color && "grayscale"} img aspect-square border-[1px] border-[#777] rounded-md, me-4`} />
        <img src={`/${form.color || "r"}${size || 1}.png`} className={`h-[120px] z-10 ${!form.color && "grayscale"} pointer-events-none hidden img aspect-square border-[1px] border-[#777] rounded-md, me-4 absolute`} onLoad={(e) => (e.target.style.display = "flex")} />
        <div className="grow flex flex-col relative -top-[12px] ">
          <div className=" text-[42px] font-light capitalize hightop ">{!form.color && !size ? "Relic" : `${size_text[size] || ""} ${color_text[form.color] || ""} Scene`} </div>
          <List ind={0} />
          <List ind={1} />
          <List ind={2} />
        </div>
      </div>
      <div className="flex justify-around, gap-4 my-4">
        <Option color={'r'} />
        <Option color={'b'} />
        <Option color={'g'} />
        <Option color={'y'} />
        <div className="ms-auto flex gap-2">
          <div className="w-[120px] aspect-[2.4] rounded-xl border-[2px] border-[#777] hover:border-[#ddd] center bg-[#333] text-[21px]" onClick={s => setForm({ perks: [] })}>Clear</div>
          <div className="w-[120px] aspect-[2.4] rounded-xl border-[2px] border-[#777] hover:border-[#ddd] center bg-teal-700 hover:bg-teal-600 text-[21px]" onClick={e => {
            if (!form.perks.length || !form.color) return;
            form.id ??= `${form.color}${form.perks.length}_${form.perks.join("_")}`
            console.log(form)
            states.setRelics(p => ({ ...p, [form.id]: form }))
            states.setPage('')
          }}>Save</div>
        </div>
      </div>
      <div className="flex h-6 w-full mb-2  px-">
        <div className="flex items-center justify-end w-[200px] gap-2 ">
          <div className="w-[20px]"><IconSearch /> </div>
          <input type="text" placeholder={'Search'} onChange={(e => bounceSearch(e.target.value))} className="grow w-1 bg-[#444] p-1" />
        </div>
      </div>

      <div className="grow h-1 border, w-full gap-1 overflow-auto flex flex-wrap content-start">
        {(search || perks_list).map((perk) => {

          let on = perk_set.has(perk.ind) && '#226C7D';
          return (
            <div key={perk.ind}
              className="flex p-1 h-8 items-center w-[32.9%] bg-[#3c3c3c] capitalize hover:bg-neutral-600 leading-[1]"
              style={{ fontSize: `clamp(14px, ${(window.innerWidth * 0.41) / perk.text.length}px, 20px)`, backgroundColor: on }}
              onPointerDown={(e) => {
                on ? perk_set.delete(perk.ind) : perk_set.add(perk.ind)
                if (perk_set.size > 3) return setForm({ ...form, perks: [...form.perks.slice(0, 2), perk.ind] })
                setForm({ ...form, perks: [...perk_set] })
              }}
            >
              {perk.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

let nav_icon = {
  relics: <IconHome size={28} stroke={1.5} />
}

function App() {
  let [relics, setRelics] = useState();
  let [page, setPage] = useState(<Home />);

  const Nav = ({ to, comp, click }) => <div className="w-full h-[60px] bg-[#585858] hover:bg-[#777] rounded-sm center gap-1 capitalize text-[22px]" onClick={() => {
    click && click()
    setPage(comp)
  }}>{nav_icon[to]}{to}</div>

  states.relics = relics
  useEffect(() => {
    console.log('use effect reran');
    states.setRelics = setRelics;
    states.setPage = setPage;
    init().then(res => {
      if (!relics) setRelics(res)
    });
  }, []);
  //#1f1f1f #1f1b24
  if (!relics) return <></>;
  return (
    <div style={{ backgroundImage: `url(/bg3.png)` }} className="full, flex flex-col  img h-[100svh] w-[100svw] bg-[#202020] ">
      <div className="nav bg-[#0d0d0b] h-[6%] min-h-[50px] max-h-[80px] flex p-2 items-center,">
        <div className="flex items-center h-full" onClick={() => setPage("")}>
          <div style={{ backgroundImage: "url(/rblogo.png)", backgroundPosition: "bottom" }} className="img border-[#777] border-[1px] h-full rounded-md w-12"></div>
          <div className="ms-1 hightop text-[32px]">Relic Builder</div>
        </div>
      </div>

      <div className="main grow flex ">
        <div className="left h-full w-[12%] center">
          <div className="w-[70%] h-[85%] bg-neutral-950 rounded xl p-2 space-y-1">
            <Nav to={'relics'} comp={<Home />} />
            <Nav to={'add'} comp={<Create />} />
            <Nav to={'Scan'} comp={<Home />} click={() => ipcFetch('scan_rdy')} />
            <Nav to={'Builds'} comp={<Home />} />
            <Nav to={'sett'} comp={<Home />} />
            <div className="" onClick={e => ipcFetch('test').then(console.log)}>asdf</div>
          </div>
        </div>

        <div key={Math.random()} className="mid grow w-1">{page || <Home />}</div>

        <div className="right w-[8%]">
          <div className="fixed right-0 bottom-0 flex items-center border border-[#555] p-1 gap-1 cursor-pointer" onClick={() => ipcFetch('support')}>
            <img height={18} width={26} src="https://storage.ko-fi.com/cdn/logomarkLogo.png" alt="" />
            <span>Support Me</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
