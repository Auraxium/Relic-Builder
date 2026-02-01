import struct
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
import os


  
ITEM_TYPE_EMPTY = 0x00000000
ITEM_TYPE_WEAPON = 0x80000000
ITEM_TYPE_ARMOR = 0x90000000
ITEM_TYPE_RELIC = 0xC0000000
  
class Item:
    BASE_SIZE = 8

    def __init__(self, gaitem_handle, item_id, effect_1, effect_2, effect_3,
                 durability, unk_1, sec_effect1, sec_effect2, sec_effect3,
                 unk_2, offset, extra=None, size=BASE_SIZE):
        self.gaitem_handle = gaitem_handle
        self.item_id = item_id
        self.effect_1 = effect_1
        self.effect_2 = effect_2
        self.effect_3 = effect_3
        self.durability = durability
        self.unk_1 = unk_1
        self.sec_effect1 = sec_effect1
        self.sec_effect2 = sec_effect2
        self.sec_effect3 = sec_effect3
        self.unk_2 = unk_2
        self.offset = offset
        self.size = size
        self.padding = extra or ()

    @classmethod
    def from_bytes(cls, data_type, offset=0):
        data_len = len(data_type)

        # Check if we have enough data for the base read
        if offset + cls.BASE_SIZE > data_len:
            # Return empty item if not enough data
            return cls(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, offset, size=cls.BASE_SIZE)

        gaitem_handle, item_id = struct.unpack_from("<II", data_type, offset)
        type_bits = gaitem_handle & 0xF0000000
        cursor = offset + cls.BASE_SIZE
        size = cls.BASE_SIZE

        durability = unk_1 = unk_2 = 0
        effect_1 = effect_2 = effect_3 = 0
        sec_effect1 = sec_effect2 = sec_effect3 = 0
        padding = ()

        if gaitem_handle != 0:
            if type_bits == ITEM_TYPE_WEAPON:
                cursor += 80
                size = cursor - offset
            elif type_bits == ITEM_TYPE_ARMOR:
                cursor += 8
                size = cursor - offset
            elif type_bits == ITEM_TYPE_RELIC:
                # Check bounds before each read to handle corrupted/truncated saves
                if cursor + 8 > data_len:
                    return cls(gaitem_handle, item_id, 0, 0, 0, 0, 0, 0, 0, 0, 0, offset, size=cls.BASE_SIZE)
                durability, unk_1 = struct.unpack_from("<II", data_type, cursor)
                cursor += 8

                if cursor + 12 > data_len:
                    return cls(gaitem_handle, item_id, 0, 0, 0, durability, unk_1, 0, 0, 0, 0, offset, size=cursor-offset)
                effect_1, effect_2, effect_3 = struct.unpack_from("<III", data_type, cursor)
                cursor += 12

                if cursor + 0x1C > data_len:
                    return cls(gaitem_handle, item_id, effect_1, effect_2, effect_3, durability, unk_1, 0, 0, 0, 0, offset, size=cursor-offset)
                padding = struct.unpack_from("<7I", data_type, cursor)
                cursor += 0x1C

                if cursor + 12 > data_len:
                    return cls(gaitem_handle, item_id, effect_1, effect_2, effect_3, durability, unk_1, 0, 0, 0, 0, offset, extra=padding, size=cursor-offset)
                sec_effect1, sec_effect2, sec_effect3 = struct.unpack_from("<III", data_type, cursor)
                cursor += 12

                if cursor + 4 > data_len:
                    return cls(gaitem_handle, item_id, effect_1, effect_2, effect_3, durability, unk_1, sec_effect1, sec_effect2, sec_effect3, 0, offset, extra=padding, size=cursor-offset)
                unk_2 = struct.unpack_from("<I", data_type, cursor)[0]
                cursor += 12
                size = cursor - offset

        return cls(gaitem_handle, item_id, effect_1, effect_2, effect_3,
                   durability, unk_1, sec_effect1, sec_effect2, sec_effect3,
                   unk_2, offset, extra=padding, size=size)
  
  
offset = 0x14
items = []

def parse_items(data_type, start_offset, slot_count=5120):
    items = []
    offset = start_offset
    for _ in range(slot_count):
        item = Item.from_bytes(data_type, offset)
        items.append(item)
        offset += item.size
    return items, offset
  
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
    # parse_inventory_acquisition_order(data_type, end_offset)
    print(ga_items[5000])

    return end_offset
  
def main():
  with open("C:/Users/Administrator/Desktop/nightbup123/USERDATA_00", "rb") as f:
    data = f.read()
    
  name_offset = gaprint(data) + 0x94
  max_chars = 16
  raw_name = data[name_offset:name_offset + max_chars * 2]
  name = raw_name.decode("utf-16-le", errors="ignore").rstrip("\x00")
  print(name)
  
main()

  
