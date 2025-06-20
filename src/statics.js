import { Command } from "@tauri-apps/plugin-shell";
import { isTauri } from "@tauri-apps/api/core";

let command;
let ipc;

let events = {};
let tasks = {};

async function runCommand() {
  if (ipc) return ipc;
  if (ipc === 0) {
    while (!ipc) await delay(400);
    return ipc;
  }
  ipc = 0;
  command = null;
  command = new Command("py-spawn", ["py", "main.py"]);

  // command = new Command("exe-spawn", ["prod"]);

  command.stdout.on("data", (line) => {
    if (line[0] != "{") return console.log("[stout]", line);
    let data;
    try {
      data = JSON.parse(line);
    } catch (e) {}
    if (!data) return console.log("[stout]", line);
    if (events[data.event]) events[data.event]();
    if (tasks[data.uid]) {
      if (data.err) tasks[data.uid].n(data.err);
      else tasks[data.uid].y(data.res);
      delete tasks[data.uid];
    }
    if(!data.uid && !data.event) return console.log(data)
  });

  command.stderr.on("data", (line) => {
    console.error("[stderr]", line);
  });

  command.on("close", (data) => {
    console.log("Process exited with code", data.code);
    ipc = null;
  });

  ipc?.kill && ipc.kill()
  ipc = await command.spawn();
  console.log("new command", command, ipc);
  return ipc;
}

if (!ipc?.write) runCommand();

let c = 1;
export async function ipcFetch(p, j = {}, nr) {
  if (typeof (ipc?.write || {}) != "function") await runCommand();
  j.port ??= p;
  if (nr) return ipc.write(JSON.stringify(j) + "\n");
  j.uid = c++;
  let k = new Promise((y, n) => {
    tasks[j.uid] = { y, n };
  });
  ipc.write(JSON.stringify(j) + "\n");
  return k;
}

export function delay(secs = 1000) {
  return new Promise((y, n) => setTimeout(() => y(""), secs));
}

document.addEventListener("beforeunload", (e) => {
  ipc.kill();
  ipc = null;
});