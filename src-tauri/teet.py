import mss
import keyboard, sys, json, random, time, threading
from PIL import Image

def scun():
    with mss.mss() as sct:
        monitor = sct.monitors[1]  # [0] is all monitors, [1] is the primary monitor
        w = monitor['width']
        h = monitor['height']

        region = {
            'top': int(h * .6916),
            'height': int(h * .1368),
            'left': int(w * .4837),
            'width': int(w * .0674),
        }

        screenshot = sct.grab(region)
        img = Image.frombytes('RGB', screenshot.size, screenshot.rgb)
        img.save("y33.png")
         
          
# keyboard.add_hotkey('0', lambda: log(scan(None)))
keyboard.add_hotkey('f6', lambda: scun())

while True:
  time.sleep(.1)