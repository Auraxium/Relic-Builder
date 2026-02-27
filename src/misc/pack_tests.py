import struct
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
import os

def split_files(file_path, folder_name):
    #clean current dir
    shutil.rmtree(split_dir)  # delete folder and everything inside
    decrypt_ds2_sl2(file_path)

def load_json_data():
    global items_json, effects_json
    items_json = data_source.get_relic_origin_structure()
    effects_json = data_source.get_effect_origin_structure()
    
    return True
  
1505
def name_to_path(): 
    global char_name_list, MODE
    char_name_list = []
    with open("userdata_0", "rb") as f:
      file_data = f.read()
    # Check minimum file size before parsing
    name = read_char_name(file_data)
    if name:
        char_name_list.append((name, file_path))
   
353     
def read_char_name(data): 
    # name_offset = gaprint(data) + 0x94
    offset = 0x14
    # end_offset = parse_items(data, start_offset, slot_count)
    items = []
    for _ in range(5120):
        item = Item.from_bytes(data_type, offset)
        items.append(item)
        offset += item.size
    
    max_chars = 16
    raw_name = data[name_offset:name_offset + max_chars * 2]
    name = raw_name.decode("utf-16-le", errors="ignore").rstrip("\x00")
    return name if name else None
  
"328 gets name offset"
def gaprint(data_type):
    global ga_relic, ga_items
    ga_items = []
    ga_relic = []
    start_offset = 0x14
    slot_count = 5120
    items, end_offset = parse_items(data_type, start_offset, slot_count)

    for item in items:
        type_bits = item.gaitem_handle & 0xF0000000
        ga_items.append((item.gaitem_handle, item.item_id, item.effect_1,
                        item.effect_2, item.effect_3, item.sec_effect1,
                        item.sec_effect2, item.sec_effect3, item.offset, item.size))

        if type_bits == ITEM_TYPE_RELIC:
            ga_relic.append((item.gaitem_handle, item.item_id, item.effect_1,
                           item.effect_2, item.effect_3, item.sec_effect1,
                           item.sec_effect2, item.sec_effect3, item.offset, item.size))

    # Parse inventory section to get acquisition order
    parse_inventory_acquisition_order(data_type, end_offset)

    return end_offset
  
def parse_items(data_type, start_offset, slot_count=5120):
    279
    items = []
    offset = start_offset
    for _ in range(slot_count):
        item = Item.from_bytes(data_type, offset)
        items.append(item)
        offset += item.size
    return items, offset
  
def parse_inventory_acquisition_order(data_type, items_end_offset):
    """
    292
    Parse the inventory section to get the acquisition ID of relics.
    Each inventory entry has a 2-byte acquisition ID at offset +12 within the 14-byte entry.
    Lower acquisition ID = acquired earlier (oldest).
    Returns a dict mapping GA handle -> acquisition ID.
    """
    global ga_acquisition_order
    ga_acquisition_order = {}

    # Inventory section starts at items_end_offset + 0x650
    inventory_start = items_end_offset + 0x650

    # Build set of known relic GA handles for quick lookup
    relic_ga_set = set()
    for relic in ga_relic:
        relic_ga_set.add(relic[0])  # relic[0] is ga_handle

    if not relic_ga_set:
        return ga_acquisition_order

    # Scan inventory section for relic GA handles
    # Inventory entries are 14 bytes: [4 bytes prefix] [4 bytes GA handle] [4 bytes unknown] [2 bytes acq_id]
    inventory_data = data_type[inventory_start:]

    # Scan for GA handles and extract acquisition ID
    for offset in range(0, min(len(inventory_data) - 14, 0x3000), 2):
        potential_ga = struct.unpack_from('<I', inventory_data, offset + 4)[0]
        if potential_ga in relic_ga_set and potential_ga not in ga_acquisition_order:
            # Extract acquisition ID from last 2 bytes of the 14-byte entry
            acq_id = struct.unpack_from('<H', inventory_data, offset + 12)[0]
            ga_acquisition_order[potential_ga] = acq_id

    return ga_acquisition_order

open_file :4371
split_files -> decrypt_ds2_sl2 -> save_index_mapping "dumps decrypts to folder"
load_json_data
name_to_path "Get profile names (remember er has character slots)"