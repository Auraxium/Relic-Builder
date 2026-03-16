import React, { useEffect, useRef, useState } from "react";
import { color_muted, color_full, debounce, chars, char_icons, generateBuild2, save, option_class, } from "../statics";
import { IconSearch } from "@tabler/icons-react";
import { Relic } from "./Home";
import PerkList from "./PerkList";
import { dupe_map, effects, default_caster_perks, default_melee_perks, curses } from "../effects_edit";
import raw_effects from '../effects.json'

let build_cache = account.build_cache || [];
export default function Builds({ }) {
  let [character, setCharacter] = useState(account.cache.build_char || '');
  let [builds, setBuilds] = useState([]);
  let [bans, setBans] = useState({});
  let [type, setType] = useState(0);
  const [page, setPage] = useState('main')
  let chars_list = Object.keys(chars).map(char => ({ ...chars[char], name: char })).slice(0, -1);
  let count = useRef();
  let main_pl = useRef();
  let sub_pl = useRef();
  let curse_pl = useRef();
  let page_defaults = {
    main: <></>,
    sub: <>
      <div className={`${option_class}  `} onClick={e => { account.cache.build_subs = default_melee_perks; sub_pl.setPerks(default_melee_perks) }}>Default Melee</div>
      <div className={`${option_class}  `} onClick={e => { account.cache.build_subs = default_caster_perks; sub_pl.setPerks(default_caster_perks) }}>Default Caster</div>
    </>,
    curse: <></>,
  }
  let pl_map = {
    main: main_pl,
    sub: sub_pl,
    curse: curse_pl,
  }
  main_pl.picks ??= account.cache[character] || [];
  sub_pl.picks ??= account.cache.build_subs || [];
  curse_pl.picks ??= account.cache.build_curses || [];
  main_pl.setPerks && main_pl.setPerks(account.cache[character] || [])
  curse_pl.perkSet ??= new Set(curse_pl.picks || []);

  let bounceSearch = debounce((s) => main_pl.setSearch(s), 400);

  useEffect(() => {
    main_pl.onChange = (arr) => {
      count.current.innerHTML = arr.length;
      main_pl.picks = arr;
      account.cache[character] = arr;
    };
    main_pl.setPerks ??= () => { };
    curse_pl.setPerks = () => {
      curse_pl.perkSet.clear();
      curse_pl.picks = [];
      setBans({...bans})
    };

  }, []);

  useEffect(() => {
    // if(pl.setPerks) pl.setPerks(account.cache[character] || []);
    save()
  }, [character])

  const Option = ({ name, text, desc }) => {

    return (
      <div className="">
        <div className="flex" onClick={e => setPage(name)}>
          <div className={`${option_class} w-fit `} style={{ borderColor: page == name ? 'teal' : '', color: page == name ? '#fff' : '' }}>{text}</div>
        </div>
        <span className="mb-2 text-[#ccc],">{desc}</span>
      </div>
    )
  }

  const Build = ({ build, add, i }) => {
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
    let missing = main_pl.picks.filter(e => !(perks.includes(dupe_map[e]) || perks.includes(e)))
    // console.log(missing)
    // return console.log(relics)
    let name = cup.replace(/@/g, `${character}'s `) + ':';
    // if (name[0] == '@') name = `${character}'s ${name.slice(1)}`;

    return (
      <div className="col gap-y-2 w-full" >
        <div className=" flex gap-2 h-12 bg-black/45 items-center">
          <div className="w-fit capitalize text-[18px] flex">
            <span className="me-1 italic, text-[#888]">#{i + 1}</span>
            {name}
          </div>
          <div className="flex gap-1 w-fit">
            {colors.map((c, i) => <img src={`./rel_${color_full[c]}.webp`} alt="" className="rounded-md flex border-[1px], bg-black/70 w-12 h-12 border-[#555]," style={{ border: i > 2 ? 'solid 1px #290073' : '' }} />)}
          </div>
          <div className="w-fit">{build.score.toFixed(2)}</div>
          {missing.length ?
            <div className="text-[#dfc533] text-[12px] grow w-1 overflow-hidden flex h-full flex-wrap items-center">Missing: {missing.map(e => effects[e]).join(', ')}</div>
            : <></>}
        </div>
        <div className="lg:grid grid-rows-3 grid-flow-col  space-y-1, w-full h-[600px], grow gap-1 flex-wrap, ">
          {relics.map(rel => <Relic misc={{ banEvent: (id) => { console.log(id); bans[id] = !bans[id]; setBans({ ...bans }) } }} className={'h-fit,'} innerClassName={'overflow-y-auto, nsb'} relic={rel} />)}
        </div>
      </div>
    )
  }

  function BuildList() {
    const [all, setAll] = useState(account.build_all);
    account.build_all = all;
    let filt;
    let caps = {};
    if (!all) {
      filt = builds.filter(build => {
        caps[build.missing.join()] ??= 0;
        return ++caps[build.missing.join()] < 4;
      })
    } else filt = builds.slice(0, 100);

    return (
      <div className="full col">
        <div className="flex flex-col grow h-1 gap-2 overflow-y-auto">
          {filt.filter(e => !e.rels.some(e => bans[e])).map((b, i) => <Build build={b} i={i} />)}
        </div>
        <div className="flex gap-1 h-12 p-1">
          <div className={`${option_class} w-[content] ms-auto flex gap-1 pen `}
            onClick={e => setAll(!all)}>
            Show: {all ? 'All' : 'Best'}
          </div>
          <div className={`${option_class} ms-auto, w-fit`} onClick={e => setBuilds([])}>back</div>
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
            account.cache[character] = [...main_pl.picks];
            account.cache.build_subs = [...sub_pl.picks];
            account.cache.build_curses = [...curse_pl.picks];
            main_pl.setPerks(account.cache[character] || []);
            account.cache.build_char = char.name;
            setBuilds([]);
            setCharacter(char.name);
            setPage('main');
          }}>
            {char_icons[char]}
            {char.name}
          </div>
        ))}
      </div>
      {character ?
        <div className="flex full gap-4 ">
          <div className="w-[33%] h-full col justify-evenly gap- p-1 bg-black/40">
            {/* <div className="mb-2 p-1, text-[#444]" /> */}
            <Option name={'main'} text={'Choose main perks'} desc={`Choose up to ${type ? '9' : '18'} perks for your build.`} />
            <Option name={'sub'} text={'Choose sub perks'} desc={'Optional. Choose perk useful, but not integral to your build. Used to resolve as tie breakers.'} />
            {/* <Option name={'curse'} text={'Manage curses'} desc={'Optional. For builds using deep relics, select curses to avoid.'} /> */}
          </div>
          <div className="grow w-1 h-full flex flex-col bg-black/40">
            <div className="flex items-center mb-2, p-1 justify-end, w-full gap-2 ">
              <div className="w-[20px]"><IconSearch /></div>
              <input type="text" placeholder={'Search'} onChange={(e => bounceSearch(e.target.value))} className="w-[150px] bg-[#444] p-1" />
              <div ref={count} className="">
                {main_pl.picks.length}
              </div>
              {page_defaults[page] || <></>}
              <div className={`${option_class} w-[content] ms-auto flex gap-1 pen `}
                onClick={e => { pl_map[page].picks = []; pl_map[page].setPerks([]); if(pl_map[page].onChange) pl_map[page].onChange([]) }}>
                Clear
              </div>
            </div>
            <div className="grow h-1 overflow-y-auto overflow-x-hidden">
              <PerkList _ref={main_pl} className={page == 'main' ? '' : 'hidden'} />
              <PerkList _ref={sub_pl} className={page == 'sub' ? '' : 'hidden'} onChange={arr => { account.cache.build_subs = arr }} />
              <div className="full col p-1 gap-1 text-[14px]  " style={{ display: page === 'curse' ? 'flex' : 'none' }}>
                {curses.map(e => <div key={Math.random()} className="h-8 p-1 border-[1px] border-[#333] pen bg-[#2b2b2b] capitalize hover:bg-neutral-600 leading-[1]"
                  style={{backgroundColor: curse_pl.perkSet.has(e) ? '#290073' : ''}}
                  onClick={el => {
                    curse_pl.perkSet.has(e) ? curse_pl.perkSet.delete(e) : curse_pl.perkSet.add(e);
                    el.target.style.backgroundColor = curse_pl.perkSet.has(e) ? '#290073' : '';
                    curse_pl.picks = [...curse_pl.perkSet];
                    account.cache.build_curses = [...curse_pl.picks]
                  }}
                >
                  {raw_effects[e]}
                </div>)}
              </div>
              {/* <PerkList _ref={curse_pl} className={page == 'curse' ? '' : 'hidden'} onChange={arr => { account.cache.build_curses = arr }} color={'#290073'} /> */}
            </div>
          </div>
        </div>
        :
        <></>
      }
      <div className="mt-auto p-2 h-16 w-full items-center flex bg-neutral-900,">
        <div className=""></div>
        <div className="flex ms-auto gap-2">
          {/* <div className={`${option_class} `} onClick={() => { }}>{builds?.length ? 'Back' : 'Clear'}</div> */}
          <div className={`${option_class} w-[content] ms-auto flex gap-1 pen `} onClick={e => { setType(type == 1 ? 0 : 1); e.target.children[0].click() }}>
            <input className="pointer-events-none" checked={type == 1} onClick={e => e.stopPropagation()} type="checkbox" name="" id="" />
            Light Only
          </div>
          <div className={`${option_class} w-fit ms-auto flex gap-1 pen `} onClick={e => { setType(type == 2 ? 0 : 2); e.target.children[0].click() }}>
            <input className="pointer-events-none" checked={type == 2} onClick={e => e.stopPropagation()} type="checkbox" name="" id="" />
            Deep Only
          </div>
          <div className={`${option_class} bg-teal-700 `} onClick={() => {
            account.cache[character] = [...main_pl.picks];
            account.cache.build_subs = [...sub_pl.picks];
            account.cache.build_curses = [...curse_pl.picks];
            save();
            setBuilds(generateBuild2({ picks: main_pl.picks, subs: sub_pl.picks, curses: curse_pl.picks, char: character, raw: main_pl.raw, type }))
          }}>Generate Build</div>
        </div>
      </div>
    </div>
  )
}