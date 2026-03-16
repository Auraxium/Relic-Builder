// let _raw = false;
import React, { useEffect, useRef, useState } from "react";
import { debounce } from "../statics";
import { IconSearch, IconX } from "@tabler/icons-react";
import { VirtuosoGrid } from 'react-virtuoso'
import effects from '../effects.json'
import * as cur from '../effects_edit'

const option_class = 'aspect-square, h-full, rounded-lg border-[1px] ms-4, border-[#666] hover:border-[#aaa] center text-[#ccc] bg-[#333] text-[18px] p-1 center capitalize';

export default function PerkList({ _ref, pre_picks, searchBar, className, onChange }) {
  let [perk_state, setPerks] = useState(_ref.picks || []);
  let [search, setSearch] = useState('');
  let [raw, setRaw] = useState(window.raw);
  let [shrink, setShrink] = useState([])
  _ref.raw = raw;
  window.raw = raw;
  let inp = useRef();
  let shrink_menu = useRef()
  let bounceSearch = debounce((s) => setSearch(s), 400);
  // let perk_list = Obje
  let perks = raw ? effects : cur.effects;
  let perks_list = React.useMemo(() => Object.entries(perks)
    .map(perk => ({ text: perk[1].toLowerCase(), ind: +perk[0] }))
    .sort((a, b) => {
      const normalize = (s) => s.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      return normalize(a.text).localeCompare(normalize(b.text));
    }), [raw]);
  perks_list = perks_list.filter(perk => perk.text.includes(search.toLowerCase()));
  if (search) perks_list = perks_list.filter(perk => perk.text.toLocaleLowerCase().includes(search.toLowerCase()), [raw]);
  else perks_list = perks_list.filter(e => !cur.hide_expand.has(e.ind))
  let perk_set = new Set(perk_state || []);
  _ref.perk_set = perk_set;

  useEffect(() => {
    _ref.setPerks = setPerks;
    _ref.picks = perk_state;
    _ref.setSearch = setSearch;
    _ref.setRaw = setRaw;
    _ref.Toggle = (id) => {
      perk_set.has(id) ? perk_set.delete(id) : perk_set.add(id)
      onChange && onChange([...perk_set]);
      _ref.onChange && _ref.onChange([...perk_set]);
      console.log(perk_set);
      // console.log(perk.ind, perk.text);
      setPerks([...perk_set]);
    };
  });

  const PerkUI = ({ perk, debug, cols=3 }) => {
    // if(debug) console.log(perk)
    let id = perk;
    let name = perks[id];
    let on = perk_set.has(id) && '#226C7D';
    return (
      <div key={id}
        className="flex p-1 h-8 items-center shrink-0, w-full min-w-fit, border-[1px] border-[#333] bg-[#2b2b2b] capitalize hover:bg-neutral-600 leading-[1]"
        style={{ fontSize: `clamp(14px, ${(window.innerWidth * 0.41) / name || 1}px, 18px)`, backgroundColor: on }}
        onPointerDown={(e) => {
          // console.log(id);
          if(id < 100) return setShrink(cur.shrink_map[id] || [])
          on ? perk_set.delete(id) : perk_set.add(id);
          onChange && onChange([...perk_set]);
          _ref.onChange && _ref.onChange([...perk_set]);
          console.log(perk_set);
          // console.log(perk.ind, perk.text);
          setShrink([])
          setPerks([...perk_set]);
        }}
      >
        {name}
      </div>
    );
  }

  return (
    <div className={`${className} full flex flex-col p-1 `} >
      <div ref={shrink_menu} className="z-20 items-center justify-center fixed left-0 top-0 w-full h-full  bg-[rgba(16,12,80,0.7)] " 
      style={{display: shrink?.length ? 'flex': 'none'}}
      onClick={e => setShrink([])}
      >
        <div className="w-[30%] h-[75%] bg-black/40 p-1 col gap-1 overflow-auto">
          {shrink.map(perk => <PerkUI perk={cur.dupe_map[perk] || perk} />)}
        </div>
      </div>
      {searchBar ?
        <div className="flex items-center mb-2 w-full gap-2 ">
          <div className="w-[20px]"><IconSearch /> </div>
          <input ref={inp} className="w-[200px] bg-[#18181a] p-1" type="text" placeholder={'Search'} onChange={(e => bounceSearch(e.target.value))} />
          <IconX onClick={() => { inp.current.value = ''; setSearch(''); }} />
          <div className={`${option_class} w-[content] ms-2 `} onClick={() => { setPerks([]); _ref.onChange && _ref.onChange([]) }}>Clear</div>
          <div className={`${option_class} w-[content] ms-2 flex gap-1 pen `}
            onClick={e => { e.target.children[0].checked ? _ref.setFilter(p => ({ ...p, match_all: 0 })) : _ref.setFilter(p => ({ ...p, match_all: 1 })); e.target.children[0].click() }}>
            <input className="pointer-events-none grid-cols-2, grid-cols-3," onClick={e => e.stopPropagation()} type="checkbox" name="" id="" />
            Match All
          </div>
          {perk_set.size}
          <div className={`${option_class} w-[content] ms-auto flex gap-1 pen `}
            onClick={e => { setRaw(!e.target.children[0].checked); e.target.children[0].click() }}>
            <input className="pointer-events-none" defaultChecked={raw} onClick={e => e.stopPropagation()} type="checkbox" name="" id="" />
            Raw
          </div>
        </div>
        :
        <></>
      }

      <div className="grow h-1 gap-1 overflow-auto flex flex-wrap  content-start virt ">
        <VirtuosoGrid
          totalCount={perks_list.length}
          itemContent={(index) => <PerkUI perk={perks_list[index].ind} key={index} />}
          listClassName={`grid grid-cols-${2} xl:grid-cols-3, gap-1`}
          itemClassName="w-[32.9%], min-w-fit"
          style={{ width: '100%', height: '100%', display: 'flex' }}
        />
        {/* {perks_list.map((perk) => <PerkUI perk={perk.ind} />)} */}
      </div>

      <div className="h-[45px] flex  mt-2 border-b-[1px], [&>*]:min-w-fit gap-1 overflow-x-auto overflow-y-hidden nsb, flex-wrap, w-full content-start">
        {[...perk_set].map(e => <PerkUI perk={e} debug={1} />)}
        <hr />
      </div>
    </div >
  )
}
