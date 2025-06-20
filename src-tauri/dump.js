"use strict";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
let l = `Grand Drizzly Scene

Duchess] Dagger chain attack reprises event upon
nearby enemies

im Partial HP Restoration upon Post-Damage Attacks

ing attacks improves attack power
`;
let types = ["delicate tranquil scene", "delicate luminous scene", "delicate drizzly scene", "delicate burning scene", "polished tranquil scene", "polished luminous scene", "polished drizzly scene", "polished burning scene", "grand tranquil scene", "grand luminous scene", "grand drizzly scene", "grand burning scene"];
let sizes = { delicate: 1, polished: 2, grand: 3 }; 
let colors = { tranquil: "g", burning: "r", luminous: "y", drizzly: "b" };
let perks = fs
  .readFileSync(path.join(fileURLToPath(import.meta.url), "../perks.txt"), "utf-8")
  .split("\n")
  .filter(Boolean);

function match(key, arr, raw) {
  let best = [-1, -1];
  if(!key) return [-1]
  arr.forEach((e, i) => {
    let score = CompareStrings(key, e);
    if (score > best[0]) best = [score, e];
  });
  return raw ? best : arr[best[1]];
}

let rel = text
  .split("\n")
  .map((e) => e.toLowerCase().trim())
  .filter(e => e&&e.length>3);
let name = match(rel.shift(), types).split(" ");
let size = sizes[name[0]];
let color = colors[name[1]];
let rps = [];

while (rel.length && rps.length < size) {
  let p = rel.shift();
  if(!p) return console.log('scan failed')
  let r1 = match(p, perks, 1)
  if(size-rps.length>k.length) {0
    rps.push(r1[1])
    continue
  } 
  let r2 = match(p+' '+rel[0], perks, 1)
  if(r2[0]>r1[0]) {
    rps.push(r2[1])
    k.shift()
  } else {
    rps.push(r1[1])
  }
}

let relic = {
  size, 
  color,
  perks: rps, 
}

return relic