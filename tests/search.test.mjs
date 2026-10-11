import test from 'node:test';
import assert from 'node:assert/strict';
import { matcher, searchKeys } from '../js/search.js';

const finds = (q, c) => matcher(q)(searchKeys(c));
const sea = { gr: 'η θάλασσα', ru: 'море', tr: 'и ТХА-ла-са' }, morning = { gr: 'η καλημέρα', ru: 'доброе утро', tr: 'ка-ли-МЭ-ра' };
const thanks = { gr: 'ευχαριστώ', ru: 'спасибо', tr: 'эф-ха-ри-СТО' }, oven = { gr: 'ο φούρνος', ru: 'пекарня, печь', tr: 'о ФУР-нос' };
const all = (qs, c, want = true) => { for (const q of qs) assert.equal(finds(q, c), want, q); };

test('sound, transcription, accents, case, article, layout slips, typos', () => {
  all(['таласса', 'тхалас', 'thalassa', 'thalasa', 'θαλασσα', 'ΘΑΛΑΣΣΑ', 'θαλ', 'η θαλασσα', 'море', 'МОРЕ', 'vjht', 'ωξητ', 'ualassa', 'гфдфыыф'], sea);
  all(['калимера', 'калимэра', 'kalimera', 'KALIMERA', 'kalhmera', 'καλημερα', 'rfkbvthf'], morning);
  all(['efharisto', 'eucharisto', 'evcharisto', 'эфхаристо', 'ευχαριστω'], thanks);
  all(['fournos', 'furnos', 'фурнос', 'пекарн', 'пекарня печь'], oven);
  assert.equal(finds('spiti', { gr: 'το σπίτι', ru: 'дом' }), true);
  assert.equal(finds('yia', { gr: 'γεια', ru: 'привет' }), true);
  assert.equal(finds('салата', { pending: true, text: 'σαλάτα' }), true); // drafts: by the typed text
});

test('negatives', () => {
  all(['vfkfccf', 'telefono', 'kipos', 'спасибо'], sea, false);
});
