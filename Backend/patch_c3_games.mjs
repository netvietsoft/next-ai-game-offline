import fs from 'fs';
import path from 'path';

const games = [
  'blocks_target',
  'block_colors_sort',
  'color_block',
  'farm_mahjong',
  'knife_hit',
  'knife_hit_2'
];

for (const g of games) {
  const p = path.resolve('Android/src/main/assets/games', g, 'data.json');
  if (fs.existsSync(p)) {
    let data = fs.readFileSync(p, 'utf8');
    if (data.includes('[1,"js_Check",2,false,')) {
      data = data.replace('[1,"js_Check",2,false,', '[1,"js_Check",2,true,');
      fs.writeFileSync(p, data, 'utf8');
      console.log(`[PATCHED] ${g}: js_Check set to true`);
    } else if (data.includes('[1,"js_Check",2,true,')) {
      console.log(`[ALREADY TRUE] ${g}`);
    } else {
      console.log(`[NOT FOUND] ${g}: js_Check pattern not found`);
    }
  } else {
    console.log(`[MISSING] ${g}: data.json not found at ${p}`);
  }
}
