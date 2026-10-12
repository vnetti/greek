// node scripts/remind.test.mjs
import assert from 'node:assert/strict';
import { dueCount } from '../js/srs.js';
import { message } from './remind.mjs';

const day = 100, s = (box, due) => ({ box, due });
const card = (id, o = {}) => ({ id, gr2ru: s(0, day), ru2gr: s(0, day + 1), listen: s(0, day + 2), ...o });

// 12 new cards: only gr2ru is due today and at most 10 new ones count
assert.equal(dueCount(Array.from({ length: 12 }, (_, i) => card('n' + String(i).padStart(2, '0'))), day), 10);
// seen card: all due directions count; card without `listen` gets it a day after ru2gr
assert.equal(dueCount([card('a', { introduced: 90, gr2ru: s(2, day), ru2gr: s(1, day - 1), listen: undefined })], day), 3);
// drafts waiting for network never count
assert.equal(dueCount([card('p', { pending: true })], day), 0);

assert.equal(message(3, {}, day), '3 карточки ждут повторения');
assert.equal(message(1, { last: day - 1, streak: 5 }, day), '1 карточка ждёт повторения · 🔥 серия 5 дней, не прерывай');
assert.equal(message(21, { last: day - 3, streak: 5 }, day), '21 карточка ждёт повторения'); // broken streak isn't mentioned
assert.equal(message(2, { last: day - 2, streak: 5, freezes: 1 }, day), '2 карточки ждут повторения · 🔥 серия 5 дней, не прерывай'); // a freeze will cover yesterday
console.log('remind ok');
