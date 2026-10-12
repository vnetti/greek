// Shared markup: icons, metro lines and tracks, the card layout.
import { $, esc, today, plural } from './util.js';
import { state } from './state.js';
import { INTERVALS, DIRS } from './srs.js';
import { streakNow } from './store.js';
import { say, sayPart, formsText } from './audio.js';

export const app = $('#app');

// Screen transitions: every render replaces app's children, which replays the CSS entrance (#app.go>*).
// A re-render of the same screen (same first block and title: background refresh, next review card) stays put.
const screenKey = () => { const f = app.firstElementChild; return f ? f.tagName + f.classList[0] + app.querySelector('h1,h2')?.textContent : ''; };
let shown = screenKey(), goingBack = false; // the splash is already on screen
addEventListener('click', e => { goingBack = !!e.target.closest?.('#x'); }, true); // the back button is always #x
new MutationObserver(() => {
  const k = screenKey();
  app.classList.toggle('go', k !== shown);
  if (k !== shown) app.classList.toggle('back', goingBack);
  shown = k; goingBack = false;
}).observe(app, { childList: true });

// Icons: Lucide-style strokes (ISC), drawn inline so they follow the theme colour.
const ICONS = {
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  back: '<path d="m15 18-6-6 6-6"/>',
  chev: '<path d="m9 18 6-6-6-6"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M9.9 5.2A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.2 3.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a10 10 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/><path d="m2 2 20 20"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  ear: '<path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0"/><path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4"/>',
  snow: '<path d="M2 12h20M12 2v20m8-6-4-4 4-4M4 8l4 4-4 4m12-12-4 4-4-4m0 16 4-4 4 4"/>',
  speaker: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>'
};
export const icon = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;

// The three review directions are the three Athens metro lines; boxes 0…6 are their stations (depot, then 1·3·7·14·30·60 days).
export const LINES = {
  gr2ru: { name: 'Узнать', mark: 'Ε' },
  ru2gr: { name: 'Написать', mark: 'Р' },
  listen: { name: 'Услышать', mark: icon('ear') }
};
export const badge = d => `<span class="badge l-${d}" aria-hidden="true">${LINES[d].mark}</span>`;
const STATIONS = INTERVALS.length + 1;
export const pos = i => (i / (STATIONS - 1) * 100).toFixed(1) + '%';
export const stationTrack = (d, cls) => `<div class="track l-${d}">${Array.from({ length: STATIONS }, (_, i) =>
  `<b class="${cls(i)}" style="left:${pos(i)}"></b>`).join('')}</div>`;
// home: a station is lit when any word currently sits there on this line
// day labels for stations 0…6, aligned with the tracks above them (depot shown as a dot)
const stationLabel = i => i ? String(INTERVALS[i - 1]) : '·';
export const scale = (cls = '') => `<div class="scale ${cls}" aria-hidden="true"><span></span><div class="days">${Array.from({ length: STATIONS }, (_, i) =>
  `<span style="left:${pos(i)}">${stationLabel(i)}</span>`).join('')}</div><span></span></div>`;
export const lineTrack = d => { const at = new Set(state.cards.filter(c => !c.pending).map(c => Math.min(c[d].box, INTERVALS.length))); return stationTrack(d, i => at.has(i) ? 'on' : ''); };
// one word on one line: passed stations lit, the current one ringed
export const wordTrack = (c, d) => { const b = Math.min(c[d].box, INTERVALS.length); return stationTrack(d, i => (i < b ? 'on' : '') + (i === b ? ' here' : '')); };

export function streakChip() {
  const n = streakNow(), doneToday = state.stats.last === today(), t = n ? plural(n, 'день', 'дня', 'дней') : 'начни серию';
  return `<button type="button" id="streak" class="streak${n ? ' on' : ''}${doneToday ? ' done' : ''}" aria-label="Серия: ${t}">${icon('flame')}${t}</button>`;
}
export const avatar = u => u?.photoURL
  ? `<img class="av" src="${esc(u.photoURL)}" alt="" referrerpolicy="no-referrer">`
  : `<span class="av" aria-hidden="true">${esc((u?.displayName || u?.email || '?')[0].toUpperCase())}</span>`;
export const back = (id = 'x', label = 'Назад', ic = 'back') => `<button class="icon" id="${id}" aria-label="${label}">${icon(ic)}</button>`;

export const sayBtn = (id = 'say', cls = '', label = 'Произнести') => `<button type="button" class="say ${cls}" id="${id}" aria-label="${label}">${icon('speaker')}</button>`;
export const SAY = sayBtn();
// × inside a text field: shown while it has text; clearing fires the field's input handlers so filters, drafts and heights follow.
export function clearable(el) {
  const w = document.createElement('span'), b = document.createElement('button');
  w.className = 'clr'; b.type = 'button'; b.setAttribute('aria-label', 'Очистить'); b.innerHTML = icon('x');
  el.replaceWith(w); w.append(el, b);
  const sync = () => w.classList.toggle('on', !!el.value);
  el.addEventListener('input', sync); sync();
  b.onpointerdown = e => e.preventDefault(); // keep focus (and the iOS keyboard) in the field
  b.onclick = () => { el.value = ''; el.dispatchEvent(new Event('input')); el.focus(); };
}
// One card layout everywhere (preview, review answer, dictionary): same scale, same axis.
export const cardHtml = (c, top = '') => `<article class="block card${top.includes('stamp') ? ' stamped' : ''}">${top}
  <div class="emoji">${esc(c.emoji)}</div>
  <div class="word" lang="el">${esc(c.gr)}${SAY}</div>
  <div class="tr">${esc(c.tr)}</div>
  ${c.forms ? `<div class="forms"><span lang="el">${esc(c.forms)}</span>${formsText(c) ? sayBtn('sayForms', 'sm', 'Произнести формы') : ''}</div>` : ''}
  <div class="ru">${esc(c.ru)}</div>
  ${c.ex ? `<div class="ex"><div class="t" lang="el">${esc(c.ex)}<small lang="ru">${esc(c.exRu)}</small></div>${sayBtn('sayEx', 'sm', 'Произнести пример')}</div>` : ''}</article>`;
export const wire = c => {
  if ($('#say')) $('#say').onclick = () => say(c);
  if ($('#sayEx')) $('#sayEx').onclick = () => sayPart(c, 'exAudio', c.ex);
  if ($('#sayForms')) $('#sayForms').onclick = () => sayPart(c, 'formsAudio', formsText(c));
};

// dictionary row: the station the word is at on each line, as the day number in the line's colour
export const level = c => c.pending ? '' : `<span class="stops">${DIRS.map(d => { const b = Math.min(c[d].box, INTERVALS.length);
  return `<i class="l-${d}" aria-label="${LINES[d].name}: ${b ? 'станция ' + INTERVALS[b - 1] : 'старт'}">${stationLabel(b)}</i>`; }).join('')}</span>`;
