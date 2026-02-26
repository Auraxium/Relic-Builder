import React, { useEffect, useRef, useState } from "react";
import { color_muted, color_full, debounce, chars, char_icons, generateBuild2, save } from "../statics";
import { IconSearch } from "@tabler/icons-react";
import { Relic } from "./Home";
import PerkList from "./PerkList";

const option_class = 'aspect-square, h-full, rounded-lg border-[2px] ms-4, border-[#666] hover:border-[#aaa] center text-[#ccc] bg-[#333] text-[18px] p-1 center capitalize';

let build_cache = account.build_cache || [];
export default function Builds({ }) {
  let [character, setCharacter] = useState(account.cache.build_char || '');
  let [builds, setBuilds] = useState([]);
  let [bans, setBans] = useState({});
  let [type, setType] = useState(0);
  let chars_list = Object.keys(chars).map(char => ({ ...chars[char], name: char })).slice(0, -1);
  let count = useRef();
  let pl = useRef();
  // console.log(pl.picks, account.build_cache)
  pl.picks ??= account.cache[character] || [];
  pl.setPerks && pl.setPerks(account.cache[character] || [])

  let bounceSearch = debounce((s) => pl.setSearch(s), 400);

  useEffect(() => {
    pl.onChange = (arr) => {
      count.current.innerHTML = arr.length;
      pl.picks = arr;
      account.cache[character] = arr;
    };
    pl.setPerks ??= () => { };
  }, []);

  useEffect(() => {
    // if(pl.setPerks) pl.setPerks(account.cache[character] || []);
    save()
  }, [character])

  const Build = ({ build, add }) => {
    // if (!build[2]) 
    // console.log(build);
    if (!build?.rels) return <></>;
    if (build.rels.some(rel => bans[rel.id])) return <></>;
    build.cup ??= build.pos_cups_raw[0];
    let [cup, colors] = build.cup.split('$');
    colors = colors.split('#');
    colors = (build.type == 1 ? colors[0] : build.type == 2 ? colors[1] : colors.join("")).split("");
    let temp = [...build.rels];
    let relics = colors.reduce((acc, e, i) => { //sort relics to match cup order
      let ind = temp.findIndex(el => el.color == e);
      acc[i] = temp.splice(ind, 1)[0];
      return acc;
    }, []);
    // return console.log(relics)
    let name = cup + ':';
    if (name[0] == '@') name = `${character}'s ${name.slice(1)}`;

    return (
      <div className="col gap-y-2 w-full" >
        <div className="capitalize text-[20px] flex h-12 items-center">
          {name}
          <div className="flex gap-1 ms-4">
            {colors.map((c,i) => <img src={`./rel_${color_full[c]}.webp`} alt="" className="rounded-md flex border-[1px], bg-black/70 w-12 h-12 border-[#555]," style={{border: i>2 ? 'solid 1px #290073' : ''}} />)}
          </div>
        </div>
        <div className="lg:grid grid-rows-3 grid-flow-col  space-y-1, w-full h-[600px], grow gap-1 flex-wrap, ">
          {relics.map(rel => <Relic misc={{ banEvent: (id) => { console.log(id); bans[id] = !bans[id]; setBans({ ...bans }) } }} className={''} relic={rel} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="full flex flex-col gap-2 py-4">
      <div className="flex cont, gap-1 border-[#666]  ">
        {chars_list.map(char => (
          <div className={`${option_class}`} style={{ borderColor: character == char.name ? 'teal' : '', color: character == char.name ? '#fff' : '' }} onPointerDown={() => {
            pl.setPerks(account.cache[character] || [])
            account.cache.build_char = char.name;
            setBuilds([]);
            setCharacter(char.name)
          }}>
            {char_icons[char]}
            {char.name}
          </div>
        ))}
      </div>
      {builds?.length ?
        <div className="flex flex-col grow h-1 gap-2 overflow-y-auto">
          {builds.slice(0, 50).filter(e => !e.rels.some(e => bans[e])).map(b => <Build build={b} />)}
        </div>
        : character ?
          <div className="grow h-1 flex flex-col">
            <div className="flex gap-2 p-2 items-center">
              <span className="text-[22px]">Choose perks for <span className="capitalize">{character}'s</span> build:</span>
              <div className={`${option_class} `} onClick={() => pl.setPerks([...chars[character].recs])} >Recommended</div>
            </div>
            <div className="flex items-center mb-2 justify-end w-full gap-2 ">
              <div className="w-[20px]"><IconSearch /></div>
              <input type="text" placeholder={'Search'} onChange={(e => bounceSearch(e.target.value))} className="w-[150px] bg-[#444] p-1" />
              <div ref={count} className="">
                {pl.picks.length}
              </div>
              <div className={`${option_class} w-[content] ms-auto flex gap-1 pen `}
                onClick={e => { pl.setRaw(!e.target.children[0].checked); e.target.children[0].click() }}>
                <input className="pointer-events-none" defaultChecked={raw} onClick={e => e.stopPropagation()} type="checkbox" name="" id="" />
                Raw
              </div>
            </div>
            <div className="grow h-1 overflow-y-auto overflow-x-hidden">
              <PerkList _ref={pl} />
            </div>
          </div>
          :
          <></>
      }
      <div className="mt-auto p-2 h-16 w-full items-center flex bg-neutral-900,">
        <div className=""></div>
        <div className="flex ms-auto gap-2">
          <div className={`${option_class} `} onClick={() => { }}>{builds?.length ? 'Back' : 'Clear'}</div>
          <div className={`${option_class} w-[content] ms-auto flex gap-1 pen `} onClick={e => { setType(type == 1 ? 0 : 1); e.target.children[0].click() }}>
            <input className="pointer-events-none" checked={type == 1} onClick={e => e.stopPropagation()} type="checkbox" name="" id="" />
            Light Only
          </div>
          <div className={`${option_class} w-fit ms-auto flex gap-1 pen `} onClick={e => { setType(type == 2 ? 0 : 2); e.target.children[0].click() }}>
            <input className="pointer-events-none" checked={type == 2} onClick={e => e.stopPropagation()} type="checkbox" name="" id="" />
            Deep Only
          </div>
          <div className={`${option_class} bg-teal-700 `} onClick={() => { if (!builds?.length) setBuilds(generateBuild2({ picks: pl.picks, char: character, raw: pl.raw, type })); account.cache[character] = [...pl.picks]; }}>Generate Build</div>
        </div>
      </div>
    </div>
  )
}