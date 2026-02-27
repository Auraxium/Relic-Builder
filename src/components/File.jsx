import React from 'react'
import effects from '../effects.json'
import rel_names from '../Relic_names.json'
import { states, account } from '../statics'
// let nm = {}
// Object.keys(names).forEach(e => {
//   if(names[e]) nm[e] = names[e]
// })
// console.log(nm)

export let base_relics = {
  "cleansing tear": 'r',
  'note "my dear successor"': 'y',
  'glass necklace': 'g',
  'leather monocle case': 'b',
  "old pocketwatch": "g",
  "besmirched frame": "b",
  "slate whetstone": "r",
  "silver tear": "r",
  "the wylder\'s earring": "r",
  "stone stake": "r",
  "third volume": "r",
  "witch\'s brooch": "b",
  "cracked witch\'s brooch": "b",
  "cracked sealing wax": "y",
  "edge of order": "y",
  "golden dew": "y",
  "crown medal": "g",
  "blessed iron coin": "g",
  "torn braided cord": "b",
  "black claw necklace": "y",
  "small makeup brush": "b",
  "old portrait": "b",
  "vestige of night": "g",
  "bone-like stone": "g",
  "blessed flowers": "g",
  "golden sprout": "r",
  "fell omen fetish": "b",
  "night of the beast": "g",
  "night of the baron": "b",
  "night of the wise": "y",
  "night of the demon": "r",
  "night of the champion": "g",
  "night of the miasma": "y",
  "night of the fathom": "r",
  "night of the lord": "b",
  "the will of the balancers": "b",
  "the night of dregs": "r",
  "dark night of the wise": "g",
  "dark night of the miasma": "g",
  "dark night of the lord": "r",
  "dark night of the fathom": "b",
  "dark night of the demon": "b",
  "dark night of the champion": "y",
  "dark night of the beast": "y",
  "dark night of the baron": "r",
  "the will of balance": "r",
};

const DS2_KEY = new Uint8Array([
  0x18, 0xF6, 0x32, 0x66, 0x05, 0xBD, 0x17, 0x8A,
  0x55, 0x24, 0x52, 0x3A, 0xC0, 0xA0, 0xC6, 0x09
]);
const IV_SIZE = 0x10;
const files = [];
const color_map = {
  tranquil: 'g',
  burning: 'r',
  luminous: 'y',
  drizzly: 'b'
}
const size_map = {
  grand: 3,
  polished: 2,
  delicate: 1
}

export async function handleFile(e) {
  // console.dir(e.target)
  let file = e.target.files[0];
  if (!file) return;
  const arrayBuffer = await file.arrayBuffer();
  const view = new DataView(arrayBuffer);
  const bytes = new Uint8Array(arrayBuffer);

  let signature = bytesToASCII(bytes.subarray(0, 4));
  console.log(signature)
  if (signature != 'BND4') return console.log('bad file');

  const num_bnd4_entries = view.getInt32(12, true);
  console.log('Number of BND4 entries:' + num_bnd4_entries);

  const unicode_flag = bytes[48] === 1;
  console.log('Unicode flag:', unicode_flag);

  const BND4_HEADER_LEN = 64;
  const BND4_ENTRY_HEADER_LEN = 32;
  let bnd4_entries = []
  let successful_decryptions = 0

  for (let i = 0; i < num_bnd4_entries; i++) {
    let pos = BND4_HEADER_LEN + (BND4_ENTRY_HEADER_LEN * i);

    if (pos + BND4_ENTRY_HEADER_LEN > bytes.length) {
      console.log('no save yet');
      break;
    }

    let entry_header = bytes.subarray(pos, pos + BND4_ENTRY_HEADER_LEN);
    const expected = new Uint8Array([0x40, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0xFF]);

    if (!bytesEqual(entry_header.subarray(0, 8), expected)) {
      console.log('not magic')
      continue;
    }

    const entry_header_view = new DataView(
      entry_header.buffer,
      entry_header.byteOffset,
      entry_header.byteLength
    );

    const entry_size = entry_header_view.getInt32(8, true);
    const entry_data_offset = entry_header_view.getInt32(16, true);
    const entry_name_offset = entry_header_view.getInt32(20, true);
    const entry_footer_length = entry_header_view.getInt32(24, true);

    if (entry_size <= 0 || entry_size > 1000000000) {
      console.log('invalid size');
      continue;
    }

    if (entry_data_offset <= 0 || entry_data_offset + entry_size > bytes.length) {
      console.log('invalid data offset')
      continue;
    }

    if (entry_name_offset <= 0 || entry_name_offset >= bytes.length) {
      console.log('invalid name offset')
      continue;
    }

    console.log('processing ', i)

    let decrypted_raw = await decrypt({
      encrypted_data: bytes.subarray(entry_data_offset, entry_data_offset + entry_size),
    })

    files.push(decrypted_raw);
  } //end loop

  // account.USER_DATA_00 = files[0];
  console.log('done')
  account.characters = files.slice(0, 10).map(e => getProfileData(e));
  console.log(account)
  localStorage.setItem('account', JSON.stringify(account));
  if (account.current === undefined) account.current = 0;
  let character = account.characters[account.current];
  account.name = character.name;
  account.relics = character.relics;
  account.workshop = character.workshop || {};
  account.scan_date = Date.now();
  // getProfileData()
}

async function decrypt(mem) {
  const iv = mem.encrypted_data.slice(0, IV_SIZE);
  const encryptedPayload = mem.encrypted_data.slice(IV_SIZE);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    DS2_KEY,
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    cryptoKey,
    encryptedPayload
  );

  const decryptedRaw = new Uint8Array(decryptedBuffer);
  //maybe pad end with 0Cs

  return decryptedRaw;
}

function item_from_bytes(data, offset) {
  let BASE_SIZE = 8
  let data_len = data.length;
  if (offset + BASE_SIZE > data_len) {
    return {}
  }
  let ITEM_TYPE_EMPTY = 0x00000000
  let ITEM_TYPE_WEAPON = 0x80000000
  let ITEM_TYPE_ARMOR = 0x90000000
  let ITEM_TYPE_RELIC = 0xC0000000

  const view = new DataView(
    data.buffer,
    data.byteOffset,
    data.byteLength
  );

  const gaitem_handle = view.getUint32(offset, true);
  const item_id = view.getUint32(offset + 4, true);

  // let type_bits = gaitem_handle & 0xF0000000;
  const type_bits = (gaitem_handle & 0xF0000000) >>> 0;
  let cursor = offset + BASE_SIZE;
  let size = 8;

  let durability = 0;
  let unk_1 = 0
  let unk_2 = 0
  let effect_1 = 0
  let effect_2 = 0
  let effect_3 = 0;
  let sec_effect1 = 0
  let sec_effect2 = 0
  let sec_effect3 = 0;
  let padding = [];
  let debug = 0;

  let item = (cursor = 0, debugt) => ({
    gaitem_handle, item_id, effect_1, effect_2, effect_3, durability,
    unk_1, sec_effect1, sec_effect2, sec_effect3, unk_2, offset, extra: padding,
    size: cursor - offset, cursor, debug: debug || debugt
  })

  if (gaitem_handle !== 0) {
    if (type_bits == ITEM_TYPE_WEAPON) {
      cursor += 80;
      size = cursor - offset;
      debug = 1;
    }
    else if (type_bits == ITEM_TYPE_ARMOR) {
      cursor += 8;
      size = cursor - offset;
      debug = 2;
    }
    else if (type_bits == ITEM_TYPE_RELIC) {
      debug = 3;
      if (cursor + 8 > data_len) return item(cursor, 11);

      durability = view.getUint32(cursor, true);
      unk_1 = view.getUint32(cursor + 4, true);
      cursor += 8;

      if (cursor + 12 > data_len) return item(cursor, 21);
      //11:57 songs
      effect_1 = view.getUint32(cursor, true)
      effect_2 = view.getUint32(cursor + 4, true)
      effect_3 = view.getUint32(cursor + 8, true)
      cursor += 12
      debug = 4;

      if (cursor + 0x1C > data_len) return item(cursor, 31);
      for (let i = 0; i < 7; i++) {
        padding.push(view.getUint32(cursor + i * 4, true));
      }
      cursor += 0x1C;
      debug = 6;

      if (cursor + 12 > data_len) return item(cursor, 41);
      sec_effect1 = view.getUint32(cursor, true)
      sec_effect2 = view.getUint32(cursor + 4, true)
      sec_effect3 = view.getUint32(cursor + 8, true)
      cursor += 12;

      if (cursor + 4 > data_len) return item(cursor, 51);
      unk_2 = view.getUint32(cursor, true)
      cursor += 12;
      debug = 5;
      // size = cursor - offset
    }
  }

  return item(cursor);
}

let skips = []
function getProfileData(data) {
  if (!data || data[4] === 0) return null;
  // let data = files[0] || account.USER_DATA_00;
  let offset = 0x14;
  let slot_count = 5120;
  let items = [];
  for (let i = 0; i < slot_count; i++) {
    let item = item_from_bytes(data, offset);
    items.push(item);
    offset += item.size;
  }
  let relics = items.filter(e => e.effect_1).map((e, i) => {
    let rel = {};
    let real_id = e.item_id - 2147483648;
    let name = rel_names[real_id]?.toLowerCase();
    if (!name) return null;
    let spl = name.split(' ');
    if (spl[0] == 'deep') {
      // console.log(name)
      rel.deep = 1;
      rel.curses = [e.sec_effect1, e.sec_effect2, e.sec_effect3]
      spl.splice(0, 1);
    }
    // if(real_id <= 2019999 && real_id >= 2000000) console.log(name)
    let size = size_map[spl[0]];
    let color = color_map[spl[1]];
    color ??= base_relics[name];

    if (!color) {
      skips.push(name)
      return null;
    }

    return ({
      ...rel,
      id: i,
      real_id,
      name,
      perks: [e.effect_1, e.effect_2, e.effect_3],
      deep: real_id <= 2019999 && real_id >= 2000000,// Check if this is a deep relic (ID range 2000000-2019999) is_deep = 2000000 <= real_id <= 2019999,
      size,
      color,
      // raw: e,
    })
  }).filter(Boolean);
  console.log('skips', skips)
  let name_offset = offset + 0x94;
  let max_chars = 16;
  const rawName = data.subarray(name_offset, name_offset + (max_chars * 2));
  const decoder = new TextDecoder('utf-16le');
  const name = decoder.decode(rawName).replace(/\0+$/, '');
  return ({
    name,
    relics
  });
  account.name = name;
  console.log('got ', items.length);
  states.setRelics(account.relics);
}

function bytesEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function bytesToASCII(uint8) {
  return String.fromCharCode(...uint8);
}

export default function File() {
  // let relics_list = Object.values(states.relics).slice(-15)

  return (
    <div className="full flex flex-col">
      <div class="full col p-1 relative ">
        {/* <div class="button bg-neutral-700 h-12 p-4 center w-fit rounded-sm hover:bg-blue-600 " onClick={getProfileData}>
          get data
        </div> */}
        <div class="center grow w-full ">
          <div class="w-[60%] rounded-lg p-2 h-[20%] relative text-[#cccccc] bg-[#2b2b2b]">
            <input type="file" class="opacity-0 absolute full z-10" accept='sl2' onChange={handleFile} />
            <div class="full center text-white," style={{ border: 'dotted #222 4px' }}>
              FILE
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

window.addEventListener('dragover', (e) => {
  e.preventDefault(); // REQUIRED
});

window.addEventListener('drop', (e) => {
  e.preventDefault();

  const files = e.dataTransfer.files;
  if (!files.length) return;

  for (const file of files) {
    console.log('Dropped file:', file.name);
    // process file here
  }
});