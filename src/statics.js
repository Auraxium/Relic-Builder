import { Command } from "@tauri-apps/plugin-shell";
import { isTauri } from "@tauri-apps/api/core";
import { resolveResource } from "@tauri-apps/api/path";
import { check } from "@tauri-apps/plugin-updater"; // Correct import for Tauri 2.0
import { ask, message } from "@tauri-apps/plugin-dialog"; // If you're using dialogs, also from plugin-dialog
import { relaunch } from "@tauri-apps/plugin-process";
import effects from './effects.json'
import { dupe_map } from './effects_edit'
import { compareTwoStrings, findBestMatch } from "string-similarity";

export function CompareStrings(s1, s2) {
  if (!s1 || !s2) return //console.log('?');
  s1 = s1
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  s2 = s2
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  let [short, long] = s1.length < s2.length ? [s1, s2] : [s2, s1];
  let [sl, ll] = [short.length, long.length];
  let score = compareTwoStrings(short, long) * ((ll - sl) / (sl + ll) + 1); // replace 1: Math.sqrt(sl / ll)
  let inc = long.indexOf(short)
  if (match && inc != -1) score += 1;
  score += ((ll - inc) * 0.005)

  if (debug && score > debug) console.log(`${short} | ${long}`, score);
  return score;
}

// let nm = {}
// Object.keys(effects).forEach(e => {
//   nm[e] = effects[e].name
// })
// console.log(nm)

export let states = {};
export let account = JSON.parse(localStorage.getItem('account') || "{}");
account.cache ??= {}
window.account = account;
console.log(`account size is ${(Math.round(JSON.stringify(account).length / (1024 * 1024) * 100) / 100)}mb`, account);

export let sizes = { delicate: 1, polished: 2, grand: 3 };
export let colors = { tranquil: "g", burning: "r", luminous: "y", drizzly: "b" };
export let size_text = { 1: "Delicate", 2: "Polished", 3: "Grand" };
export let color_text = { g: "Tranquil", r: "Burning", y: "Luminous", b: "Drizzly" };
export let color_code = { g: "#6fb139", r: "#e33727", y: "#dead31", b: "#3a8dc4" };
export let color_muted = { b: "#250d59", g: "#0c4d11", r: "#610f0f", y: "#5d4e03", w: "#aaa" };
// export let color_muted = { b: "#13072c", g: "#041a06", r: "#260606", y: "#262001", w: '#aaa' };
// export let color_code = { g: "#53802d", r: "#A22A1F", y: "#c1972d", b: "#286187" };

window.scanning = 0
let home_list;

export let perks = Object.keys(effects);
// window.perks = perksk
export let perks_list = [];
export let varsAt;
export let char_augs = new Set()
window.plus_map = {};
let plus_map = {
  "7000000": 2,
  "7000001": 1,
  "7000002": 0,
  "7000100": 2,
  "7000101": 1,
  "7000102": 0,
  "7000200": 2,
  "7000201": 1,
  "7000202": 0,
  "7000300": 2,
  "7000301": 1,
  "7000302": 0,
  "7000400": 2,
  "7000401": 1,
  "7000402": 0,
  "7000500": 2,
  "7000501": 1,
  "7000502": 0,
  "7000600": 2,
  "7000601": 1,
  "7000602": 0,
  "7000700": 2,
  "7000701": 1,
  "7000702": 0,
  "7000800": 2,
  "7000801": 1,
  "7000802": 0,
  "7000900": 2,
  "7000901": 1,
  "7000902": 0,
  "7001000": 2,
  "7001001": 1,
  "7001002": 0,
  "7001400": 3,
  "7001401": 2,
  "7001402": 1,
  "7001403": 0,
  "7001409": 2,
  "7001500": 1,
  "7001501": 0,
  "7001502": 0,
}
// ((plus_map[e] || 0) / 90 + 1)

export let chars = {
  wylder: {
    cups: ["@Urn$rrb#rrb", "@Goblet$ygg#ygg", "@Chalice$ryw#rbg", "Soot Covered Urn$bby#bby", "Decrepit unc's Goblet$bgy#bgy", "@Forgotten un's Goblet$ygb#rgw"],
    recs: [],
    augs: [7033200, 7010500, 7032400, 7030500, 6500000, 7020000, 7033000, 6640100, 7032300, 7031400, 6640000]
  },
  guardian: {
    cups: ["@Urn$ryy", "@Goblet$bbg", "@Chalice$byw", "Soot Covered Urn$rgg"],
    recs: [],
  },
  ironeye: {
    cups: ["@Urn$ygg", "@Goblet$rby", "@Chalice$rgw", "Soot Covered Urn$byy"],
    recs: [],
  },
  duchess: {
    cups: ["@Urn$rbb#rbb", "@Goblet$yyg#yyg", "@Chalice$byw#rby", "Soot Covered Urn$rrg#rrg", "Sealed Duchess' Urn$bbr#ggy", "Decrepit Duchess' Goblet$bgg#bgg", "Forgotten Duchess' Goblet$gyy#rgw"],
    recs: [7000802],
    augs: [7031800, 7300000, 7010700, 7290000, 7033600, 7032700, 6643100, 6643000, 6500300]
  },
  raider: {
    cups: ["@Urn$rgg", "@Goblet$rby", "@Chalice$rrw", "Soot Covered Urn$bbg"],
    recs: []
  },
  revenant: {
    cups: ["@Urn$bby", "@Goblet$rrg", "@Chalice$bgw", "Soot Covered Urn$ryy"],
    recs: [],
  },
  recluse: {
    cups: ["@Urn$bbg", "@Goblet$rby", "@Chalice$ygw", "Soot Covered Urn$rry"],
    recs: [],
  },
  executor: {
    cups: ["@Urn$ryy#ryy", "@Goblet$rbg#rbg", "@Chalice$byw#yyg", "Soot Covered Urn$rrb#rrb", "Decrepit Executor's Goblet$rry#rry", "@Forgotten Executor's Goblet$gbr#ygw"],
    recs: [7034200, 7034400, 6647100, 7011700, 7034300, 7034500, 6500700, 6647000, 7043000],
    augs: [7034400, 7011700, 7034500]
  },
  scholar: {
    cups: ["@Urn$rry", "@Goblet$bgy", "@Chalice$gyw", "Soot Covered Urn$bgg", "Decrepit unc's Goblet$bbg", "@Forgotten un's Goblet$ygb",],
    recs: [],
    augs: [7036300, 7036400, 7036500, 7036200, 6647200, 6647300, 6500800]
  },
  undertaker: {
    cups: ["@Urn$bgg", "@Goblet$ryy", "@Chalice$gyw", "Soot Covered Urn$rrb", "Decrepit unc's Goblet$ryy", "@Forgotten un's Goblet$rbb",],
    recs: [],
    augs: [7036800, 6500900, 7037300, 6647500, 7037000, 6647400, 7036900]
  },
  universal: {
    cups: ["Sacred Erdtree Grail$yyy#yyy", "Spirit Shelter Grail$ggg#ggg", "Giant's Cradle Grail$bbb#bbb", "Scadutree Grail$rrr#rrr"],
    recs: []
  },
  melee: {
    recs: [7005600, 6005600, 6005601, 7100100, 7100190, 7100110, 7001401, 7001402, 7001400, 7001409, 7001403, 6001401, 6001400, 7000002, 7000001,
      7000400, 7000401, 7000402, 7000900, 7000901, 7000902, 6040001, 6040000, 7040000, 7060000, 7080600, 7330600, 7350600, 7340600]
  }
};

export let char_icons = {};

window.tasks ??= {};
let events = {
  scan: (e) =>
    states.setRelics((p) => {
      console.log(e.relic);
      return { ...p, [e.relic.id]: e.relic };
    }),
  scan_finished: (e) => {
    save()
    window.scanning = false
    states.setPage('')
  },
  scan_state: e => {
    home_list = document.querySelector('.home-main')
    window.scan_card.current.style.display = 'none';
  },
  stop_scan: e => {
    window.scanning = false;
    states.setPage('')
    window.scan_card.current.style.display = 'none';
  }
};

export function generateBuild2(args) {
  let {picks, char, raw, deep, type} = args;
  console.log(picks, char);
  let char_str = char;
  if (!picks.length) picks = chars[char].recs;
  let augs = new Set(chars[char].augs || []);
  let any_rec = new Set([...picks, ...chars[char].recs, ...chars.melee.recs]);
  let reccs = new Set(chars[char].recs);
  let uni_reccs = new Set(chars.melee.recs);
  let uni_possibles = ['rr', 'rrr', 'bb', 'bbb', 'gg', 'ggg', 'yy', 'yyy'];
  let colors = ['b', 'g', 'r', 'y'];

  picks = new Set(picks);
  let scores = [...picks, ...chars[char].recs, ...chars.melee.recs].map(e => dupe_map[e] || e).reduce((acc, e) => {
    acc[e] = (picks.has(e) + (augs.has(e) * .15) || reccs.has(e) * 0.11 || uni_reccs.has(e) * 0.1)
      + (augs.has(e) * .1);
    return acc;
  }, {});

  let raw_cups = [...chars.universal.cups, ...chars[char].cups];
  let light_cups = [];
  let deep_cups = [];
  raw_cups.forEach(el => {
    let c = el.split('$').at(-1).split("#");
    c[0] = c[0].split("").sort().join("");
    c[1] = c[1].split("").sort().join("");
    light_cups.push(c[0]);
    deep_cups.push(c[1]);
    // full_cups.push(`${c[0]}x${c[1]}`);
  });
  // let cups_map = cups.map(e => e.split('$').at(-1).split("").sort().join(""));
  // return console.log(light_cups, deep_cups)

  let main = (cups, relics, debug) => {
    // if(debug) console.log('cups:', cups, 'relics:', relics)
    let cup_map = {};
    let possibles = new Set(uni_possibles);
    cups.forEach((cup, ind) => {
      let w = cup.indexOf('w');
      if (w != -1) {
        let spl = cup.split("").filter((e, i) => i != w);
        colors.forEach(color => {
          let temp = [...spl, color].sort().join("");
          possibles.add(temp[0] + temp[1]);
          possibles.add(temp[0] + temp[2]);
          possibles.add(temp[1] + temp[2]);
          possibles.add(temp);
          cup_map[temp] ??= [];
          cup_map[temp].push(ind)
        })
        return;
      }
      possibles.add(cup[0] + cup[1]);
      possibles.add(cup[0] + cup[2]);
      possibles.add(cup[1] + cup[2]);
      possibles.add(cup);
      cup_map[cup] ??= [];
      cup_map[cup].push(ind)
    });

    let pos_bans = {};
    [...possibles].filter(e => e.length == 2).forEach(e => {
      colors.forEach(c => {
        if (!possibles.has(((e + c).split('').sort().join("")))) {
          pos_bans[e] ??= [];
          pos_bans[e].push(c);
        }
      })
    });
    if (debug) console.log('pos:', possibles);

    let n = relics.length;
    let best = -Infinity;
    let pairs = [];

    for (let i = 0; i < n - 1; i++) {
      let perks1 = relics[i].perks;
      for (let j = i + 1; j < n; j++) {
        let perks2 = relics[j].perks;
        let seen = new Set();
        let score = 0;
        for (let e of perks1) {
          score += scores[dupe_map[e] || e] || 0;
          seen.add(e);
        }
        for (let e of perks2) {
          if (seen.has(e)) {
            score -= .7;
            continue;
          }
          score += scores[dupe_map[e] || e] || 0;
          seen.add(e);
        }
        // console.log(score)
        if (score >= best) {
          if(score > best) best = score;
          pairs.push([score, seen, i, j, relics[i], relics[j]]);
        }
      }
    }

    let final_best = -Infinity;
    let bests = [];
    pairs = pairs.sort((a, b) => b[0] - a[0]).slice(0,75).map(pair => [...pair, String(pair[4].color + pair[5].color).split("").sort().join("")]);
    // if(debug) console.log('pairs:', pairs);
    if (debug) console.log('pos_pans', pos_bans);

    for (let pair of pairs) {
      let bans = new Set(pos_bans[pair[6]] || colors);
      if (debug) console.log(pair[6], bans)
      for (let three of relics.filter((e, i) => !bans.has(e.color) && i != pairs[2] && i != pairs[3])) {
        let score = pair[0];
        for (let e of three.perks) {
          if (pair[1].has(e)) {
            score -= 1.2;
            continue;
          }
          score += scores[dupe_map[e] || e] || 0;
          // pair[1].add(e);
        }
        if (score >= final_best -1) {
          if(score > final_best) final_best = score;
          bests.push([score, pair[2], pair[3], three]);
        }
      }
    }

    // filter duplicates and map 
    let filt = new Set();
    bests = bests.sort((a, b) => b[0] - a[0]).filter(b => {
      let ids = [relics[b[1]], relics[b[2]], b[3]].map(e => e.id).sort().join(",");
      if (filt.has(ids)) return false;
      filt.add(ids);
      return true;
    }).slice(0, 50).map(e => {
      let rels = [relics[e[1]], relics[e[2]], e[3]];
      let colors = rels.map(rel => rel.color).sort().join("");
      let pos_cups = cup_map[colors];
      // if (debug) console.log(cups, colors, cups.indexOf(colors))
      let json = {
        score: e[0],
        rels,
        perks: rels.map(rel => rel.perks).flat(),
        seen: e[1],
        colors,
        pos_cups,
        pos_cups_raw: pos_cups.map(el => raw_cups[+el]),
        type
        // bans: e[5]
      }

      return json;
    });

    return bests;
  };//end main

  if(type == 1) return main(light_cups, states.relics.filter(e => !e.deep));
  if(type == 2) return main(deep_cups, states.relics.filter(e => e.deep), 0);
  let lights = main(light_cups, states.relics.filter(e => !e.deep));
  let deeps = main(deep_cups, states.relics.filter(e => e.deep), 0);

  console.log(lights, deeps);

  lights.forEach(light => {
    let pool = deeps.filter(deep => {
      deep.cup_ind = deep.pos_cups.find(ind => light.pos_cups.includes(ind));
      return deep.cup_ind;
    })
    if(!pool.length) return null;
    let best_deep = pool[0]; // todo: find best 
    light.rels.push(...best_deep.rels);
    light.cup = raw_cups[best_deep.cup_ind];
  });

  lights = lights.filter(e => e.cup)
  console.log(lights)
  
  return lights;
}

export async function init() {

  while (!window.pyspawn) await delay(400) // runCommand();
  // let res = await ipcFetch("load");
  // perks = res.perks;
  // let hold;
  // let holds = {};
  // let hold_count = 0;
  // varsAt = perks.length;
  // perks.forEach((e, i) => {
  //   if (e[0]=='[') char_augs.add(i);
  //   if (hold && hold == e.slice(0, -3)) {
  //     plus_map[i] = ++hold_count;
  //     return;
  //   } else {
  //     hold_count = 0;
  //     hold = 0;
  //   }
  //   if (e.at(-2) == "+") {
  //     hold = e.slice(0, -3).trim();
  //     holds[hold] = i;
  //     if (perks[i - 1] == "hold") plus_map[i] = ++hold_count;
  //     perks.push(hold + " +X");
  //   }
  // });
  // window.perks = perks;
  let data = localStorage.getItem('rb_data');
  if (!data || data.length < 15) {
    data = { relics: base_relics }
    localStorage.setItem('rb_data', JSON.stringify(data))
  } else data = JSON.parse(data)
  return data.relics;
}

async function runCommand() {
  if (!isTauri()) return; 
  if (window.pyspawn?.write) return window.pyspawn;
  if (window.pyspawn === 0) {
    while (!window.pyspawn) await delay(400);
    return window.pyspawn;
  }
  window.pyspawn = 0;
  if (!window.command) {
    // window.command = new Command("py-spawn", ["py", "main.py"]);
    window.command = new Command("exe-spawn", ["prod"]);

    window.command.stdout.on("data", (line) => {
      if (line[0] != "{") return console.log("[stout]", line);
      let data;
      try {
        data = JSON.parse(line);
      } catch (e) { }
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
  if (!isTauri()) return;
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

export function save() {
  window.localStorage.setItem('account', JSON.stringify(account));
  // ipcFetch("save", { data: { relics: states.relics } }).then(console.log);
  // localStorage.setItem('rb_data', JSON.stringify({ relics: states.relics }))
}

export function openSupport() {
  isTauri() ? ipcFetch('support') : window.open("https://ko-fi.com/auraxium/")
}

export async function checkForAppUpdates() {
  if (!isTauri()) return;
  try {
    const update = await check();

    if (update?.available) {
      const confirmUpdate = await ask(
        `An update to version ${update.version} is available\! Do you want to download and install it now?`,
        {
          title: "Update Available",
          kind: "info",
          okLabel: "Update Now",
          cancelLabel: "Later",
        }
      );

      if (confirmUpdate) {
        await update.downloadAndInstall();
        await message("Update installed successfully! The application will now restart.", { title: "Update Complete" });
        await relaunch(); // Restart the application
        // ipcFetch('github')
      }
    }
  } catch (error) {
    console.error("Error checking for updates:", error);
    // await message(`Failed to check for updates: ${error}`, { title: "Update Error", kind: "error" });
  }
}

window.addEventListener("beforeunload", (e) => {
  window.localStorage.setItem('account', JSON.stringify(account));
  // save();
  if (!isTauri()) return;
  window.command.stdout.removeAllListeners("data");
  window.command.stderr.removeAllListeners("data");
  window.pyspawn.kill();
  window.pyspawn = null;
});

// perks_list = perks //+X perks
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
