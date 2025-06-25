import { Command } from "@tauri-apps/plugin-shell";
import { isTauri } from "@tauri-apps/api/core";
export let states = {};

export let sizes = { delicate: 1, polished: 2, grand: 3 };
export let colors = { tranquil: "g", burning: "r", luminous: "y", drizzly: "b" };
export let size_text = { 1: "Delicate", 2: "Polished", 3: "Grand" };
export let color_text = { g: "Tranquil", r: "Burning", y: "Luminous", b: "Drizzly" };
export let color_code = { g: "#6fb139", r: "#e33727", y: "#dead31", b: "#3a8dc4" };
export let color_muted = { b: "#250d59", g: "#0c4d11", r: "#610f0f", y: "#5d4e03", w: "#aaa" };
// export let color_muted = { b: "#13072c", g: "#041a06", r: "#260606", y: "#262001", w: '#aaa' };
// export let color_code = { g: "#53802d", r: "#A22A1F", y: "#c1972d", b: "#286187" };

export let scanning;

export let perks = [];
// window.perks = perksk
export let perks_list = [];
export let varsAt;
window.plus_map = {};

export let chars = {
  wylder: {
    cups: ["@Urn$rrb", "@Goblet$ygg", "@Chalice$ryw", "Soot Covered Urn$bby"],
    recs: [359, 360, 363, 304, 301, 302, 303, 56, 57, 58, 344, 342, 343, 299, 331, 330, 357, 355, 356, 354, 352, 353],
  },
  guardian: {
    cups: ["@Urn$ryy", "@Goblet$bbg", "@Chalice$byw", "Soot Covered Urn$rgg"],
    recs: [251, 252, 4, 75, 130, 132, 135, 138, 137, 232, 147, 140, 136, 139, 344, 342, 343, 301, 302, 303, 299, 265, 330, 100, 233, 191, 162, 84, 82, 83, 357, 355, 356, 56, 57, 58, 331, 306, 307, 305, 304],
  },
  ironeye: {
    cups: ["@Urn$ygg", "@Goblet$rby", "@Chalice$rgw", "Soot Covered Urn$byy"],
    recs: [270, 273, 271, 74, 73, 72, 56, 57, 58, 352, 353, 354, 69, 149, 178, 204, 304, 301, 302, 303],
  },
  duchess: {
    cups: ["@Urn$rbb", "@Goblet$yyg", "@Chalice$byw", "Soot Covered Urn$rrg"],
    recs: [299, 330, 80, 81, 78, 79, 72, 73, 74, 267, 268, 269, 56, 57, 58, 214, 155, 184, 108, 209, 210, 63, 295, 296, 297, 301, 302, 303, 304,],
  },
  raider: {
    cups: ["@Urn$rgg", "@Goblet$rby", "@Chalice$rrw", "Soot Covered Urn$bbg"],
    recs: [299, 311, 330, 331, 312, 251, 252, 344, 342, 343,56,57,58, 301, 302, 303, 304]
  }, 
  revenant: {
    cups: ["@Urn$bby", "@Goblet$rrg", "@Chalice$bgw", "Soot Covered Urn$ryy"],
    recs: [323, 324, 322, 355, 356, 357, 299, 331, 330, 92, 100, 297, 295, 296, 301, 302, 303, 304, 354, 353, 352, 69],
  },
  recluse: {
    cups: ["@Urn$bbg", "@Goblet$rby", "@Chalice$ygw", "Soot Covered Urn$rry"],
    recs: [269, 268, 267, 92, 91, 90, 318, 317, 319, 291, 283, 285, 284, 263, 297, 295, 296],
  },
  executor: {
    cups: ["@Urn$ryy", "@Goblet$rbg", "@Chalice$byw", "Soot Covered Urn$rrb"],
    recs: [299, 330, 331, 72, 73, 74, 301, 304, 302, 303, 357, 355, 356, 75, 147, 4, 327, 86, 89, 88, 85, 165, 194, 238]
  },
  universal: {
    cups: ["Sacred Erdtree Grail$yyy", "Spirit Shelter Grail$ggg", "Giant's Cradle Grail$bbb"],
    recs: [329, 341, 356, 355, 357, 84, 82, 83, 100, 264, 265, 266, 354, 352, 353, 299, 330, 331, 58, 57, 351, 69]
  },
};
export let char_icons = {};
export let base_relics = {
  old_pocketwatch: { name: "Old Pocketwatch", perks: [74, 123], color: "g", id: "b2_74_123" },
  besmirched_frame: { name: "Besmirched Frame", perks: [349, 92], color: "b", id: "b2_349_92" },
  slate_whetstone: { name: "slate_whetstone", perks: [363, 301], color: "r", id: "r2_363_301" },
  silver_tear: { name: "silver_tear", perks: [361, 354, 2], color: "r", id: "r3_361_354_2" },
  the_wylders_earring: { name: "the_wylders_earring", perks: [360, 359, 330], color: "r", id: "r3_360_359_330" },
  stone_stake: { name: "stone_stake", perks: [137, 58], color: "r", id: "r2_137_58" },
  third_volume: { name: "third_volume", perks: [134, 162], color: "r", id: "r2_134_162" },
  witchs_brooch: { name: "witchs_brooch", perks: [140, 138, 357], color: "b", id: "b3_140_138_357" },
  cracked_sealing_wax: { name: "cracked_sealing_wax", perks: [273, 67], color: "y", id: "y2_273_67" },
  edge_of_order: { name: "edge_of_order", perks: [272, 334, 204], color: "y", id: "y3_272_334_204" },
  golden_dew: { name: "golden_dew", perks: [81, 35], color: "y", id: "y2_81_35" },
  crown_medal: { name: "crown_medal", perks: [78, 214], color: "g", id: "g2_78_214" },
  blessed_iron_coin: { name: "blessed_iron_coin", perks: [79, 61, 357], color: "g", id: "g3_79_61_357" },
  torn_braided_cord: { name: "torn_braided_cord", perks: [311, 344], color: "b", id: "b2_311_344" },
  black_claw_necklace: { name: "black_claw_necklace", perks: [70, 69, 307], color: "y", id: "y3_70_69_307" },
  small_makeup_brush: { name: "small_makeup_brush", perks: [322, 266], color: "b", id: "b2_322_266" },
  old_portrait: { name: "old_portrait", perks: [324, 321, 69], color: "b", id: "b3_324_321_69" },
  vestige_of_night: { name: "vestige_of_night", perks: [317, 285], color: "g", id: "g2_317_285" },
  bone_like_stone: { name: "bone_like_stone", perks: [315, 319, 269], color: "g", id: "g3_315_319_269" },
  blessed_flowers: { name: "blessed_flowers", perks: [89, 74], color: "g", id: "g2_89_74" },
  golden_sprout: { name: "golden_sprout", perks: [88, 328, 147], color: "r", id: "r3_88_328_147" },
  night_of_the_beast: { name: "night_of_the_beast", perks: [331, 333], color: "g", id: "g2_331_333" },
  night_of_the_baron: { name: "night_of_the_baron", perks: [210, 5, 63], color: "b", id: "b3_210_5_63" },
  night_of_the_wise: { name: "night_of_the_wise", perks: [263, 339, 308], color: "y", id: "y3_263_339_308" },
  night_of_the_demon: { name: "night_of_the_demon", perks: [176, 127, 282], color: "r", id: "r3_176_127_282" },
  night_of_the_champion: { name: "night_of_the_champion", perks: [265, 130, 170], color: "g", id: "g3_265_130_170" },
  night_of_the_miasma: { name: "night_of_the_miasma", perks: [298, 37, 10], color: "y", id: "y3_298_37_10" },
  night_of_the_fathom: { name: "night_of_the_fathom", perks: [264, 100, 274], color: "r", id: "r3_264_100_274" },
  night_of_the_lord: { name: "night_of_the_lord", perks: [347, 35, 348], color: "b", id: "b3_347_35_348" },
  dark_night_of_the_baron: { name: "dark_night_of_the_baron", perks: [210, 209, 67], color: "r", id: "r3_210_209_67" },
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

export function generateBuild(picks, char) {
  console.log(picks, char);
  let char_str = char;
  char = chars[char];
  picks ??= char.recs;
  picks = new Set(picks);
  let reccs = new Set(char.recs);
  let uni_reccs = new Set(chars.universal.recs);
  let colors = { r: [], b: [], g: [], y: [] };
  let relics = Object.values(states.relics).filter((rel) => {
    //score and filter
    let score = rel.perks.reduce((acc, e) => acc + (picks.has(e) || reccs.has(e) * 0.25 || uni_reccs.has(e) * 0.1) * ((plus_map[e] || 0) / 90 + 1), 0);
    if (score <= 0) return false;
    rel.score = score;
    return true;
  });
  relics.forEach((rel, i) => colors[rel.color].push(i)); //split color

  let top = [];
  let best = [-999, [], "", ""];
  for (let cup_str of [...char.cups, ...chars.universal.cups]) {
    let cup_pool = cup_str
      .split("$")
      .at(-1)
      .split("")
      .map((c) => {
        if (colors[c]?.length) return colors[c];
        if (!colors[c]) return relics.map((e, i) => i); //if white
        colors[c].push(relics.length); //empty color
        let any = Object.values(states.relics).find((rel) => rel.color == c);
        relics.push({ ...any, score: 0 });
        return colors[c];
      }); //colors map, inds relica
    let perm = Array(cup_pool.length).fill(0);
    let size_map = cup_pool.map((c) => c.length);

    const rotate = (s = 0) => {
      if (s > perm.length - 1) {
        return (perm = Array(size_map.length).fill(0));
      }
      if (++perm[s] >= size_map[s]) {
        perm[s] = 0;
        rotate(s + 1);
      }
    };

    for (let i = 0; i < size_map.reduce((acc, e) => e * acc, 1); i++) {
      let rels = cup_pool.map((c, i) => c[perm[i]]); //inds of relics
      if (rels.length !== new Set(rels).size) {
        rotate(0);
        continue;
      }
      rels = rels.map((e) => relics[e]); //whole not ids
      let score = rels.reduce((acc, e) => acc + e.score, 0);
      let combine = rels.reduce((acc, e) => {
        acc.push(...e.perks);
        return acc;
      }, []); // check for dups
      score -= (combine.length - new Set(combine).size) * 1.5; //todo: make bad_dupes list

      if (score >= best[0]) {
        best = [score, [...rels], cup_str, char_str];
        top.unshift([...best]);
      } else if (cup_str != top[0][2] && best[0] - score < 3) {
        top.push([score, [...rels], cup_str, char_str]);
      }
      rotate(0);
    }
  }

  let seen = new Set();
  top = top
    .sort((a, b) => b[0] - a[0])
    .filter((build, i) => {
      if (best[0] - build[0] > 3) return false;
      let temp = build[1]
        .map((e) => e.id)
        .sort((a, b) => a.localeCompare(b))
        .join("+");
      // console.log(temp);
      if (seen.has(temp)) return false;
      seen.add(temp);
      return true;
    });
  console.log(top.slice(0, 6));

  return top.slice(0, 15);
}

export async function init() {
  while (!window.pyspawn) await delay(400);
  let res = await ipcFetch("load");
  perks = res.perks;
  let hold;
  let holds = {};
  let hold_count = 0;
  varsAt = perks.length;
  perks.forEach((e, i) => {
    if (hold && hold == e.slice(0, -3)) {
      plus_map[i] = ++hold_count;
      return;
    } else {
      hold_count = 0;
      hold = 0;
    }
    if (e.at(-2) == "+") {
      hold = e.slice(0, -3).trim();
      holds[hold] = i;
      if (perks[i - 1] == "hold") plus_map[i] = ++hold_count;
      perks.push(hold + " +X");
    }
  });

  window.perks = perks;
  if(!Object.keys((res.relics||{})).length) return base_relics
  return res.relics;
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
  ipcFetch("save", { data: { relics: states.relics } }).then(console.log);
}

window.addEventListener("beforeunload", (e) => {
  console.log("removing local command", has_command);
  save();
  localStorage.removeItem("command");
  // window.command.stdout.removeAllListeners("data");
  // window.command.stderr.removeAllListeners("data");
  // window.pyspawn.kill();
  // window.pyspawn = null;
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
