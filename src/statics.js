import { Command } from "@tauri-apps/plugin-shell";
import { isTauri } from "@tauri-apps/api/core";
import { resolveResource } from "@tauri-apps/api/path";
import { check } from "@tauri-apps/plugin-updater"; // Correct import for Tauri 2.0
import { ask, message } from "@tauri-apps/plugin-dialog"; // If you're using dialogs, also from plugin-dialog
import { relaunch } from "@tauri-apps/plugin-process";
import effects from './effects.json'

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
    cups: ["@Urn$rrb", "@Goblet$ygg", "@Chalice$ryw", "Soot Covered Urn$bby"],
    recs: [],
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
    cups: ["@Urn$rbb", "@Goblet$yyg", "@Chalice$byw", "Soot Covered Urn$rrg"],
    recs: [],
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
    cups: ["@Urn$rry", "@Goblet$bgy", "@Chalice$gyw", "Soot Covered Urn$bgg", "@Forgotten un's Goblet$ygb", "Decrepit unc's Goblet$bbg"],
    recs: [],
    augs: [7036300,7036400,7036500,7036200,6647200,6647300,6500800]
  },
  undertaker: {
    cups: ["@Urn$bgg", "@Goblet$ryy", "@Chalice$gyw", "Soot Covered Urn$rrb", "@Forgotten un's Goblet$rbb", "Decrepit unc's Goblet$ryy"],
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
export let base_relics = {
  old_pocketwatch: { name: "Old Pocketwatch", perks: [74, 123], color: "g", id: "old_pocketwatch" },
  besmirched_frame: { name: "Besmirched Frame", perks: [349, 92], color: "b", id: "besmirched_frame" },
  slate_whetstone: { name: "slate whetstone", perks: [363, 301], color: "r", id: "slate_whetstone" },
  silver_tear: { name: "silver tear", perks: [361, 354, 2], color: "r", id: "silver_tear" },
  the_wylders_earring: { name: "the wylders earring", perks: [360, 359, 330], color: "r", id: "the_wylders_earring" },
  stone_stake: { name: "stone stake", perks: [137, 58], color: "r", id: "stone_stake" },
  third_volume: { name: "third volume", perks: [134, 162], color: "r", id: "third_volume" },
  witchs_brooch: { name: "witchs brooch", perks: [140, 138, 357], color: "b", id: "witchs_brooch" },
  cracked_sealing_wax: { name: "cracked sealing wax", perks: [273, 67], color: "y", id: "cracked_sealing_wax" },
  edge_of_order: { name: "edge of order", perks: [272, 334, 204], color: "y", id: "edge_of_order" },
  golden_dew: { name: "golden dew", perks: [81, 35], color: "y", id: " golden_dew" },
  crown_medal: { name: "crown medal", perks: [78, 214], color: "g", id: "crown_medal" },
  blessed_iron_coin: { name: "blessed iron coin", perks: [79, 61, 357], color: "g", id: "blessed_iron_coin" },
  torn_braided_cord: { name: "torn braided cord", perks: [311, 344], color: "b", id: "torn_braided_cord" },
  black_claw_necklace: { name: "black claw necklace", perks: [70, 69, 307], color: "y", id: "black_claw_necklace" },
  small_makeup_brush: { name: "small makeup brush", perks: [322, 266], color: "b", id: "small_makeup_brush" },
  old_portrait: { name: "old portrait", perks: [324, 321, 69], color: "b", id: "old_portrait" },
  vestige_of_night: { name: "vestige of night", perks: [317, 285], color: "g", id: "vestige_of_night" },
  bone_like_stone: { name: "bone like stone", perks: [315, 319, 269], color: "g", id: "bone_like_stone" },
  blessed_flowers: { name: "blessed flowers", perks: [89, 74], color: "g", id: "blessed_flowers" },
  golden_sprout: { name: "golden sprout", perks: [88, 328, 147], color: "r", id: "golden_sprout" },
  night_of_the_beast: { name: "night of the beast", perks: [331, 333], color: "g", id: "night_of_the_beast" },
  night_of_the_baron: { name: "night of the baron", perks: [210, 5, 63], color: "b", id: "night_of_the_baron" },
  night_of_the_wise: { name: "night of the wise", perks: [263, 339, 308], color: "y", id: "night_of_the_wise" },
  night_of_the_demon: { name: "night of the demon", perks: [176, 127, 282], color: "r", id: "night_of_the_demon" },
  night_of_the_champion: { name: "night of the champion", perks: [265, 130, 170], color: "g", id: "night_of_the_champion" },
  night_of_the_miasma: { name: "night of the miasma", perks: [298, 37, 10], color: "y", id: "night_of_the_miasma" },
  night_of_the_fathom: { name: "night of the fathom", perks: [264, 100, 274], color: "r", id: "night_of_the_fathom" },
  night_of_the_lord: { name: "night of the lord", perks: [347, 35, 348], color: "b", id: "night_of_the_lord" },
  dark_night_of_the_baron: { name: "dark night of the baron", perks: [210, 209, 67], color: "r", id: "dark_night_of_the_baron" },
};

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

export function generateBuild2(picks, char, raw = 1) {
  console.log(picks, char);
  let char_str = char;
  // char = chars[char];
  if (!picks.length) picks = chars[char].recs;
  let augs = new Set(chars[char].augs || []);
  
  let any_rec = new Set([...picks, ...chars[char].recs, ...chars.melee.recs]);
  let reccs = new Set(chars[char].recs);
  let uni_reccs = new Set(chars.melee.recs);
  let uni_possibles = ['rr', 'rrr', 'bb', 'bbb', 'gg', 'ggg', 'yy', 'yyy'];
  let colors = ['b', 'g', 'r', 'y'];

  let cups = [...chars.universal.cups, ...chars[char].cups];
  let cups_map = cups.map(e => e.split('$').at(-1).split("").sort().join(""));
  let cups_final = {};

  //get total suitable combinations of colors for all cups
  let possibles = new Set(uni_possibles);
  cups.map(e => e.split('$').at(-1).split('').sort()).forEach(e => {
    let cup_fit = cups[cups_map.indexOf(e.join(""))];
    let w = e.indexOf('w');
    if (w != -1) {
      e.splice(w, 1);
      possibles.add([e[0], e[1]].join(""));
      colors.forEach(c => {
        possibles.add([e[0], c].sort().join(""));
        possibles.add([e[1], c].sort().join(""))
        let temp = [e[0], e[1], c].sort().join("");
        possibles.add(temp);
        cups_final[temp] = cup_fit;
      });
      return;
    }
    possibles.add(e[0] + e[1]);
    possibles.add(e[0] + e[2]);
    possibles.add(e[1] + e[2]);
    e = e.join("");
    possibles.add(e);
    cups_final[e] = cup_fit;
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
  
  let scores = picks.reduce((acc,e,i) => {
    acc[e] = (picks.has(e) + (augs.has(e) * .25) || reccs.has(e) * 0.21 || uni_reccs.has(e) * 0.1)
          + (augs.has(e) * .25) - ((3 - perks1.length) / 1000) - (any_rec.has(e) * (plus_map[e] / 1000 || 0));
    return acc;
  }, {});
  picks = new Set(picks);

  let arr = states.relics.filter(e => !e.deep);

  let n = arr.length;
  let best = -Infinity;
  let pairs = [];

  for (let i = 0; i < n - 1; i++) {
    let perks1 = arr[i].perks;
    for (let j = i + 1; j < n; j++) {
      let perks2 = arr[j].perks;
      let seen = new Set();
      let score = 0;
      let dupes = 0;

      for (let e of perks1) {
        score += (picks.has(e) + (augs.has(e) * .25) || reccs.has(e) * 0.21 || uni_reccs.has(e) * 0.1)
          + (augs.has(e) * .25) - ((3 - perks1.length) / 1000) - (any_rec.has(e) * (plus_map[e] / 1000 || 0));
        seen.add(e);
      }

      for (let e of perks2) {
        if (seen.has(e)) {
          score -= .7;
          continue;
        }
        score += (picks.has(e) + (augs.has(e) * .25) || reccs.has(e) * 0.21 || uni_reccs.has(e) * 0.1)
          + (augs.has(e) * .25) - ((3 - perks2.length) / 1000) - (any_rec.has(e) * (plus_map[e] / 1000 || 0));
        seen.add(e);
      }

      if (score >= best ) {
        best = score;
        pairs.push([score, seen, i, j, arr[i], arr[j]]);
      }
    }
  }

  let final_best = -Infinity;
  let bests = [];
  pairs = pairs.sort((a, b) => b[0] - a[0]).slice(0, 20).map(pair => [...pair, String(pair[4].color + pair[5].color).split("").sort().join("")]);

  for (let pair of pairs) {
    let bans = new Set(pos_bans[pair[5]] || []);

    for (let three of arr.filter((e, i) => !bans.has(e.color) && i != pairs[2] && i != pairs[3])) {
      let score = pair[0];

      for (let e of three.perks) {
        if (pair[1].has(e)) {
          score -= 1.2;
          continue;
        }
        score += (picks.has(e) + (augs.has(e) * .25) || reccs.has(e) * 0.21 || uni_reccs.has(e) * 0.1)
          + (augs.has(e) * .25) - ((3 - three.perks.length) / 1000) - (any_rec.has(e) * (plus_map[e] / 1000 || 0));
      }

      if (score >= final_best) {
        final_best = score;
        bests.push([score, pair[2], pair[3], three]);
      }
    }
  }

  //------------

  // console.log(pairs, bests)
  let filt = new Set();
  bests = bests.sort((a, b) => b[0] - a[0]).filter(b => {
    let ids = [arr[b[1]], arr[b[2]], b[3]].map(e => e.id).sort().join(",");
    if(filt.has(ids)) return false;
    filt.add(ids);
    return true;
  }).slice(0, 20).map(e => {
    let rels = [arr[e[1]], arr[e[2]], e[3]];

    return ([
      e[0],
      rels,
      cups_final[rels.map(rel => rel.color).sort().join("")],
      char,
      rels.map(el => el.perks).flat().map(el => {

        return effects[el] + ' ' + ((picks.has(el) + (augs.has(el) * .25) || reccs.has(el) * 0.2 || uni_reccs.has(el) * 0.1)
          + (augs.has(el) * .25))
      })
    ])
  });

  console.log(picks, bests);
  return bests;
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
  if(!isTauri()) return;
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
  if(!isTauri()) return;
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

function save() {
  // ipcFetch("save", { data: { relics: states.relics } }).then(console.log);
  // localStorage.setItem('rb_data', JSON.stringify({ relics: states.relics }))
}

export async function checkForAppUpdates() {
  if(!isTauri()) return;
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
  save();
  if(!isTauri()) return;
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
