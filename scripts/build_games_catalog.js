const fs = require('fs');
const path = require('path');

const gameHtmlDir = path.resolve(__dirname, '../GAME HTML');
const iconsDir = path.resolve(__dirname, '../GAME HTML/icons');
const outputJson = path.resolve(__dirname, '../Android/src/main/assets/games_catalog.json');

// Read available icon files
const iconFiles = fs.readdirSync(iconsDir);
const iconMap = new Map();
iconFiles.forEach(file => {
    const ext = path.extname(file);
    const base = path.basename(file, ext);
    if (!iconMap.has(base) || ext === '.webp' || ext === '.png') {
        iconMap.set(base, file);
    }
});

// Category mapping helper
function formatTitle(slug) {
    return slug
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function inferCategory(slug) {
    const s = slug.toLowerCase();
    if (s.includes('puzzle') || s.includes('sort') || s.includes('merge') || s.includes('block') || s.includes('match') || s.includes('glass') || s.includes('pin') || s.includes('connect')) {
        return 'Puzzle';
    }
    if (s.includes('chess') || s.includes('checkers') || s.includes('ludo') || s.includes('tic_tac') || s.includes('uno') || s.includes('battle') || s.includes('table') || s.includes('pool')) {
        return '2 Players';
    }
    if (s.includes('solitaire') || s.includes('2048') || s.includes('twenty48') || s.includes('sudoku') || s.includes('mahjong') || s.includes('domino') || s.includes('cards') || s.includes('lines98')) {
        return 'Classic';
    }
    if (s.includes('shoot') || s.includes('hit') || s.includes('blast') || s.includes('rush') || s.includes('runner') || s.includes('run') || s.includes('race') || s.includes('knife') || s.includes('war')) {
        return 'Arcade';
    }
    return 'Casual';
}

const entries = fs.readdirSync(gameHtmlDir, { withFileTypes: true });
const games = [];
let position = 1;

for (const entry of entries) {
    if (entry.isDirectory() && entry.name !== 'icons' && entry.name !== 'fonts' && entry.name !== 'plugins' && entry.name !== 'iads') {
        const gameName = entry.name;
        const iconFile = iconMap.get(gameName) || `${gameName}.png`;
        const title = formatTitle(gameName);
        const category = inferCategory(gameName);

        games.push({
            name: gameName,
            title: title,
            category: category,
            position: position++,
            icon: iconFile,
            hasRewardedVideo: 1,
            eachNLevels: 3
        });
    }
}

fs.writeFileSync(outputJson, JSON.stringify(games, null, 2), 'utf8');
console.log(`Successfully generated ${games.length} games in games_catalog.json`);
