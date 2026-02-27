import React, { useEffect, useRef, useState } from "react";
import { color_muted, color_full, debounce, chars, char_icons, generateBuild2, save } from "../statics";
import { IconSearch } from "@tabler/icons-react";
import { Relic } from "./Home";
import PerkList from "./PerkList";
import { dupe_map, effects } from "../effects_edit";

const option_class = 'aspect-square, h-full, rounded-lg border-[2px] ms-4, border-[#666] hover:border-[#aaa] center text-[#ccc] bg-[#333] text-[18px] p-1 center capitalize';



let build_cache = account.build_cache || [];
export default function Builds({ }) {
  let [character, setCharacter] = useState(account.cache.build_char || '');
  let [builds, setBuilds] = useState([]);
  let [bans, setBans] = useState({});
  let [type, setType] = useState(0);
  const [page, setPage] = useState()
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

  const Option = ({ name, text, desc }) => {

    return (
      <div className="">
        <div className="flex" style={{ borderColor: page == name ? 'teal' : '', color: page == name ? '#fff' : '' }} onClick={e => setPage(name)}>
          <div className={`${option_class} w-fit `}>{text}</div>
        </div>
        <span className="mb-2">{desc}</span>
      </div>
    )
  }

  const Build = ({ build, add }) => {
    // if (!build[2]) 
    // console.log(build);
    if (!build?.rels) return <></>;
    if (build.rels.some(rel => bans[rel.id])) return <></>;
    build.cup ??= build.pos_cups_raw[0];
    let [cup, colors, dcolors] = build.cup.split('$');
    colors = [colors, dcolors];
    colors = (build.type == 1 ? colors[0] : build.type == 2 ? colors[1] : colors.join("")).split("");
    let temp = [...build.rels].sort((a, b) => a.deep || 0 - b.deep || 0);
    let relics = colors.reduce((acc, e, i) => { //sort relics to match cup order
      let ind = temp.findIndex(el => el.color == e);
      if (ind == -1) ind = 0
      acc[i] = temp.splice(ind, 1)[0];
      return acc;
    }, []);
    let perks = build.rels.map(e => e.perks).flat().map(e => dupe_map[e] || e);
    let missing = pl.picks.filter(e => !(perks.includes(dupe_map[e]) || perks.includes(e)))
    // console.log(missing)
    // return console.log(relics)
    let name = cup.replace(/@/g, `${character}'s `) + ':';
    // if (name[0] == '@') name = `${character}'s ${name.slice(1)}`;

    return (
      <div className="col gap-y-2 w-full" >
        <div className=" flex gap-2 h-12 items-center">
          <div className="w-fit capitalize text-[18px]">
            {name}
          </div>
          <div className="flex gap-1 w-fit">
            {colors.map((c, i) => <img src={`./rel_${color_full[c]}.webp`} alt="" className="rounded-md flex border-[1px], bg-black/70 w-12 h-12 border-[#555]," style={{ border: i > 2 ? 'solid 1px #290073' : '' }} />)}
          </div>
          {missing.length ?
            <div className="text-[#dfc533] text-[12px] grow w-1 overflow-hidden flex h-full flex-wrap items-center">Missing: {missing.map(e => effects[e]).join(', ')}</div>
            : <></>}
        </div>
        <div className="lg:grid grid-rows-3 grid-flow-col  space-y-1, w-full h-[600px], grow gap-1 flex-wrap, ">
          {relics.map(rel => <Relic misc={{ banEvent: (id) => { console.log(id); bans[id] = !bans[id]; setBans({ ...bans }) } }} className={''} relic={rel} />)}
        </div>
      </div>
    )
  }

  function BuildList() {

    return (
      <div className="full col">
        <div className="flex flex-col grow h-1 gap-2 overflow-y-auto">
          {builds.slice(0, 50).filter(e => !e.rels.some(e => bans[e])).map(b => <Build build={b} />)}
        </div>
        <div className="glex gap-1 h-12 p-1">
          <div className={`${option_class} ms-auto w-fit`} onClick={e => setBuilds([])}>back</div>
        </div>
      </div>

    )
  }

  if (builds?.length) return <BuildList />;

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
      {character ?
        <div className="flex full gap-4 ">
          <div className="w-[33%] h-full col justify-around gap-1 bg-black/40">
            {/* <div className="mb-2 p-1, text-[#444]" /> */}
            <Option name={'main'} text={'Choose main perks'} desc={''} />
            <Option name={'sub'} text={'Choose sub perks'} desc={'Optionial. Choose perk useful, but not integral to your build. Used to resolve as tie breakers.'} />
            <Option name={'curse'} text={'manage curses'} desc={'Optionial. For builds using deep relics, select curses to avoid'} />
          </div>
          <div className="grow w-1 h-full flex flex-col bg-black/40">
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