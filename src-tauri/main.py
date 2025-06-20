import keyboard, sys, json, random, time, threading
from concurrent.futures import ThreadPoolExecutor
executor = ThreadPoolExecutor(max_workers=2) 
import mss
from PIL import Image
from difflib import SequenceMatcher
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"Tesseract-OCR\tesseract.exe"

data = {}
try:
	with open('mac_data.json') as f:
		data = json.loads(f.read())
except:
	with open('mac_data.json', 'w') as f:
		f.write("{}")

perks = []
with open('perks.txt', 'r') as f:
	perks = [line.strip().lower() for line in f if line.strip()]

types = [
  'delicate tranquil scene',
  'delicate luminous scene',
  'delicate drizzly scene',
  'delicate burning scene',
  'polished tranquil scene',
  'polished luminous scene',
  'polished drizzly scene',
  'polished burning scene',
  'grand tranquil scene',
  'grand luminous scene',
  'grand drizzly scene',
  'grand burning scene'
]
sizes = { "delicate": 1, "polished": 2, "grand": 3 }
colors = { "tranquil": "g", "burning": "r", "luminous": "y", "drizzly": "b" }

def log(*s):
	print(*s, flush=True)

def CompareStrings(s1, s2):
	if abs(len(s1) - len(s2)) > 5:
		return 0
	return SequenceMatcher(None, s1, s2).ratio()

def match(key, arr, raw=False):
    best = [-1, -1]
    if not key:
        return [-1]
    for e in arr:
        score = CompareStrings(key, e)
        # log(best[0], score)
        if score > best[0]:
            best = [score, e]
    return best if raw else best[1]
  
def parse_image(img):
    text = pytesseract.image_to_string(img)
    rel = [line.lower().strip() for line in text.split('\n') if line and len(line.strip()) > 3]

    if not rel:
        return log('scan failed: no rel')

    name = match(rel.pop(0), types)
    spl = name.split(' ')
    size = sizes.get(spl[0])
    color = colors.get(spl[1])
    rps = []

    while rel and len(rps) < size:
        p = rel.pop(0)
        if not p:
            log('scan failed')
            return

        r1 = match(p, perks, raw=True)
        if size - len(rps) > len(rel):
            rps.append(r1[1])
            continue

        if rel:
            r2 = match(p + ' ' + rel[0], perks, raw=True)
            if r2[0] > r1[0]:
                rps.append(r2[1])
                rel.pop(0)
                continue

        rps.append(r1[1])

    relic = {'size': size, 'color': color, 'perks': rps}
    
    log(relic)


def scan(e):
    with mss.mss() as sct:
        monitor = sct.monitors[1]  # [0] is all monitors, [1] is the primary monitor
        w = monitor['width']
        h = monitor['height']

        region = {
            'top': int(h * .72),
            'height': int(h * .20),
            'left': int(w * .555),
            'width': int(w * .32),
        }

        for x in range(6):
          screenshot = sct.grab(region)
          img = Image.frombytes('RGB', screenshot.size, screenshot.rgb)
          img = img.convert('L')
          img = img.point(lambda x: (0 if x < 80 else 255), '1')
          # # img.save("lower_right.png")
          # threading.Thread(target=parse_image, args=(img,), daemon=True).start()
          executor.submit(parse_image, img)
          time.sleep(.1)
          keyboard.press('d')
          time.sleep(.1)
          keyboard.press('d')
          time.sleep(.1)
          
ports = {
	'test': lambda *e: f"#{format(int(random.random() * 16777215), '06X')}",
	'load': lambda e: data,
	'scan': lambda e: scan(e)
}

keyboard.add_hotkey('0', lambda: log(scan(None)))

try:
	while True:
		line = sys.stdin.readline()
		if not line:
			break
		if line[0] != '{':
			log(line)
			continue
		query = json.loads(line)
		if 'port' in query and query['port'] in ports:
			res = ports[query['port']](query)
			if 'uid' in query:
				log(json.dumps({**query, 'res': res}))

except KeyboardInterrupt:
	pass