import React, { useState, useEffect, useRef } from 'react';
import { color_text, color_muted, size_text, color_code, debounce, clamp, option_class } from "../statics";
import { IconSearch, IconTrash, IconPencil, IconListSearch, IconDesk, IconX } from "@tabler/icons-react";
import { VirtuosoGrid } from 'react-virtuoso'
import effects from '../effects.json'
import * as cur from '../effects_edit'
import PerkList from './PerkList'

export const Relic = ({ relic, edit, className, pl, misc }) => {
  // return
  // if(!effects[relic.effect_1]?.name) return <></>
  // console.log(relic);
  if (!relic) return <></>;
  let rel_perks = relic.perks.sort((b, a) => effects[a].length - effects[b].length)
  let rel_curses;
  if (relic.curses?.length) rel_curses = relic.curses.sort((a, b) => effects[a].length - effects[b].length)
  let name = relic.name || `${size_text[relic.size]} ${color_text[relic.color]} Scene`;
  // if(relic.deep) {
  //   name = name.split(' ');
  //   let part = name.splice(0,1);
  //   name = <div className="">
  //     <span className="text-[#a349f8]">{part}</span> {name.join(' ')}
  //   </div>
  // }

  const List = ({ ind, curse }) => {
    let perks = curse ? rel_curses : rel_perks;
    let id = perks[ind];
    let perk = effects[id];
    if (perk == 'Empty') return <></>;

    return (
      <div className="capitalize flex items-center text-[16px] text-[#c9c9c9] rounded-md w-fit h-fit hover:bg-[#555] [font-weight:100] helvetica p-[6px] leading-[90%] [border:solid_1px_#444]"
        style={{ backgroundColor: pl?.perk_set?.has(id) ? '#1d586b' : curse ? '#200059' : '#2b2b2b' }}
        onClick={e => pl && !curse && pl.Toggle(perks[ind])}
      >
        {perk || ''}
      </div>
    )
  }
  //b 13072c g 062609 r 260606 y 302902
  return (
    <div className={`border-[1px] w-full, xl:w-[46.3%], xl:h-[175px] h-[140px] border-[#777], bg-black/50 opacity-5, gap-[2px] py-1 px-2 col box-border ${className}`}
      style={{ border: `solid 1px transparent`, borderImage: `linear-gradient(145deg, ${color_code[relic.color]} 0%, ${color_muted[relic.color]} 75%, #333 100%)`, borderImageSlice: 1 }}
    >
      <div className="flex w-full h-[25%] border, items-center">
        <div className="w-[28%] h-full flex items-center gap-4">
          {/* <div className="rounded-full p-1, capitalize text-neutral-950, font-bold, h-full aspect-square center" style={{background: color_muted[relic.color]}}>{relic.color}</div> */}
          <div className="img border-s-[3px] border-y-[1px_solid_grey], h-full aspect-square box-content " style={{ backgroundImage: `url(./${relic.color}${relic.size}.png)`, borderColor: color_code[relic.color] }}></div>
          <div className="rounded-sm p-1 h-fit bg-[#444] center [border:solid_1px_#666], ">
            {/* <span className="text-neutral-950 absolute">size</span> */}
            {relic.size || relic.perks.length}
          </div>
          {relic.deep ? <div className="rounded-lg p-[6px] bg-[#290073] center box-border  ">Deep</div> : ''}
        </div>
        <div className="grow text-[clamp(28px,_2vw,_30px)], font-light, capitalize h-full, flex justify-center " style={{}}>
          <span className="rounded-sm p-1 bg-[#292929], w-fit text-[#defce6]," style={{ border: `solid 1px linear-gradient(135deg, ${color_code[relic.color]} 0%, #777 100%)` }}>
            {name}
          </span>
        </div>
        <div className="w-[28%] rel_icons h-full ms-auto flex flex-row-reverse gap-1   ">
          {/* <IconDesk onClick={() => account.workshop[relic.id] = {}} /> */}
          <IconPencil onClick={() => console.log(relic)} />
          <IconTrash onClick={() => { if (misc?.banEvent) misc.banEvent(relic.id) }} />
          <IconDesk onClick={() => account.workshop[relic.id] = {}} />
        </div>
      </div>
      <div className="flex  w-full mt-1 flex-wrap content-start items-start gap-1 overflow-hidden nsb">
        <List ind={0} />
        <List ind={1} />
        <List ind={2} />
        {rel_curses ?
          <>
            <List ind={0} curse={1} />
            <List ind={1} curse={1} />
            <List ind={2} curse={1} />
          </>
          :
          <></>
        }
      </div>
    </div>
  );
};

let sizes = '123'.split('');
let cols = 'rbyg'.split('');
export default function Home({ relics = window.account?.relics || [] }) {
  let [filter, setFilter] = useState({})
  let search_bar = useRef()
  let perk_list = useRef()

  // let relics_list = window.account?.relics || relics;
  let relics_list = React.useMemo(() => Object.values(relics).reverse(), [relics])
  relics_list = React.useMemo(() => {
    if (filter['deep']) relics_list = relics_list.filter(rel => rel.deep);
    if (cols.some(c => filter[c])) relics_list = relics_list.filter(rel => filter[rel.color]);
    if (sizes.some(c => filter[+c])) relics_list = relics_list.filter(rel => filter[rel.size])
    if ('search' in filter) relics_list = relics_list.filter(rel => rel.perks.map(el => effects[el]).join(' ').toLowerCase().includes(filter.search))
    if (filter.picks?.length) {
      // console.log(filter.picks, relics_list[0].perks)
      // relics_list = relics_list.filter(rel => rel.perks.some(e => filter.picks.includes(e)));
      relics_list = filter.match_all ? relics_list.filter(rel => filter.picks.filter(e => rel.perks.includes(e)).length >= clamp(1, filter.picks.length, 3)) : relics_list.filter(rel => rel.perks.some(e => filter.picks.includes(e) || filter.picks.includes(cur.dupe_map[e])));
    }
    return relics_list;
  }, [filter])

  // perk_list.picks = filter.picks || []
  // console.log(filter)

  useEffect(() => {
    perk_list.onChange = (ps) => setFilter(p => ({ ...p, picks: ps }));
    perk_list.setFilter = setFilter;
  }, [])

  let bounceSearch = debounce((s) => setFilter(p => ({ ...p, search: s })), 400);

  const Option = ({ color, className, style = {} }) => (
    <div className={`${className} w-[40px] h-fit rounded-xl border-[2px] border-[#777] hover:border-[#aaa] center text-[#3a8dc4] bg-[#333] text-[21px] center capitalize `} style={{ color: color_code[color], borderColor: filter[color] ? '#fff' : '', ...style }} onClick={() => setFilter({ ...filter, [color]: !filter[color] })}>
      {color}
    </div>
  )

  return (
    <div className="full relative space-x-[1px] gap-x-[1px] flex flex-col py-4,">
      <div className="flex relative [border:solid_1px_#555] items-center bg-[#111] p-1 gap-2 w-full ">
        <div ref={perk_list} className="absolute p-1 w-[100%] h-[60vh] z-20 center bg-neutral-900 border-neutral-600 border-[1px] -left-[18px], top-[60px]" style={{ display: 'none' }}>
          <div className="bg-[rgb(0,0,0,.7)] bg-black, fixed w-[100vw] h-[100vh] -left-[0%] top-[0%] " onClick={() => perk_list.current.style.display = 'none'}></div>
          <PerkList _ref={perk_list} className={'z-10  bg-black/40'} searchBar={1} />
        </div>
        <div className="ms-2 p-1 bg-[#2b2b2b] rounded border flex items-center" onClick={() => perk_list.current.style.display = perk_list.current.style.display == 'flex' ? 'none' : 'flex'}><IconListSearch size={34} color="#bbb" />Perks</div>
        <Option color={'r'} />
        <Option color={'b'} />
        <Option color={'g'} />
        <Option color={'y'} />
        <div className={`${option_class} ms-2 `} style={{ borderColor: filter[1] ? '#fff' : '' }} onClick={() => setFilter({ ...filter, [1]: !filter[1] })}> 1 </div>
        <div className={`${option_class}  `} style={{ borderColor: filter[2] ? '#fff' : '' }} onClick={() => setFilter({ ...filter, [2]: !filter[2] })}> 2 </div>
        <div className={`${option_class}  `} style={{ borderColor: filter[3] ? '#fff' : '' }} onClick={() => setFilter({ ...filter, [3]: !filter[3] })}> 3 </div>
        <div className={`${option_class} ms-2`} style={{ borderColor: filter[1] ? '#fff' : '' }} onClick={() => setFilter({ ...filter, ['deep']: !filter['deep'] })}> deep </div>
        <div className="flex items-center justify-end w-[250px] gap-2 ">
          <div className="w-[20px]"><IconSearch /> </div>
          <input ref={search_bar} type="text" placeholder={'Search'} defaultValue={filter.search || ''} onChange={(e => bounceSearch(e.target.value))} className="grow w-1 bg-[#444] p-1" />
          <IconX onClick={e => search_bar.current.value = ''} />
        </div>
        <div className={`${option_class} w-[content] me-4 `} onClick={() => { search_bar.current.value = ''; setFilter({}); perk_list.setPerks([]); perk_list.current.style.display = 'none' }}> Clear </div>

        <div className="ms-auto">{relics_list.length} Relics</div>
      </div>
      <div className="home-main relative grow w-full overflow-y-auto, overflow-x-hidden mt-4 mb-1 h-1">
        <VirtuosoGrid
          totalCount={relics_list.length}
          itemContent={(index) => <Relic relic={relics_list[index]} edit={1} key={index} pl={perk_list} />}
          listClassName="grid grid-cols-1 xl:grid-cols-2 gap-2 w-full p-2"
          itemClassName="w-full"
          style={{ height: '100%', overflowY: 'auto' }}
        />
      </div>
    </div>
  )
}