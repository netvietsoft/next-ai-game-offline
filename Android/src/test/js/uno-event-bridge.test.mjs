import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../../main/assets/games/uno_vertical/js/game.js', import.meta.url), 'utf8');
const helper = source.match(/function sendEvent\(typeVar,valueVar\)\{[\s\S]*?\n\}/)?.[0];
assert.ok(helper, 'UNO sendEvent helper must exist');
const calls = [];
const window = { Android: { showInterstitialInGame: value => calls.push(['android', value]) },
  webkit: { messageHandlers: { ports: { postMessage: value => calls.push(['ios', value]) } } } };
const context = vm.createContext({ window, console });
vm.runInContext(helper, context);
context.sendEvent('showInterstitialInGame', 'endRound');
assert.deepEqual(calls[0], ['android', 'endRound']);
context.sendEvent('otherEvent', 'keep');
assert.equal(calls[1][0], 'ios');
assert.equal(calls[1][1].type, 'otherEvent');
delete window.Android;
context.sendEvent('showInterstitialInGame', 'endRound');
assert.equal(calls[2][0], 'ios');
assert.equal(calls.length, 3);
console.log('UNO event routing checks passed');
