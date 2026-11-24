import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const gamesBase = new URL('../../main/assets/games/', import.meta.url);

// 1. Ludo: showAdwert() phải gọi Android.showInterstitialInGame và dieClicked không được gọi Android Ad.
const ludoSource = await readFile(new URL('ludo/game.js', gamesBase), 'utf8');
const showAdwertMatch = ludoSource.match(/showAdwert:\s*function\s*\(\)\s*\{[\s\S]*?\n\t\},/);
assert.ok(showAdwertMatch, 'Ludo showAdwert method must exist');
const dieClickedMatch = ludoSource.match(/dieClicked:\s*function\s*\(a\)\s*\{[\s\S]*?\n\t\},/);
assert.ok(dieClickedMatch, 'Ludo dieClicked method must exist');
assert.equal(
  dieClickedMatch[0].includes('showInterstitialInGame'),
  false,
  'Ludo dieClicked must NEVER trigger Android interstitial mid-action'
);

const ludoCalls = [];
const ludoObj = vm.runInNewContext(
  `({ ${showAdwertMatch[0].replace(/,\s*$/, '')} })`,
  { window: { Android: { showInterstitialInGame: place => ludoCalls.push(place) } } }
);
ludoObj.showAdwert();
assert.deepEqual(ludoCalls, ['ludo_game_over']);

const ludoNoAndroid = vm.runInNewContext(
  `({ ${showAdwertMatch[0].replace(/,\s*$/, '')} })`,
  { window: {} }
);
assert.doesNotThrow(() => ludoNoAndroid.showAdwert());

// 2. CodeThisLab games (pool_8_pro, mahjong_deluxe, uno, backgammon): show_interlevel_ad gọi đúng bridge.
const ctlGames = [
  ['pool_8_pro', 'pool_8_pro_interlevel'],
  ['mahjong_deluxe', 'mahjong_deluxe_interlevel'],
  ['uno', 'uno_interlevel'],
  ['backgammon', 'backgammon_interlevel']
];

for (const [gameName, expectedPlace] of ctlGames) {
  const html = await readFile(new URL(`${gameName}/index.html`, gamesBase), 'utf8');
  const handlerMatch = html.match(
    /\$\(oMain\)\.on\("show_interlevel_ad",\s*function\s*\(evt\)\s*\{([\s\S]*?)\}\);/
  );
  assert.ok(handlerMatch, `${gameName} show_interlevel_ad handler must exist`);

  const calls = [];
  const fn = vm.runInNewContext(
    `(function(evt){${handlerMatch[1]}})`,
    {
      getParamValue: () => 'false',
      parent: {},
      window: { Android: { showInterstitialInGame: place => calls.push(place) } }
    }
  );
  fn({});
  assert.deepEqual(calls, [expectedPlace], `${gameName} must trigger ${expectedPlace}`);

  const fnNoAndroid = vm.runInNewContext(
    `(function(evt){${handlerMatch[1]}})`,
    { getParamValue: () => 'false', parent: {}, window: {} }
  );
  assert.doesNotThrow(() => fnNoAndroid({}));
}

// 3. Dominoes: endGame() hoàn tất tween phải goPage('result') và gọi Android interstitial.
const dominoesSource = await readFile(new URL('dominoes/js/game.js', gamesBase), 'utf8');
const endGameMatch = dominoesSource.match(/function endGame\(\)\{[\s\S]*?\n\}/);
assert.ok(endGameMatch, 'Dominoes endGame function must exist');

const dominoesEvents = [];
const domContext = vm.createContext({
  gameData: { paused: false },
  gameContainer: {},
  TweenMax: { to: (_target, _dur, cfg) => cfg.onComplete() },
  goPage: page => dominoesEvents.push(['page', page]),
  window: { Android: { showInterstitialInGame: place => dominoesEvents.push(['ad', place]) } }
});
vm.runInContext(`${endGameMatch[0]}; endGame();`, domContext);
assert.deepEqual(dominoesEvents, [
  ['page', 'result'],
  ['ad', 'dominoes_end_game']
]);

// 4. Sudoku: chỉ gắn end_level & restart_level, tuyệt đối KHÔNG gắn show_interlevel_ad (bắn giữa ván).
const sudokuHtml = await readFile(new URL('sudoku/index.html', gamesBase), 'utf8');
for (const [evName, expectedPlace] of [
  ['end_level', 'sudoku_end_level'],
  ['restart_level', 'sudoku_restart']
]) {
  const m = sudokuHtml.match(
    new RegExp(`\\$\\(oMain\\)\\.on\\("${evName}",\\s*function\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)\\n\\s*\\}\\);`)
  );
  assert.ok(m, `sudoku ${evName} handler must exist`);
  const calls = [];
  const fn = vm.runInNewContext(`(function(){${m[1]}})`, {
    getParamValue: () => 'false',
    parent: {},
    window: { Android: { showInterstitialInGame: p => calls.push(p) } }
  });
  fn();
  assert.deepEqual(calls, [expectedPlace]);
}
const sudokuMidMatch = sudokuHtml.match(
  /\$\(oMain\)\.on\("show_interlevel_ad",\s*function\s*\(evt\)\s*\{([\s\S]*?)\}\);/
);
assert.ok(sudokuMidMatch && !sudokuMidMatch[1].includes('showInterstitialInGame'),
  'Sudoku show_interlevel_ad fires mid-puzzle every 20 digits and must stay unhooked');

// 5. Block Blast: gameover() gọi block_blast_game_over.
const blockBlastJs = await readFile(new URL('block_blast/scripts/game.js', gamesBase), 'utf8');
const bbMatch = blockBlastJs.match(/function gameover\(\)\{[\s\S]*?\n\t\t\}/);
assert.ok(bbMatch && bbMatch[0].includes("window.Android.showInterstitialInGame('block_blast_game_over')"),
  'block_blast gameover() must invoke showInterstitialInGame');

// 6. Checkers & Chess: gọi đúng khi hết ván / hiện bảng kết quả.
const checkersJs = await readFile(new URL('checkers/script/main.js', gamesBase), 'utf8');
assert.ok(checkersJs.includes('showInterstitialInGame("checkers_game_over")'),
  'checkers end transition must invoke showInterstitialInGame');
const chessJs = await readFile(new URL('chess/scripts/main.js', gamesBase), 'utf8');
assert.ok(chessJs.includes('showInterstitialInGame("chess_game_over")'),
  'chess end panel must invoke showInterstitialInGame');

// 7. Sea Battle & Screaming Chicken: gắn trực tiếp vào hàm Win/Lose (độc lập với biến tắt tiếng in-game).
const seaBattleMainJs = await readFile(new URL('sea_battle/scripts/main.js', gamesBase), 'utf8');
assert.equal(
  seaBattleMainJs.includes('"media/win.webm"===c'),
  false,
  'sea_battle must not rely on audio playback (breaks when in-game sound is muted)'
);
assert.ok(
  seaBattleMainJs.includes('this.C("runtime","android-game-over"'),
  'sea_battle main.js must handle runtime android-game-over DOM messages'
);
const seaBattleRt = await readFile(new URL('sea_battle/scripts/c3runtime.js', gamesBase), 'utf8');
const sbCvMatch = seaBattleRt.match(/function cv\(a\)\{[\s\S]*?\n\}/) ||
  seaBattleRt.match(/function cv\(a\)\{[^]*?else a\.Ga=Zu,a\.vb=\$u\}/);
assert.ok(sbCvMatch, 'sea_battle cv(a) function dispatcher must exist');
const sbDomMsgs = [];
const sbCtx = vm.createContext({
  ad: (_g, comp, handler, payload) => sbDomMsgs.push([comp, handler, payload]),
  ps: (_b, e) => e,
  bv: () => false,
  Zu: () => {},
  $u: function* () {},
  Wu: { gl: { prototype: { lA: () => 'ok' } } }
});
vm.runInContext(sbCvMatch[0], sbCtx);
for (const [fnName, expectedCount] of [['win', 1], ['lose', 2], ['launch', 2]]) {
  const fakeAction = {
    kt: fnName,
    la: 0,
    La: [],
    g: { Vb: false, audioMuted: true },
    jd: {
      je: () => [],
      Ia: () => ({
        Kt: new Map([[fnName, { Ob: () => true, Pe: () => ({ je: () => [] }), Wg: false }]])
      })
    }
  };
  sbCtx.cv(fakeAction);
  fakeAction.Ga();
  assert.equal(sbDomMsgs.length, expectedCount, `sea_battle ${fnName} (muted) emit count`);
}
assert.equal(sbDomMsgs[0][0], 'runtime');
assert.equal(sbDomMsgs[0][1], 'android-game-over');
assert.equal(sbDomMsgs[0][2].reason, 'sea_battle_game_over');

const chickenMainJs = await readFile(new URL('screaming_chicken/scripts/main.js', gamesBase), 'utf8');
assert.equal(
  chickenMainJs.includes('"media/win.webm"===s'),
  false,
  'screaming_chicken must not rely on audio playback (breaks when in-game sound is muted)'
);
const chickenRt = await readFile(new URL('screaming_chicken/scripts/c3main.js', gamesBase), 'utf8');
const scQbtMatch = chickenRt.match(/Qbt\(\)\{[\s\S]*?else this\.U_=Ko,this\.L1t=Zo\}/);
assert.ok(scQbtMatch, 'screaming_chicken Qbt() function dispatcher must exist');
const scCalls = [];
const scHost = vm.runInNewContext(
  `({ ${scQbtMatch[0]} })`,
  {
    Ko: () => {},
    Zo: function* () {},
    Xo: { mmt: { prototype: { Dyt: () => 'ok' } } },
    window: { Android: { showInterstitialInGame: p => scCalls.push(p) } }
  }
);
for (const [fnName, expectedCount] of [['Completed', 1], ['Lose', 2], ['Voice', 2]]) {
  const fakeInstance = Object.assign(Object.create(scHost), {
    Jbt: fnName,
    zbt: 0,
    Qs: [],
    xf: { WB: () => false, audioMuted: true },
    Svt: () => false,
    cwt: {
      GO: () => [],
      SO: () => ({
        Zdt: arr => arr,
        bO: () => ({ lc: () => true, xO: () => ({ GO: () => [] }), CO: () => false })
      })
    }
  });
  fakeInstance.Qbt();
  fakeInstance.U_();
  assert.equal(scCalls.length, expectedCount, `screaming_chicken ${fnName} (muted) trigger count`);
}
assert.deepEqual(scCalls, ['screaming_chicken_game_over', 'screaming_chicken_game_over']);

// 8. Christmas (C2): chỉ kích hoạt khi chuyển ra khỏi layout level_* (không kích hoạt lúc vào màn 1).
const christmasJs = await readFile(new URL('christmas/c2runtime.js', gamesBase), 'utf8');
assert.ok(
  christmasJs.includes('var prev=this.b.qa&&this.b.qa.aa;') &&
    christmasJs.includes('0===prev.indexOf("level_")') &&
    christmasJs.includes('showInterstitialInGame("christmas_level_end")'),
  'christmas layout transition hook must guard prev layout prefix level_'
);

// 9. Balloons Creator (C3): nối nhánh Android trong data.json + chuyển LW sang window.Android[b.type].
const bcData = JSON.parse((await readFile(new URL('balloons_creator/data.json', gamesBase), 'utf8')).replace(/^\uFEFF/, ''));
assert.ok(JSON.stringify(bcData).includes('543921224074720,2,[[-1,23,null,0,false,false,false,540161379532484,null,[[11,346204054198661]]]],[[-2,"SendEventiOS"'),
  'balloons_creator Android branch in js_event must forward to SendEventiOS');
const bcRt = await readFile(new URL('balloons_creator/scripts/c3runtime.js', gamesBase), 'utf8');
const bcLwMatch = bcRt.match(/async LW\(a,b\)\{[\s\S]*?catch\(d\)\{console\.log\(d\)\}\}/);
assert.ok(bcLwMatch, 'balloons_creator LW handler must exist');
const bcCalls = [];
const bcHost = vm.runInNewContext(`({ ${bcLwMatch[0]} })`, {
  window: { Android: { levelCompleteInGame: v => bcCalls.push(['complete', v]) } },
  console
});
await bcHost.LW(null, { type: 'levelCompleteInGame', value: 3 });
assert.deepEqual(bcCalls, [['complete', 3]]);

// 10. Lines98 (C3): ACE index 82 Z.AS.NA gắn vào Event 115 (Show Game Over).
const l98Data = JSON.parse((await readFile(new URL('lines98/data.json', gamesBase), 'utf8')).replace(/^\uFEFF/, ''));
assert.ok(JSON.stringify(l98Data).includes('[-3,82,[false,false,0]]'),
  'lines98 Show Game Over event must call ACE script index 82');
const l98Rt = await readFile(new URL('lines98/scripts/c3runtime.js', gamesBase), 'utf8');
assert.ok(l98Rt.includes('Z.D.Touch.K.CJ,Z.AS.NA]};'), 'lines98 ACE table must register Z.AS.NA at index 82');
const l98AsMatch = l98Rt.match(/self\.C\.AS=(\{[\s\S]*?\});/);
assert.ok(l98AsMatch, 'lines98 self.C.AS must exist');
const l98Calls = [];
const l98As = vm.runInNewContext(`(${l98AsMatch[1]})`, {
  window: { Android: { showInterstitialInGame: p => l98Calls.push(p) } }
});
await l98As.NA();
assert.deepEqual(l98Calls, ['lines98_game_over']);

// 11. 8 game R2 hot mới đưa vào Bundled (v1.4.0): abalone endGame() + 7 game C3 bridge có sẵn.
const abaloneJs = await readFile(new URL('abalone/js/game.js', gamesBase), 'utf8');
const abEndMatch = abaloneJs.match(/function endGame\(\)\{[\s\S]*?\n\}/);
assert.ok(abEndMatch, 'abalone endGame() must exist');
const abEvents = [];
const abCtx = vm.createContext({
  gameData: { paused: false },
  gameContainer: {},
  TweenMax: { to: (_target, _dur, cfg) => cfg.onComplete() },
  goPage: page => abEvents.push(['page', page]),
  window: { Android: { showInterstitialInGame: place => abEvents.push(['ad', place]) } }
});
vm.runInContext(`${abEndMatch[0]}; endGame();`, abCtx);
assert.deepEqual(abEvents, [
  ['ad', 'abalone_game_over'],
  ['page', 'result']
]);

const newlyBundledC3Checks = [
  ['among_us/scripts/c3runtime.js', 'Android.showInterstitialInGame'],
  ['archers_random/scripts/c3main.js', 'Android[s.mVs](s.v_)'],
  ['block_pictures/scripts/c3main.js', 'Android[t.name_event](t.param)'],
  ['ball_8_pool/scripts/c3main.js', 'Android[b.name_event](b.param)'],
  ['tanks_battle/scripts/c3runtime.js', 'Android[b.Eca](b.pca)'],
  ['animal_clicker/scripts/c3runtime.js', 'Android[b.name_event](b.param)'],
  ['angry_heroes/scripts/c3runtime.js', 'Android.levelCompleteInGame']
];
for (const [relPath, expectedSnippet] of newlyBundledC3Checks) {
  const src = await readFile(new URL(relPath, gamesBase), 'utf8');
  assert.ok(src.includes(expectedSnippet), `${relPath} must invoke ${expectedSnippet}`);
}

console.log('All 23 bundled game ad hook tests passed (including muted-audio & 8 newly bundled R2 hot games)');
