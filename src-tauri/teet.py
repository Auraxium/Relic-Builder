import keyboard, sys, json, random
import mss
from PIL import Image
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"Tesseract-OCR\tesseract.exe"

img = Image.open("lower_right.png")
text = pytesseract.image_to_string(img)
print(text)