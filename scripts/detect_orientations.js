const fs = require('fs');
const path = require('path');

const gamesDir = path.resolve(__dirname, '../Android/src/main/assets/games');
const catalogPath = path.resolve(__dirname, '../Android/src/main/assets/games_catalog.json');

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
let landscapeCount = 0;
let portraitCount = 0;

for (const game of catalog) {
    const dir = path.join(gamesDir, game.name);
    let isLandscape = false;

    if (fs.existsSync(dir)) {
        // 1. Check appmanifest.json
        const manifestPath = path.join(dir, 'appmanifest.json');
        if (fs.existsSync(manifestPath)) {
            try {
                const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                if (m.orientation && m.orientation.toLowerCase().includes('landscape')) {
                    isLandscape = true;
                }
            } catch (e) {}
        }

        // 2. Check data.json (Construct 3)
        const dataPath = path.join(dir, 'data.json');
        if (!isLandscape && fs.existsSync(dataPath)) {
            try {
                const d = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                if (d.project && Array.isArray(d.project)) {
                    const w = d.project[0];
                    const h = d.project[1];
                    if (typeof w === 'number' && typeof h === 'number' && w > h) {
                        isLandscape = true;
                    }
                }
            } catch (e) {}
        }

        // 3. Check c2runtime.js (Construct 2) or project.c2runtime.data.js
        const c2Files = ['c2runtime.js', 'project.c2runtime.data.js'];
        for (const c2f of c2Files) {
            const p = path.join(dir, c2f);
            if (!isLandscape && fs.existsSync(p)) {
                try {
                    const content = fs.readFileSync(p, 'utf8', { length: 20000 });
                    // cr_size(width, height)
                    const match = content.match(/cr_size\((\d+),\s*(\d+)\)/);
                    if (match && parseInt(match[1]) > parseInt(match[2])) {
                        isLandscape = true;
                    }
                } catch (e) {}
            }
        }

        // 4. Check index.html for landscape hints
        const indexPath = path.join(dir, 'index.html');
        if (!isLandscape && fs.existsSync(indexPath)) {
            try {
                const html = fs.readFileSync(indexPath, 'utf8');
                if (html.includes('rotate-landscape') || html.includes('orientation: landscape') || html.includes('"landscape"')) {
                    isLandscape = true;
                }
            } catch (e) {}
        }
    }

    game.isHorizontal = isLandscape ? 1 : 0;
    if (isLandscape) {
        landscapeCount++;
    } else {
        portraitCount++;
    }
}

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log(`Updated catalog with isHorizontal: Landscape=${landscapeCount}, Portrait=${portraitCount}, Total=${catalog.length}`);
