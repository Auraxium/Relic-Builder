import keyboard, sys, json, random, time, threading, webbrowser
from concurrent.futures import ThreadPoolExecutor
executor = ThreadPoolExecutor(max_workers=2)
import mss
from PIL import Image
from difflib import SequenceMatcher
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"Tesseract-OCR\tesseract.exe"
import pydirectinput

"""
todo:
python:
saving 

js:
state ins tead of window

"""

data = {}
try:
    with open("save1.json") as f:
        data = json.loads(f.read())
except:
    with open("save1.json", "w") as f:
        f.write("{}")

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
    img = img.point(lambda x: (0 if x < 80 else 255), "1")
    text = pytesseract.image_to_string(img)
    rel = [
        line.lower().strip()
        for line in text.split("\n")
        if line and len(line.strip()) > 3
    ]

    if not rel:
        return log("scan failed: no rel")

    name = match(rel.pop(0), types)
    spl = name.split(" ")
    size = sizes.get(spl[0])
    color = colors.get(spl[1])
    rps = []

    while rel and len(rps) < size:
        p = rel.pop(0)
        if not p:
            log("scan failed")
            return

        r1 = match(p, perks, raw=True)
        if size - len(rps) > len(rel):
            if r1[0] < .3:
                log("scan failed")
                return
            rps.append(r1[2])
            continue

        if rel:
            r2 = match(p + " " + rel[0], perks, raw=True)
            if r2[0] > r1[0]:
                if r2[0] < .3:
                    log("scan failed")
                    return
                rps.append(r2[2])
                rel.pop(0)
                continue

        rps.append(r1[2])
    
    id = f"{color}{len(rps)}_{'_'.join(str(x) for x in rps)}"
    if id in current_scan:
        dup_count += 1
        if dup_count > 4:
            scanning = False
    else: 
        dup_count = 0    
    relic = {"size": size, "color": color, "perks": rps, "id": id}
    current_scan[id] = relic
    log(json.dumps({"event": "scan", "relic": relic}))

def scan(*e):
    global scanning
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
        
        global current_scan
        current_scan = {}
        
        log("starting scan")
        
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
    log("Scanning stopped")
    try:
        keyboard.unhook_all_hotkeys()
    except:
        pass
    
def scan_rdy():
    try:
        keyboard.unhook_all_hotkeys()
    except:
        pass
    keyboard.add_hotkey('9', stop_scan)
    keyboard.add_hotkey('0', lambda: threading.Thread(target=scan, args=(None,), daemon=True).start())
    
def save(e):
    global data
    data = {**data, **e}
    with open("save1.json", "w") as f:
        f.write(json.dumps(data))

ports = {
    "test": lambda *e: f"#{format(int(random.random() * 16777215), '06X')}",
    "load": lambda e: {**data, "perks": perks},
    "save": lambda e: {"relics": e.relics},
    "scan_rdy": lambda e: scan_rdy(),
    "support": lambda e: webbrowser.open("https://ko-fi.com/auraxium/"),
}

try:
    while True:
        line = sys.stdin.readline()
        if not line:
            break
        if line[0] != "{":
            log(line)
            continue
        query = json.loads(line)
        if query['port'] == 'exit':
            break
        if "port" in query and query["port"] in ports:
            res = ports[query["port"]](query)
            if "uid" in query:
                try:
                    log(json.dumps({**query, "res": res}))
                except: 
                    log(json.dumps({**query, "res": 'couldnt parse result'}))
        elif "uid" in query:
            log(json.dumps({**query, "err": "no port"}))

except KeyboardInterrupt:
    pass
