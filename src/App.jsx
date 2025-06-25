import React, { useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { ipcFetch, color_text, size_text, color_code, color_muted, perks, init, debounce, states, varsAt, generateBuild, chars, char_icons, scanning } from "./statics";
import { IconSearch, IconX, IconTrash, IconHome, IconPencil } from "@tabler/icons-react";
import { VirtuosoGrid } from 'react-virtuoso'
import "./App.css";

const option_class = 'aspect-square, h-full, rounded-lg border-[2px] ms-4, border-[#666] hover:border-[#aaa] center text-[#ccc] bg-[#333] text-[18px] p-1 center capitalize';

const Relic = ({ relic, edit }) => {

  const List = ({ ind, perk = perks[relic.perks?.[ind]] || '' }) => <div className="text-[clamp(14px,_.85vw,_20px)], border-b-[1px] border-[#777] capitalize flex items-center text-nowrap, leading-[1.3]" style={{ fontSize: `clamp(16px, calc(1vw - ${(perk.length) * .05}px), 26px)`, }}>- {perk || ''}</div>
  //b 13072c g 062609 r 260606 y 302902
  return (
    <div className="border-[1px] w-full xl:w-[46.3%], h-[150px] border-[#777] bg-neutral-950 gap-2 p-4 flex" style={{ borderColor: color_muted[relic.colorl], backgroundColor: color_muted[relic.colorl] }} >
      <div className="img border-s-[3px] w-[5.2vw] min-w-[80px] aspect-square box-content " style={{ backgroundImage: `url(/${relic.color}${relic.perks.length}.png)`, borderColor: color_code[relic.color] }}></div>
      <div className="flex flex-col grow w-1 relative -top-[6px]">
        <div className=" text-[clamp(28px,_2vw,_30px)] font-light capitalize hightop flex ">
          {relic.name || `${size_text[relic.perks.length]} ${color_text[relic.color]} Scene`}
          {edit ?
            <div className="ms-auto flex gap-2">
              <IconPencil />
              <IconTrash onClick={() => { ipcFetch('save_relic', { relic: { del: 1, id: relic.id } }); delete states.relics[relic.id]; states.setRelics({ ...states.relics }) }} />
            </div>
            :
            ''
          }
        </div>
        <List ind={0} />
        <List ind={1} />
        <List ind={2} />
      </div>
    </div>
  );
};

function Home({ relics = states.relics }) {
  let [filter, setFilter] = useState({})
  let relics_list = React.useMemo(() => Object.values(relics).reverse(), [relics])
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
      <div className="flex border-b-[#777] items-center bg-[#111] p-2 gap-2 w-full ">
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
        <div className="ms-auto">{relics_list.length} Relics</div>
      </div>
      <div className="grow w-full overflow-y-auto, overflow-x-hidden my-4 h-1">
        <VirtuosoGrid
          totalCount={relics_list.length}
          itemContent={(index) => <Relic relic={relics_list[index]} edit={1} key={index} />}
          listClassName="grid grid-cols-1 xl:grid-cols-2 gap-2 w-full p-2"
          itemClassName="w-full"
          style={{ height: '100%', overflowY: 'auto' }}
        />
      </div>
    </div>
  )
}

const Build = ({ build, add }) => {
  let cup = build[2].split('$');
  let colors = cup.at(-1).split('')
  let name = cup[0] + ':'
  if (name[0] == '@') name = `${build[3]}'s ${name.slice(1)}`

  return (
    <div className="h-1, space-y-2" >
      <div className="capitalize text-[22px] flex h-12 items-center">
        {name}
        <div className="flex gap-1 ms-4">
          {colors.map(c => <div className="rounded-md flex border-[1px] bg-[#5d4e03],  w-12 h-12 border-[#555]" style={{ backgroundColor: color_muted[c] }} ></div>)}
        </div>
      </div>
      <Relic relic={states.relics[build[1][0]['id']]} />
      <Relic relic={states.relics[build[1][1]['id']]} />
      <Relic relic={states.relics[build[1][2]['id']]} />
    </div>
  )
}

const PerkList = ({ _ref }) => {
  let [perk_set, setPerks] = useState([])
  let [search, setSearch] = useState('');
  let perks_list = React.useMemo(() => perks
    .map((perk, i) => ({ text: perk, ind: i }))
    .slice(0, varsAt)
    .sort((a, b) => {
      const normalize = (s) => s.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      return normalize(a.text).localeCompare(normalize(b.text));
    }), [perks]);
  if (search) search = perks_list.filter(perk => perk.text.toLowerCase().includes(search.toLowerCase()))
  perk_set = new Set(perk_set)

  useEffect(() => {
    _ref.setPerks = setPerks
    _ref.picks = [...perk_set]
    _ref.setSearch = setSearch
  })

  return (
    <div className="full gap-1 overflow-auto flex flex-wrap content-start">
      {(search || perks_list).map((perk) => {
        let on = perk_set.has(perk.ind) && '#226C7D';
        return (
          <div key={perk.ind}
            className="flex p-1 h-8 items-center w-[32.9%] bg-[#3c3c3c] capitalize hover:bg-neutral-600 leading-[1]"
            style={{ fontSize: `clamp(14px, ${(window.innerWidth * 0.41) / perk.text.length}px, 20px)`, backgroundColor: on }}
            onPointerDown={(e) => {
              // console.log(perk.ind);
              on ? perk_set.delete(perk.ind) : perk_set.add(perk.ind)
              // if (perk_set.size > 3) return setForm({ ...form, perks: [...form.perks.slice(0, 2), perk.ind] })
              setPerks([...perk_set])
            }}
          >
            {perk.text}
          </div>
        );
      })}
    </div>
  )
}

function Builds({ }) {
  let [character, setCharacter] = useState('')
  let [builds, setBuilds] = useState([])
  let chars_list = Object.keys(chars).map(char => ({ ...chars[char], name: char })).slice(0, -1)
  let pl = useRef()
  let bounceSearch = debounce((s) => pl.setSearch(s), 400);

  return (
    <div className="full flex flex-col gap-2 py-4">
      <div className="flex cont, gap-1 border-[#666]  ">
        {chars_list.map(char => (
          <div className={`${option_class}`} style={{ borderColor: character == char.name ? 'teal' : '', color: character == char.name ? '#fff' : '' }} onClick={() => setCharacter(char.name)}>
            {char_icons[char]}
            {char.name}
          </div>
        ))}
      </div>
      {builds.length ?
        <div className="flex flex-col grow h-1 gap-2 overflow-y-auto">
          {builds.map(b => <Build build={b} />)}
        </div>
        : character ?
          <div className="grow h-1 flex flex-col">
            <div className="flex gap-2 p-2 items-center">
              <span className="text-[22px]">Choose perks for <span className="capitalize">{character}'s</span> build:</span>
              <div className={`${option_class} `} onClick={() => pl.setPerks([...chars[character].recs])} >Use Recommended</div>
            </div>
            <div className="flex items-center mb-2 justify-end w-[200px] gap-2 ">
              <div className="w-[20px]"><IconSearch /> </div>
              <input type="text" placeholder={'Search'} onChange={(e => bounceSearch(e.target.value))} className="grow w-1 bg-[#444] p-1" />
            </div>
            <div className="grow h-1 overflow-y-auto overflow-x-hidden">
              <PerkList _ref={pl} />
            </div>
          </div>
          :
          ''
      }

      <div className="mt-auto p-2 h-16 w-full items-center flex bg-neutral-900,">
        <div className=""></div>
        <div className="flex ms-auto gap-2">
          <div className={`${option_class} `} onClick={() => { pl.setPerks([]); setBuilds([]) }}>Clear</div>
          <div className={`${option_class} bg-teal-700 `} onClick={() => setBuilds(generateBuild(pl.picks, character))}>Generate Build</div>
        </div>

      </div>
    </div>
  )
}

function Create({ edit }) {
  let [form, setForm] = useState(edit || { perks: [] });
  let [search, setSearch] = useState('');
  let perks_list = React.useMemo(() => perks
    .map((perk, i) => ({ text: perk, ind: i }))
    .slice(0, varsAt)
    .sort((a, b) => {
      const normalize = (s) => s.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      return normalize(a.text).localeCompare(normalize(b.text));
    }), [perks]);
  // console.log(perks_list);
  if (search) search = perks_list.filter(perk => perk.text.toLowerCase().includes(search.toLowerCase()))
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
            ipcFetch('save_relic', { relic: form })
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

function Config() {

  return (
    <div className=""></div>
  )
}

function App() {
  let [relics, setRelics] = useState();
  let [page, setPage] = useState(<Home />);
  let scan_card = useRef()

  const Nav = ({ to, comp, click }) => <div className="w-full h-[60px] bg-[#434343] hover:bg-[#777] rounded-sm center gap-1 capitalize text-[22px]" onClick={() => {
    click && click()
    setPage(comp)
  }}>{nav_icon[to]}{to}</div>

  states.relics = relics
  useEffect(() => {
    console.log('use effect reran');
    states.setRelics = setRelics;
    states.setPage = setPage;
    init().then(res => {
      setRelics(res)
    });
  }, []);
  //#1f1f1f #1f1b24
  if (!relics) return <></>;
  return (
    <div style={{ backgroundImage: `url(/bg3.png)` }} className="full, flex flex-col  img h-[100svh] w-[100svw] bg-[#202020] ">
      <div ref={scan_card} className="fixed w-[100svw] h-[100svh] center bg-[rgba(0,0,0,0.6)] bg-black, z-10" style={{ display: 'none' }} onClick={e => scan_card.current.style.display = 'none'}>
        <div className="rounded-xl bg-[#333] w-[80%] h-[80%], text-[20px] p-4" onClick={e => e.stopPropagation()}>
          <div className="w-full center text-[26px]">How to Scan Relics</div>
          <div className="">- Make sure NightReign is open on your default/main monitor</div>
          <div className="">- Make sure game is fullscreen or borderless</div>
          <div className="">- Make sure game is at minimum 1920x1080 resolution</div>
          <div className="">- In the roundtable, navigate to Relic Rites</div>
          <div className="">- Press "D" to move to relics section</div>
          <div className="">- Press 4, then 2 to clear any filters</div>
          <div className="">- Sort by "Order Found", Decending</div>
          <div className="">- Go back with "Q"</div>
          <div className="">- Make sure game is focused</div>
          <div className="">- Make sure youre in relics section</div>
          <div className="">- Highlight relic you wish to start scanning from (Top Left)</div>
          <div className="">- Scans should end automatically soon after last relic in list</div>
          <div className="">- Hold "9" to stop scan early</div>
          <div className="text-[26px]">- Press "0" to begin scanning</div>
        </div>
      </div>
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
            <Nav to={'Builds'} comp={<Builds />} />
            <Nav to={'add'} comp={<Create />} />
            <Nav to={'Scan'} comp={<Home />} click={() => {scan_card.current.style.display = 'flex'; }} />
            <Nav className="mt-auto" to={'Config'} comp={<Config />} />
            <Nav to={'test'} comp={<Home />} click={e => window.location = 'www.youtube.com'} />
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
