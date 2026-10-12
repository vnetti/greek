import { $, today, plural } from '../util.js';
import { state } from '../state.js';
import { INTERVALS, DIRS, LEARNED_BOX, stage, addedDay, weekly, weekStart } from '../srs.js';
import { app, LINES, badge, back, pos } from '../ui.js';
import { account } from './account.js';

const WEEKS = 10;
const word = n => plural(n, 'слово', 'слова', 'слов');
const date = (day, o) => new Date(day * 864e5).toLocaleDateString('ru', { timeZone: 'UTC', ...o }); // day → its local calendar date

export const knownCount = () => state.cards.filter(c => stage(c) === 'known').length;

// How many words we know, where they sit on each line, and the pace week by week.
export function stats() {
  const cards = state.cards, t = today(), n = { known: 0, going: 0, new: 0 };
  cards.forEach(c => n[stage(c)]++);
  const total = cards.length, seg = k => `<i class="${k}" style="flex:${n[k]}"></i>`;
  const known = `<section class="block today sx-known"><div class="count">${n.known}</div>
    <div class="small mut">${total ? `${word(n.known).replace(/^\d+ /, '')} уже знаешь · из ${total}` : 'Пока пусто — добавь первое слово на главной'}</div>
    ${total ? `<div class="sx-bar">${seg('known')}${seg('going')}${seg('new')}</div>
    <div class="sx-key small"><span><i class="known"></i>знаешь ${n.known}</span><span><i class="going"></i>в пути ${n.going}</span><span><i class="new"></i>новые ${n.new}</span></div>` : ''}</section>`;
  if (!total) { app.innerHTML = top() + known; return wireBack(); }

  // each line's stations with the number of words standing there (depot = not started or just missed)
  const S = INTERVALS.length;
  const at = d => { const a = Array(S + 1).fill(0); cards.forEach(c => { if (!c.pending) a[Math.min(c[d].box, S)]++; }); return a; };
  const lines = `<section class="block sx-lines">${DIRS.map(d => `<div class="sx-line l-${d}">${badge(d)}<div><div class="name">${LINES[d].name}</div>
      <div class="sx-track">${at(d).map((k, i) => `<b class="${k ? 'on' : ''}" style="left:${pos(i)}">${k || ''}</b>`).join('')}</div></div></div>`).join('')}
    <div class="sx-line" aria-hidden="true"><span></span><div class="sx-days">${Array.from({ length: S + 1 }, (_, i) =>
      `<span style="left:${pos(i)}"${i >= LEARNED_BOX ? ' class="far"' : ''}>${i ? INTERVALS[i - 1] : '·'}</span>`).join('')}</div></div>
    <p class="small mut">Слово выучено, когда на всех трёх линиях оно доехало до станции ${INTERVALS[LEARNED_BOX - 1]} или дальше.</p></section>`;

  // words added and learned per week, from the week of the first word (at least 4, at most 10 columns); every bar carries its number
  const first = Math.min(...cards.map(c => addedDay(c) ?? t)), span = t - first + 1;
  const nw = Math.min(WEEKS, Math.max(4, Math.floor((weekStart(t) - weekStart(first)) / 7) + 1));
  const w = weekly(cards, t, nw), max = Math.max(1, ...w.map(x => Math.max(x.added, x.learned)));
  const sum = k => w.reduce((s, x) => s + x[k], 0);
  const bar = (k, v) => `<span class="${k}" style="height:${v / max * 100}%">${v ? `<em>${v}</em>` : ''}</span>`;
  const dm = d => date(d, { day: 'numeric', month: 'numeric' });
  const chart = `<section class="block sx-weeks">
    <h2>По неделям</h2>
    <p class="small mut">Сколько слов ты добавил и сколько выучил за каждую неделю. Первое слово — ${date(first, { day: 'numeric', month: 'long' })}${
      span >= 14 ? `, в среднем ${word(Math.round(total / (span / 7)))} в неделю` : ''}.</p>
    <div class="sx-chart" role="img" aria-label="По неделям: добавлено ${sum('added')}, выучено ${sum('learned')}">${w.map(x =>
      `<div title="${dm(x.start)}–${dm(x.start + 6)}: добавлено ${x.added}, выучено ${x.learned}">${bar('sx-add', x.added)}${bar('sx-got', x.learned)}</div>`).join('')}</div>
    <div class="sx-axis" aria-hidden="true">${w.map((x, i) => `<span>${nw > 6 && (nw - 1 - i) % 2 ? '' : dm(x.start)}</span>`).join('')}</div>
    <div class="sx-key small"><span><i class="sx-add"></i>добавлено ${sum('added')}</span><span><i class="known"></i>выучено ${sum('learned')}</span></div></section>`;
  app.innerHTML = top() + known + lines + chart;
  wireBack();
}
const top = () => `<div class="top">${back()}<h2>Статистика</h2></div>`;
const wireBack = () => { $('#x').onclick = () => account(); };
