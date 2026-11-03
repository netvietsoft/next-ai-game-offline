const fs = require('fs');
const file = 'e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/assets/games/puzzle_legends/scripts/c3main.js';
let content = fs.readFileSync(file, 'utf8');

const target = 'runtime.objects.enemy.createInstance("Background",e.x,e.y,1)';
const replacement = 'runtime.objects.enemy.createInstance((runtime.layout.getLayer("Background")?"Background":(runtime.layout.getLayer("GameLayer")?"GameLayer":0)),e.x,e.y,1)';

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully patched puzzle_legends createInstance layer!');
} else {
    console.log('Target string not found in puzzle_legends');
}
