import keyboard, sys, json, random, time, threading, webbrowser
import atexit
from concurrent.futures import ThreadPoolExecutor

executor = ThreadPoolExecutor(max_workers=2)
import mss
from PIL import Image
from difflib import SequenceMatcher
import pytesseract

pytesseract.pytesseract.tesseract_cmd = r"Tesseract-OCR\tesseract.exe"
import pydirectinput

data = {"relics": {}}
try:
    with open("save1.json") as f:
        data = json.loads(f.read())
except:
    with open("save1.json", "w") as f:
        f.write(json.dumps(data))

perks = []
with open("perks.txt", "r") as f:
    perks = [line.strip().lower() for line in f if line.strip()]

types = [
    "delicate tranquil scene",
    "delicate luminous scene",
    "delicate drizzly scene",
    "delicate burning scene",
    "polished tranquil scene",
    "polished luminous scene",
    "polished drizzly scene",
    "polished burning scene",
    "grand tranquil scene",
    "grand luminous scene",
    "grand drizzly scene",
    "grand burning scene",
]
sizes = {"delicate": 1, "polished": 2, "grand": 3}
colors = {"tranquil": "g", "burning": "r", "luminous": "y", "drizzly": "b"}
scanning = False
dup_count = 0
current_scan = {}

def log(*s):
    print(*s, flush=True)

def CompareStrings(s1, s2, thresh=0.3):
    if abs(len(s1) - len(s2)) > 5:
        return 0
    score = SequenceMatcher(None, s1, s2).ratio()
    if score < thresh:
        return 0
    return score

def match(key, arr, raw=False, thresh=0.2):
    best = [-1, -1]
    if not key:
        return [-1]
    for i, e in enumerate(arr):
        score = CompareStrings(key, e)
        # log(best[0], score)
        if score > best[0]:
            best = [score, e, i]
    return best if raw else best[1]

def parse_image(img):
    global scanning
    global dup_count
    global current_scan
    img = img.convert("L")
    # img = img.point(lambda x: (0 if x < 80 else 255), "1")
    name = pytesseract.image_to_string(img.crop((0, 0, img.width, img.height*.15)))
    text = pytesseract.image_to_string(img.crop((img.width*.068, img.height*.15, img.width, img.height)))
    rel = [
        line.lower().strip()
        for line in text.split("\n")
        if line and len(line.strip()) > 3
    ]

    if not rel:
        return log("scan failed: no text")
    
    name = match(name, types, raw=True)
    if name[0] < .7 :
        return log('scan failed: no name')
    name = name[1]
    spl = name.split(" ")
    size = sizes.get(spl[0])
    color = colors.get(spl[1])
    rps = []

    while rel and len(rps) < size:
        p = rel.pop(0)
        if not p:
            log("scan failed: no perks left to fill size")
            return

        r1 = match(p, perks, raw=True)
        if size - len(rps) > len(rel):
            if r1[0] < 0.3:
                log("scan failed: couldnt match perk")
                return
            rps.append(r1[2])
            continue

        if rel:
            r2 = match(p + " " + rel[0], perks, raw=True)
            if r2[0] > r1[0]:
                if r2[0] < 0.3:
                    log("scan failed: couldnt match perk even after bonus")
                    return
                rps.append(r2[2])
                rel.pop(0)
                continue

        rps.append(r1[2])

    if len(rps) < size:
      return log('scan failed: ran out of lines for size')
    id = f"{color}{len(rps)}_{'_'.join(str(x) for x in rps)}"
    if id in current_scan:
        dup_count += 1
        if dup_count > 4:
            log("scan ended to dupes")
            scanning = False
    else:
        dup_count = 0
    relic = {"size": size, "color": color, "perks": rps, "id": id}
    current_scan[id] = relic
    log(json.dumps({"event": "scan", "relic": relic}))

def scan(*e):
    global scanning
    global dup_count
    global current_scan
    if scanning:
        return
    with mss.mss() as sct:
        monitor = sct.monitors[1]  # [0] is all monitors, [1] is the primary monitor
        w = monitor["width"]
        h = monitor["height"]

        region = {
            "top": int(h * 0.72),
            "height": int(h * 0.20),
            "left": int(w * 0.555),
            "width": int(w * 0.32),
        }
        scanning = True
        current_scan = {}
        dup_count = 0

        log(json.dumps({"event": 'scan_state'}))

        while scanning:
            screenshot = sct.grab(region)
            img = Image.frombytes("RGB", screenshot.size, screenshot.rgb)
            # img.save("lower_right.png")
            executor.submit(parse_image, img)
            # parse_image(img)
            pydirectinput.press("right")
            time.sleep(0.01)
        scanning = False
        log(json.dumps({"event": "scan_finished"}))
        keyboard.unhook_all_hotkeys()

def stop_scan():
    global scanning
    scanning = False
    log(log(json.dumps({"event": 'stop_scan'})))
    try:
        keyboard.unhook_all_hotkeys()
    except:
        pass


def scan_rdy():
    try:
        keyboard.unhook_all_hotkeys()
    except:
        pass
    keyboard.add_hotkey("9", stop_scan)
    keyboard.add_hotkey(
        "0", lambda: threading.Thread(target=scan, args=(None,), daemon=True).start()
    )

def save(e, hard=False):
    global data
    # log(e)
    if e:
        # log('saving:', e)
        data = {**data, **e["data"]}
    if hard:
        with open("save1.json", "w") as f:
            f.write(json.dumps(data))


def save_rel(relic):
    log(relic)
    if "del" in relic:
        log("deleted")
        del data["relics"][relic["id"]]
    else:
        data["relics"][relic["id"]] = relic


def delete_all_data():
    global data
    data = {}
    with open("save1.json", "w") as f:
        f.write(json.dumps({"relics": {}}))
    log('deleted all')


@atexit.register
def save_on_exit():
    if len(data["relics"]) > 0:
        with open("save1.json", "w") as f:
            f.write(json.dumps(data))


ports = {
    "test": lambda *e: f"#{format(int(random.random() * 16777215), '06X')}",
    "load": lambda e: {**data, "perks": perks},
    "save": lambda e: save(e),
    "save_relic": lambda e: save_rel(e["relic"]),
    "scan_rdy": lambda e: scan_rdy(),
    "stop_scan": lambda e: stop_scan(),
    "delete_all_data": lambda e: delete_all_data(),
    "support": lambda e: webbrowser.open("https://ko-fi.com/auraxium/"),
    "github": lambda e: webbrowser.open("https://github.com/Auraxium/Relic-Builder"),
}

try:
    while True:
        line = sys.stdin.readline()
        if not line:
            break
        if line[0] != "{":
            log(line)
            continue
        # log(line)
        query = json.loads(line)
        if query["port"] == "exit":
            break
        if "port" in query and query["port"] in ports:
            res = ports[query["port"]](query)
            if "uid" in query:
                try:
                    log(json.dumps({**query, "res": res}))
                except:
                    log(json.dumps({**query, "res": "couldnt parse result"}))
        elif "uid" in query:
            log(json.dumps({**query, "err": "no port"}))

except KeyboardInterrupt:
    pass
