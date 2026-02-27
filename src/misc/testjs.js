let k1 = {
    "gaitem_handle": 3229614164,
    "item_id": 2147483877,
    "effect_1": 7010500,
    "effect_2": 7000801,
    "effect_3": 7001001,
    "durability": 2147483877,
    "unk_1": 4294967295,
    "sec_effect1": 4294967295,
    "sec_effect2": 4294967295,
    "sec_effect3": 4294967295,
    "unk_2": 4294967295,
    "offset": 692,
    "extra": [
        4294967295,
        4294967295,
        4278190080,
        0,
        0,
        4294967295,
        4294967295
    ],
    "size": 80,
    "cursor": 772,
    "debug": 5
}


let k2 = { 
    "gaitem_handle": 3229614706,
    "item_id": 2147483768,
    "effect_1": 7032800,
    "effect_2": 7332200,
    "effect_3": 7000601,
    "durability": 2147483768,
    "unk_1": 4294967295,
    "sec_effect1": 4294967295,
    "sec_effect2": 4294967295,
    "sec_effect3": 4294967295,
    "unk_2": 4294967295,
    "offset": 44052,
    "extra": [
        4294967295,
        4294967295,
        4278190080,
        0,
        0,
        4294967295,
        4294967295
    ],
    "size": 80,
    "cursor": 44132,
    "debug": 5
}



function getJSONDiff(obj1, obj2, path = []) {
    const diffs = {};

    // Get all unique keys from both objects
    const allKeys = new Set([
      ...Object.keys(obj1 || {}),
      ...Object.keys(obj2 || {})
    ]);

    for (const key of allKeys) {
      const currentPath = [...path, key];
      const val1 = obj1?.[key];
      const val2 = obj2?.[key];

      // Check if both values are objects (but not arrays or null)
      const isObj1 = val1 && typeof val1 === 'object' && !Array.isArray(val1);
      const isObj2 = val2 && typeof val2 === 'object' && !Array.isArray(val2);

      if (isObj1 && isObj2) {
        // Recurse into nested objects
        Object.assign(diffs, getJSONDiff(val1, val2, currentPath));
      } else if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        // Values differ
        diffs[currentPath.join('.')] = [val1, val2];
      }
    }

    console.log(diffs)
  }



getJSONDiff(k1, k2)