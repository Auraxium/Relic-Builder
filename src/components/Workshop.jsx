import React, { useEffect, useRef, useState } from "react";
import { ipcFetch, openSupport, CompareStrings, color_text, size_text, color_code, color_muted, perks, init, debounce, clamp, states, varsAt, chars, char_icons, perks_list, checkForAppUpdates, generateBuild2, save } from "../statics";
import { IconSearch, IconX, IconTrash, IconHome, IconPencil, IconListSearch, IconDesk } from "@tabler/icons-react";
import { VirtuosoGrid, Virtuoso, } from 'react-virtuoso'
import effects from '../effects.json'
import * as cur from '../effects_edit'
import { Relic } from "./Home";

const option_class = 'aspect-square, h-full, rounded-lg border-[2px] ms-4, border-[#666] hover:border-[#aaa] center text-[#ccc] bg-[#333] text-[18px] p-1 center capitalize';

account.workshop ??= {};
export default function Workshop() {
  let ghost = useRef()
  let count = 0;
  let rels = Object.keys(account.workshop);
  let moving, pos, target, r, ox, oy, cr, seg, idx;

  function down(e) {
    moving = 1;
    target = e.target;
    r = target.getBoundingClientRect();
    ox = e.pageX - r.left;
    oy = e.pageY - r.top;
    target.style.left = e.pageX - ox + 'px';
    target.style.top = e.pageY - oy + 'px';
    document.addEventListener('pointermove', move)
    document.addEventListener('pointerup', up)
  }

  function move(e) {
    target.style.left = e.pageX - ox + 'px';
    target.style.top = e.pageY - oy + 'px';
  }

  function up(e) {
    moving = false;
    ghost.current.style.width = r.width + 'px';
    ghost.current.style.height = r.height + 'px';
    ghost.current.style.left = e.pageX - ox + 'px';
    ghost.current.style.top = e.pageY - oy + 'px';
    account.workshop[+target.dataset.id].left = e.pageX - ox + 'px';
    account.workshop[+target.dataset.id].top = e.pageY - oy + 'px';
    document.removeEventListener('pointermove', move)
    document.removeEventListener('pointerup', up)
  }

  return (
    <div className="full relative overflow-auto">
      <div className="" onClick={e => account.workshop = {}}>clear</div>
      <div ref={ghost} className="border absolute pointer-events-none"></div>
      {rels.map(e => {
        let info = account.workshop[e];

        if (info.left === undefined) {
          count++;
          info.left = 12 * count;
          info.top = 12 * count;
          info.data = account.relics[e];
        }

        return (
          <div className="absolute mb-[200px] [&>*]:pointer-events-none" data-id={e} style={{ left: info.left, top: info.top }}
            onPointerDown={down}
          >
            <Relic relic={info.data} />
          </div>
        )
      })}
    </div>
  )
}