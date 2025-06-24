import { Command } from "@tauri-apps/plugin-shell";
import { isTauri } from "@tauri-apps/api/core";
export let states = {};

export let sizes = { delicate: 1, polished: 2, grand: 3 };
export let colors = { tranquil: "g", burning: "r", luminous: "y", drizzly: "b" };
export let size_text = { 1: "Delicate", 2: "Polished", 3: "Grand" };
export let color_text = { g: "Tranquil", r: "Burning", y: "Luminous", b: "Drizzly" };
export let color_code = { g: "#6fb139", r: "#e33727", y: "#dead31", b: "#3a8dc4" };
export let color_muted = { b: "#13072c", g: "#041a06", r: "#260606", y: "#262001" };
// export let color_code = { g: "#53802d", r: "#A22A1F", y: "#c1972d", b: "#286187" };

export let perks = [];
// window.perks = perksk
export let perks_list = [];
export let varsAt;

export let chars = {
  duchess: {
    cups: ["@Urn$rbb", "@Goblet$yyg", "@Chalice$byw"],
    recs: [58, 57, 56, 71, 72, 73, 80, 301, 330, 155, 184, 209, 210, 214, 269, 268, 267, 285, 284, 283, 297, 296, 295, 299],
  },
  universal: {
    cups: ["Sacred Erdtree Grail$yyy", "Spirit Shelter Grail$ggg", "Giant's Cradle Grail$bbb"],
  },
};

window.tasks ??= {};
let events = {
  scan: (e) =>
    states.setRelics((p) => {
      console.log(e.relic);
      return { ...p, [e.relic.id]: e.relic };
    }),
  scan_finished: (e) => save(),
};

export function findBuild(picks, char) {
  let char_str = char;
  char = chars[char];
  picks ??= char.recs 
  picks = new Set([...char.recs]);
  let colors = { r: [], b: [], g: [], y: [] };
  let relics = Object.values(states.relics).filter(rel => { //score and filter
    let score = rel.perks.reduce((acc, e) => acc + picks.has(e), 0);
    if (score <= 0) return false;
    rel.score = score;
    return true;
  });
  relics.forEach((rel,i) => colors[rel.color].push(i)) //split color

  let top = []
  let best = [-999, [], '', ''];
  for (let cup_str of [...char.cups, ...chars.universal.cups]) {
    let cup_pool = cup_str.split('$').at(-1).split('').map(c => {
      if(colors[c]?.length) return colors[c] 
      if(!colors[c]) return relics.map((e,i)=>i) //if white
      colors[c].push(relics.length) //empty color
      let any = Object.values(states.relics).find(rel => rel.color == c)
      relics.push({...any, score: 0}) 
      return colors[c];
    }) //colors map, inds relica
    let perm = Array(cup_pool.length).fill(0);
    let size_map = cup_pool.map(c => c.length);

    const rotate = (s = 0) => {
      if (s > perm.length - 1) {
        return (perm = Array(size_map.length).fill(0));
      }
      if (++perm[s] >= size_map[s]) {
        perm[s] = 0;
        rotate(s + 1);
      }
    };

    for (let i = 0; i < size_map.reduce((acc, e) => e*acc, 1); i++) {
      let rels = cup_pool.map((c, i) => c[perm[i]]); //inds of relics
      if (rels.length !== new Set(rels).size) {
        rotate(0);
        continue;
      }
      rels = rels.map(e => relics[e]) //whole not ids
      let score = rels.reduce((acc, e) => acc + e.score, 0);
      let combine = rels.reduce((acc, e) => { acc.push(...e.perks); return acc}, []) // check for dups
      score -= (combine.length - new Set(combine).size) * 1.5; //todo: make bad_dupes list
      
      // if ((score > best[0]) || (score == best[0] && cup_str != top[0][2])) {
      //   best = [score, [...rels], cup_str, char_str];
      //   top.unshift([...best])
      // } else if(rels.length*2 != new Set([...rels.map(e => e.id), ...top[0][1].map(e => e.id)]).size) {
      //   best = [score, [...rels], cup_str, char_str];
      //   top.unshift([...best])
      // }

      if ((score > best[0])) {
        best = [score, [...rels], cup_str, char_str];
        top.unshift([...best])
      } 
      rotate(0)
    }
  }

  console.log(top.slice(0,6));
  return top;
}

export async function init() {
  while (!window.pyspawn) await delay(400);
  let res = await ipcFetch("load");
  perks = res.perks;
  let hold;
  let holds = {};
  varsAt = perks.length;
  perks.forEach((e, i) => {
    if (hold && hold == e.slice(0, -3)) return;
    else hold = 0;
    if (e.at(-2) == "+") {
      hold = e.slice(0, -3).trim();
      holds[hold] = i;
      perks.push(hold + " +X");
    }
  });
  // perks_list = perks
  //   .map((perk, i, arr) => {
  //     let j = { text: perk, ind: i }
  //     let slice = perk.slice(0,-3)99
  //     if(perk.at(-1)=='X') {
  //       j.vars = holds[slice]
  //       varsAt ??= i
  //     }
  //     if(perks[j.vars-1] == slice) {9999
  //       j.has0 = 1;
  //       remove.add(j.vars-1)
  //     }
  //     return j
  //   })
  //   .filter((e,i) => !remove.has(i) && isNaN(+e.text.at(-1)))
  //   .sort((a, b) => {
  //     const normalize = (s) => s.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();l
  //     return normalize(a.text).localeCompare(normalize(b.text));9
  //   });
window.perks = perks
  return res.relics || {};
}

async function runCommand() {
  if (window.pyspawn?.write) return window.pyspawn;
  if (window.pyspawn === 0) {
    while (!window.pyspawn) await delay(400);
    return window.pyspawn;
  }
  window.pyspawn = 0;
  if (!window.command) {
    window.command = new Command("py-spawn", ["py", "main.py"]);
    // command = new Command("exe-spawn", ["prod"]);

    window.command.stdout.on("data", (line) => {
      if (line[0] != "{") return console.log("[stout]", line);
      // console.log(line)
      let data;
      try {
        data = JSON.parse(line);
      } catch (e) {}
      if (!data) return console.log("[stout]", line);
      if (events[data.event]) events[data.event](data);
      if (tasks[data.uid]) {
        if (data.err) tasks[data.uid].n(data.err);
        else tasks[data.uid].y(data.res);
        delete tasks[data.uid];
      }
      if (!data.uid && !data.event) return console.log(data);
    });

    window.command.stderr.on("data", (line) => {
      console.error("[stderr]", line);
    });

    window.command.on("close", (data) => {
      console.log("Process exited with code", data.code);
      window.pyspawn = null;
    });
  }

  window.pyspawn?.kill && window.pyspawn.kill();
  window.pyspawn = null;
  window.pyspawn = await window.command.spawn();
  console.log("new command", window.command, window.pyspawn);
  return window.pyspawn;
}

if (!window.pyspawn?.write) runCommand();

let c = 1;
export async function ipcFetch(p, j = {}, nr) {
  if (typeof (window.pyspawn?.write || {}) != "function") await runCommand();
  j.port ??= p;
  if (nr) return window.pyspawn.write(JSON.stringify(j) + "\n");
  j.uid = c++;
  let k = new Promise((y, n) => {
    tasks[j.uid] = { y, n };
  });
  
  window.pyspawn.write(JSON.stringify(j) + "\n");
  return k;
}

export function delay(secs = 1000) {
  return new Promise((y, n) => setTimeout(() => y(""), secs));
}

export function clamp(min, val, max) {
  return Math.max(min, Math.min(val, max));
}

export const debounce = function (cb, delay = 400) {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb(...args);
    }, delay);
  };
};

export async function save() {
  ipcFetch("save", { relics: states.relics }).then(console.log);
}

window.addEventListener("beforeunload", (e) => {
  console.log("removing local command", has_command);
  localStorage.removeItem("command");
  window.command.stdout.removeAllListeners("data");
  window.command.stderr.removeAllListeners("data");
  window.pyspawn.kill();
  window.pyspawn = null;
});

// export let base_relics = {
//   old_pocketwatch: {

//   },
//   besmirched_frame:999
//   slate_whetstone:
//   silver_tear:
//   the_wylders_earring:
//   stone_stake:
//   third_volume:
//   witchs_brooch:
//   cracked_sealing_wax:
//   edge_of_order:
//   golden_dew:
//   crown_medal:
//   blessed_iron_coin:
//   torn_braided_cord:
//   black_claw_necklace:
//   small_makeup_brush:
//   old_portrait:
//   vestige_of_night:
//   bone_like_stone:ss99999
//   blessed_flowers:
//   golden_sprout: {

//   },
//   night_of_the_beast:
//   night_of_the_baron:
//   night_of_the_wise:
//   night_of_the_demon:
//   night_of_the_champion:
//   night_of_the_miasma:
//   night_of_the_fathom:
//   night_of_the_lord:
// }
