import fs from 'fs';

const targets = ['blocks_target', 'block_colors_sort', 'color_block', 'farm_mahjong', 'knife_hit', 'knife_hit_2'];
targets.forEach(t => {
    const p = `../Android/src/main/assets/games/${t}/data.json`;
    const txt = fs.readFileSync(p, 'utf8');
    const matches = txt.match(/\[1,\s*\"(js_)?(Check|check)\"[^\]]*\]/g);
    console.log(t, matches);
});
