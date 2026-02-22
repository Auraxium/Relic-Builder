import React, { useState, useEffect, useRef } from 'react';
import { color_text, size_text, color_code, debounce, clamp } from "../statics";
import { IconSearch, IconTrash, IconPencil, IconListSearch, IconDesk } from "@tabler/icons-react";
import { VirtuosoGrid } from 'react-virtuoso'
import effects from '../effects.json'
import * as cur from '../effects_edit'
import PerkList from './PerkList'

const option_class = 'aspect-square, h-full, rounded-lg border-[2px] ms-4, border-[#666] hover:border-[#aaa] center text-[#ccc] bg-[#333] text-[18px] p-1 center capitalize';

export const Relic = ({ relic, edit, className, pl, misc }) => {
  // return
  // if(!effects[relic.effect_1]?.name) return <></>
  // console.log(relic);
  if (!relic) return <></>;

  const List = ({ ind, curse }) => {
    let perks = curse ? relic.curses : relic.perks;
    let id = perks[ind];
    let perk = effects[id];
    if (perk == 'Empty') return <></>;

    return (
      <div className="capitalize flex items-center text-nowrap,  gap-[2px] rounded-md w-fit p-1  h-[33.333%], leading-[1.3]"
        style={{ fontSize: `clamp(14px, calc(1vw - ${(perk.length) * .001}px), 17px)`, backgroundColor: pl?.perk_set?.has(id) ? '#226C7D' : curse ? '#2d007a' : '#444' }}
        onClick={e => pl && !curse && pl.Add(perks[ind])}
      >
        {perk || ''}
      </div>
    )
  }
  //b 13072c g 062609 r 260606 y 302902
  return (
    <div className={`border-[1px] w-full, xl:w-[46.3%], h-[180px] min-h-[180px] max-h-[180px] border-[#777] bg-neutral-950 gap-[2px] py-1 px-2 col box-border ${className}`} style={{}} >
      <div className="flex w-full h-[24%] border, items-center">
        <div className="w-[15%] h-full">
          <div className="img border-s-[3px] border-y-[1px_solid_grey], h-full aspect-square box-content " style={{ backgroundImage: `url(./${relic.color}${relic.size}.png)`, borderColor: color_code[relic.color] }}></div>
        </div>
        <div className="text-[clamp(28px,_2vw,_30px)], font-light, capitalize hightop, h-full, grow flex justify-center ">{relic.name || `${size_text[relic.size]} ${color_text[relic.color]} Scene`}</div>
        <div className="ms-auto flex gap-2 w-[15%] justify-end ">
          <IconPencil onClick={() => console.log(relic)} />
          <IconTrash onClick={() => { if (misc?.banEvent) misc.banEvent(relic.id) }} />
          <IconDesk onClick={() => account.workshop[relic.id] = {}} />
        </div>
      </div>
      <div className="flex flex-col w-full h-[80%] mt-1 flex-wrap gap-1 relative -top-[6px],">
        <List ind={0} />
        <List ind={1} />
        <List ind={2} />
        {relic.curses?.length ?
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

  const Option = ({ color }) => (
    <div className="w-[40px] h-fit rounded-xl border-[2px] border-[#777] hover:border-[#aaa] center text-[#3a8dc4] bg-[#333] text-[21px] center capitalize" style={{ color: color_code[color], borderColor: filter[color] ? '#fff' : '' }} onClick={() => setFilter({ ...filter, [color]: !filter[color] })}>
      {color}
    </div>
  )

  return (
    <div className="full relative space-x-[1px] gap-x-[1px] flex flex-col py-4,">
      <div className="flex relative border-b-[#777] items-center bg-[#111] p-1 gap-2 w-full ">
        <div ref={perk_list} className="absolute p-1 w-[102%] h-[60vh] z-20 bg-neutral-900 border-neutral-600 border-[1px] -top-[0px] -left-[18px] top-[60px]" style={{ display: 'none' }}>
          <div className="bg-[rgb(0,0,0,0)] bg-black, fixed w-[100vw] h-[100vh] -left-[0%] top-[0%] " onClick={() => perk_list.current.style.display = 'none'}></div>
          <PerkList _ref={perk_list} className={'z-10 bg-[#07063a]'} searchBar={1} />
        </div>
        <div className="flex items-center justify-end w-[250px] gap-2 ">
          <div className="w-[20px]"><IconSearch /> </div>
          <input ref={search_bar} type="text" placeholder={'Search'} defaultValue={filter.search || ''} onChange={(e => bounceSearch(e.target.value))} className="grow w-1 bg-[#444] p-1" />
        </div>
        <div className={`${option_class} w-[content] me-4 `} onClick={() => { search_bar.current.value = ''; setFilter({}); perk_list.setPerks([]); perk_list.current.style.display = 'none' }}> Clear </div>
        <Option color={'r'} />
        <Option color={'b'} />
        <Option color={'g'} />
        <Option color={'y'} />
        <div className="aspect-square, h-full rounded-lg border-[2px] ms-4 border-[#666] hover:border-[#aaa] center text-[#ccc] bg-[#333] text-[18px] p-1 center capitalize" style={{ borderColor: filter[1] ? '#fff' : '' }} onClick={() => setFilter({ ...filter, ['deep']: !filter['deep'] })}> deep </div>
        <div className="aspect-square, h-full rounded-lg border-[2px] ms-4 border-[#666] hover:border-[#aaa] center text-[#ccc] bg-[#333] text-[18px] p-1 center capitalize" style={{ borderColor: filter[1] ? '#fff' : '' }} onClick={() => setFilter({ ...filter, [1]: !filter[1] })}> 1 </div>
        <div className="aspect-square, h-full rounded-lg border-[2px] border-[#666] hover:border-[#aaa] center text-[#ccc] bg-[#333] text-[18px] p-1 center capitalize" style={{ borderColor: filter[2] ? '#fff' : '' }} onClick={() => setFilter({ ...filter, [2]: !filter[2] })}> 2 </div>
        <div className="aspect-square, h-full rounded-lg border-[2px] border-[#666] hover:border-[#aaa] center text-[#ccc] bg-[#333] text-[18px] p-1 center capitalize" style={{ borderColor: filter[3] ? '#fff' : '' }} onClick={() => setFilter({ ...filter, [3]: !filter[3] })}> 3 </div>
        <div className="ms-2"><IconListSearch size={34} color="#bbb" onClick={() => perk_list.current.style.display = perk_list.current.style.display == 'flex' ? 'none' : 'flex'} /></div>
        <div className="ms-auto">{relics_list.length} Relics</div>
      </div>
      <div className="home-main relative grow w-full overflow-y-auto, overflow-x-hidden my-2 h-1">
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