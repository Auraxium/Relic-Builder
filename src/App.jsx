import React, { useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { ipcFetch, color_text, size_text, color_code, color_muted, perks, init, debounce, clamp, states, varsAt, generateBuild, chars, char_icons, base_relics, perks_list, checkForAppUpdates } from "./statics";
import { IconSearch, IconX, IconTrash, IconHome, IconPencil, IconListSearch } from "@tabler/icons-react";
import { VirtuosoGrid } from 'react-virtuoso'
import "./App.css";

const option_class = 'aspect-square, h-full, rounded-lg border-[2px] ms-4, border-[#666] hover:border-[#aaa] center text-[#ccc] bg-[#333] text-[18px] p-1 center capitalize';
export const throw_frontend_error = (j) => states.setError(j)

const Relic = ({ relic, edit, className }) => {

  const List = ({ ind, perk = perks[relic.perks?.[ind]] || '' }) => <div className="text-[clamp(14px,_.85vw,_20px)], border-b-[1px] border-[#777] capitalize flex items-center text-nowrap, leading-[1.3]" style={{ fontSize: `clamp(16px, calc(1vw - ${(perk.length) * .05}px), 26px)`, }}>- {perk || ''}</div>
  //b 13072c g 062609 r 260606 y 302902
  return (
    <div className={`border-[1px] w-full xl:w-[46.3%], h-[180px] min-h-[180px] border-[#777] bg-neutral-950 gap-2 p-4 flex ${className}`} style={{}} >
      <div className="img border-s-[3px] w-[5.2vw] min-w-[80px] aspect-square box-content " style={{ backgroundImage: `url(/${relic.color}${relic.perks.length}.png)`, borderColor: color_code[relic.color] }}></div>
      <div className="flex flex-col grow w-1 relative -top-[6px]">
        <div className=" text-[clamp(28px,_2vw,_30px)] font-light capitalize hightop flex ">
          {relic.name || `${size_text[relic.perks.length]} ${color_text[relic.color]} Scene`}
          {edit ?
            <div className="ms-auto flex gap-2">
              <IconPencil onClick={() => states.setPage(<Create edit={relic} />)} />
              <IconTrash onClick={() => { delete states.relics[relic.id]; states.setRelics({ ...states.relics }) }} />
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
  let search_bar = useRef()
  let perk_list = useRef()

  let relics_list = React.useMemo(() => Object.values(relics).reverse(), [relics])
  relics_list = React.useMemo(() => {
    if ('rbyg'.split('').some(c => filter[c])) relics_list = relics_list.filter(rel => filter[rel.color]);
    if ('123'.split('').some(c => filter[+c])) relics_list = relics_list.filter(rel => filter[rel.perks.length])
    if ('search' in filter) relics_list = relics_list.filter(rel => rel.perks.map(el => perks[el]).join(' ').includes(filter.search))
    if (filter.picks?.length) {
      relics_list = filter.match_all ? relics_list.filter(rel => filter.picks.filter(e => rel.perks.includes(e)).length >= clamp(1,filter.picks.length,3)) : relics_list.filter(rel => rel.perks.some(e => filter.picks.includes(e)))
    }
    return relics_list;
  }, [filter])

  // perk_list.picks = filter.picks || []

  useEffect(() => {
    perk_list.onChange = (ps) => setFilter(p => ({ ...p, picks: ps }));
    perk_list.setFilter = setFilter;
  }, [])

  let bounceSearch = debounce((s) => setFilter(p => ({ ...p, search: s })), 400);

  const Option = ({ color }) => (
    <div className="w-[40px] rounded-xl border-[2px] border-[#777] hover:border-[#aaa] center text-[#3a8dc4] bg-[#333] text-[21px] center capitalize" style={{ color: color_code[color], borderColor: filter[color] ? '#fff' : '' }} onClick={() => setFilter({ ...filter, [color]: !filter[color] })}>
      {color}
    </div>
  )

  return (
    <div className="full relative flex flex-col py-4">
      <div className="flex border-b-[#777] items-center bg-[#111] p-2 gap-2 w-full ">
        <div className="flex items-center justify-end w-[250px] gap-2 ">
          <div className="w-[20px]"><IconSearch /> </div>
          <input ref={search_bar} type="text" placeholder={'Search'} defaultValue={filter.search || ''} onChange={(e => bounceSearch(e.target.value))} className="grow w-1 bg-[#444] p-1" />
        </div>
        <div className={`${option_class} w-[content] me-4 `} onClick={() => { search_bar.current.value = ''; setFilter({}); perk_list.setPerks([]); perk_list.current.style.display = 'none' }}> Clear </div>
        <Option color={'r'} />
        <Option color={'b'} />
        <Option color={'g'} />
        <Option color={'y'} />
        <div className="aspect-square h-full rounded-lg border-[2px] ms-4 border-[#666] hover:border-[#aaa] center text-[#ccc] bg-[#333] text-[18px]  p-1 center capitalize" style={{ borderColor: filter[1] ? '#fff' : '' }} onClick={() => setFilter({ ...filter, [1]: !filter[1] })}> 1 </div>
        <div className="aspect-square h-full rounded-lg border-[2px] border-[#666] hover:border-[#aaa] center text-[#ccc] bg-[#333] text-[18px] p-1 center capitalize" style={{ borderColor: filter[2] ? '#fff' : '' }} onClick={() => setFilter({ ...filter, [2]: !filter[2] })}> 2 </div>
        <div className="aspect-square h-full rounded-lg border-[2px] border-[#666] hover:border-[#aaa] center text-[#ccc] bg-[#333] text-[18px] p-1 center capitalize" style={{ borderColor: filter[3] ? '#fff' : '' }} onClick={() => setFilter({ ...filter, [3]: !filter[3] })}> 3 </div>
        <div className="ms-2"><IconListSearch size={34} color="#bbb" onClick={() => perk_list.current.style.display = perk_list.current.style.display == 'flex' ? 'none' : 'flex'} /></div>
        <div className="ms-auto">{relics_list.length} Relics</div>
      </div>
      <div className="home-main grow w-full overflow-y-auto, overflow-x-hidden my-4 h-1">
        <div ref={perk_list} className="absolute p-1 w-full h-[60%] z-20 bg-neutral-900 border-neutral-600 border-[1px]" style={{ display: 'none' }}>
          <div className="bg-[rgb(0,0,0,0)] bg-black, fixed w-[100vw] h-[100vh] -left-[0%] top-[0%] " onClick={() => perk_list.current.style.display = 'none'}></div>
          <PerkList _ref={perk_list} className={'z-10 bg-[#1e575e]'} searchBar={1} />
        </div>
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

const PerkList = ({ _ref, searchBar, className }) => {
  let [perk_set, setPerks] = useState(_ref.picks || [])
  let [search, setSearch] = useState('');
  let inp = useRef()
  let bounceSearch = debounce((s) => setSearch(s), 400);
  let perks_list = React.useMemo(() => perks
    .map((perk, i) => ({ text: perk, ind: i }))
    .slice(0, varsAt)
    .sort((a, b) => {
      const normalize = (s) => s.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      return normalize(a.text).localeCompare(normalize(b.text));
    }), [perks]);
  if (search) search = perks_list.filter(perk => perk.text.toLowerCase().includes(search.toLowerCase()));
  perk_set = new Set(perk_set);

  useEffect(() => {
    _ref.setPerks = setPerks;
    _ref.picks = [...perk_set];
    _ref.setSearch = setSearch;
  });

  return (
    <div className={`full flex flex-col p-1 ${className}`} >
      {searchBar ?
        <>
          <div className="flex items-center mb-2  w-full gap-2 ">
            <div className="w-[20px]"><IconSearch /> </div>
            <input ref={inp} className="w-[200px] bg-[#444] p-1" type="text" placeholder={'Search'} onChange={(e => bounceSearch(e.target.value))} />
            <IconX onClick={() => { inp.current.value = ''; setSearch(''); }} />
            <div className={`${option_class} w-[content] ms-2 `} onClick={() => { setPerks([]); _ref.onChange && _ref.onChange([]) }}> Clear </div>
            <div className={`${option_class} w-[content] ms-2 flex gap-1 pen `} onClick={e => { e.target.children[0].checked ? _ref.setFilter(p => ({ ...p, match_all: 0 })) : _ref.setFilter(p => ({ ...p, match_all: 1 })); e.target.children[0].click() }}>
              <input className="pointer-events-none" onClick={e => e.stopPropagation()} type="checkbox" name="" id="" />
              Match All
            </div>
            {perk_set.size}
          </div>
        </>
        :
        ''
      }
      <div className="grow h-1 gap-1 overflow-auto flex flex-wrap content-start ">
        {(search || perks_list).map((perk) => {
          let on = perk_set.has(perk.ind) && '#226C7D';
          return (
            <div key={perk.ind}
              className="flex p-1 h-8 items-center w-[32.9%] bg-[#3c3c3c] capitalize hover:bg-neutral-600 leading-[1]"
              style={{ fontSize: `clamp(14px, ${(window.innerWidth * 0.41) / perk.text.length}px, 20px)`, backgroundColor: on }}
              onPointerDown={(e) => {
                console.log(perk.ind, perk.text);
                on ? perk_set.delete(perk.ind) : perk_set.add(perk.ind)
                _ref.onChange && _ref.onChange([...perk_set])
                setPerks([...perk_set])
              }}
            >
              {perk.text}
            </div>
          );
        })}
      </div>

    </div>
  )
}

let build_cache = []
function Builds({ }) {
  let [character, setCharacter] = useState('');
  let [builds, setBuilds] = useState([]);
  let chars_list = Object.keys(chars).map(char => ({ ...chars[char], name: char })).slice(0, -1);
  let pl = useRef();
  pl.picks ??= build_cache
  let bounceSearch = debounce((s) => pl.setSearch(s), 400);

  return (
    <div className="full flex flex-col gap-2 py-4">
      <div className="flex cont, gap-1 border-[#666]  ">
        {chars_list.map(char => (
          <div className={`${option_class}`} style={{ borderColor: character == char.name ? 'teal' : '', color: character == char.name ? '#fff' : '' }} onClick={() => {pl.picks=[]; setBuilds([]); setCharacter(char.name) }}>
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
              <div className={`${option_class} `} onClick={() => pl.setPerks([...chars[character].recs])} >Recommended</div>
            </div>
            <div className="flex items-center mb-2 justify-end w-[200px] gap-2 ">
              <div className="w-[20px]"><IconSearch /></div>
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
          <div className={`${option_class} bg-teal-700 `} onClick={() => { if (!builds?.length) setBuilds(generateBuild(pl.picks, character)) }}>Generate Build</div>
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
            // ipcFetch('save_relic', { relic: form })
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

function Scan() {
  let relics_list = Object.values(states.relics).slice(-15)


  return (
    <div className="full flex flex-col">
      <div className="text-[24px]">Scanning in progress. Hold "9" to cancel</div>
      <div className="grow overflow-x-hidden h-1">
        <div className="h-full mt-4 w-full overflow-y-auto  flex flex-wrap-reverse center, content-end-safe gap-2">
          {relics_list.map((rel, i) => <Relic className={'w-full xl:w-[49.3%]'} relic={rel} key={i} />)}
        </div>
      </div>
    </div>
  )
}

function Config() {

  return (
    <div className="">
      <div className={`${option_class} w-[180px] h-24 border-[#dc3545] text-[#dc3545] mt-[10%],`} onClick={e => {
        states.setRelics(base_relics)
        states.relics = base_relics
        // ipcFetch('delete_all_data')
        localStorage.setItem('rb_data', JSON.stringify({ relics: base_relics }))
      }}>Delete All Data</div>
    </div>
  )
}

function App() {
  let [relics, setRelics] = useState();
  let [page, setPage] = useState(<Home />);
  let scan_card = useRef()

  const Nav = ({ to, comp, click, className }) => <div className={`w-full h-[60px] bg-[#434343] hover:bg-[#777] rounded-sm center gap-1 capitalize text-[22px] ${className}`} onClick={() => {
    click && click()
    setPage(comp)
  }}>{nav_icon[to]}{to}</div>

  states.relics = relics;
  // console.log(chars.ironeye.recs.map(e => perks[e]));

  useEffect(() => {
    console.log('use effect reran');
    states.setRelics = setRelics;
    states.setPage = setPage;
    init().then(res => {
      setRelics(res)
    })
    checkForAppUpdates()
    window.scan_card = scan_card;
  }, []);

  if (!relics) return
  return (
    <div style={{ backgroundImage: `url(/bg3.png)` }} className="full, flex flex-col  img h-[100svh] w-[100svw] bg-[#202020] ">
      <div ref={scan_card} className="fixed -left-[0%] -top-[0%] w-[100vw] h-[100vh] center bg-[rgba(0,0,0,0.6)] bg-black, z-10" style={{ display: 'none' }} onClick={e => { scan_card.current.style.display = 'none'; ipcFetch('stop_scan'); window.scanning = false }}>
        <div className="rounded-xl bg-[#444] w-[70%] h-[80%], text-[20px] p-4" onClick={e => e.stopPropagation()}>
          <div className="w-full center text-[26px]">How To Scan Relics</div>
          <div className="">- Make sure NightReign is open on your main/default monitor</div>
          <div className="">- Make sure game is fullscreen or borderless</div>
          <div className="">- Make sure game is at minimum 1920x1080 resolution, and game is same resolution as monitor</div>
          <div className="">- In the roundtable, navigate to Relic Rites</div>
          <div className="">- Press "D" to move to relics section</div>
          <div className="">- Press 4, then 2 to clear any filters</div>
          <div className="">- Sort by "Order Found", Decending</div>
          <div className="">- Press "Q" to go back</div>
          <div className="">- Make sure game is focused and are able to highlight relics with left and right arrow keys</div>
          <div className="">- Highlight relic you wish to start scan from (or top left)</div>
          <div className="">- Make sure cursor isnt blocking any text in the bottom right</div>
          <div className="">- Scans should automatically end soon after it loops back to start</div>
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
          <div className="w-[70%] h-[85%] bg-neutral-950 rounded xl p-2 col gap-y-1">
            <Nav to={'relics'} comp={<Home />} />
            <Nav to={'Builds'} comp={<Builds />} />
            <Nav to={'add'} comp={<Create />} />
            <Nav to={'Scan'} comp={<Scan relics={relics} />} click={() => { window.scanning = true; scan_card.current.style.display = 'flex'; ipcFetch('scan_rdy') }} />
            <Nav className="mt-" to={'Config'} comp={<Config />} />
            <div className="mt-auto opacity-15">v1.0.2</div>
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
