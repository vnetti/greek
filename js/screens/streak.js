import { $, today, plural } from '../util.js';
import { state } from '../state.js';
import { MILESTONES, FREEZE_EVERY, FREEZE_MAX } from '../srs.js';
import { streakNow } from '../store.js';
import { app, icon, back } from '../ui.js';
import { home } from './home.js';

const days = n => plural(n, 'день', 'дня', 'дней');
// one congratulation per milestone, shown once on home on the day it is reached
const CHEERS = {
  3: ['Три дня подряд — привычка началась.', 'Μπράβο!', 'Браво!'],
  7: ['Целая неделя без пропусков.', 'Συγχαρητήρια!', 'Поздравляем!'],
  14: ['Две недели подряд — так держать.', 'Πολύ καλά!', 'Очень хорошо!'],
  30: ['Месяц каждый день. Это уже привычка.', 'Είσαι αστέρι!', 'Ты звезда!'],
  50: ['Пятьдесят дней — мы гордимся.', 'Συνέχισε έτσι!', 'Продолжай в том же духе!'],
  100: ['Сто дней подряд!', 'Απίστευτο!', 'Невероятно!'],
  365: ['Год каждый день.', 'Ένας ολόκληρος χρόνος!', 'Целый год!']
};
export const cheer = m => { const [text, gr, ru] = CHEERS[m];
  return `<section class="block cheer" role="status"><span class="pop">${icon('flame')}</span><div><b>${days(m)} подряд!</b>
    <div>${text}</div><div class="small mut"><span lang="el">${gr}</span> — ${ru}</div></div></section>`; };

// the last 5 weeks, Monday first; day numbers count from 1970-01-01, a Thursday
const STATE = { on: 'занимались', frozen: 'заморозка', off: 'пропуск', next: '' };
function calendar(s, t) {
  const from = t - (t + 3) % 7 - 28, frozen = new Set(s.frozen);
  const on = d => s.days ? s.days[d] != null : d <= s.last && d > s.last - s.streak; // docs from before history
  const cell = d => { const k = d > t ? 'next' : on(d) ? 'on' : frozen.has(d) ? 'frozen' : 'off', date = new Date(d * 864e5);
    return `<span class="d ${k}${d === t ? ' now' : ''}" title="${date.toLocaleDateString('ru', { day: 'numeric', month: 'long', timeZone: 'UTC' })}${STATE[k] ? ': ' + STATE[k] : ''}">${k === 'frozen' ? icon('snow') : date.getUTCDate()}</span>`; };
  return `<div class="cal num">${['П', 'В', 'С', 'Ч', 'П', 'С', 'В'].map(w => `<span class="w">${w}</span>`).join('')}
    ${Array.from({ length: 35 }, (_, i) => cell(from + i)).join('')}</div>
    <div class="legend small mut"><span><i class="d on"></i>занимались</span><span><i class="d frozen">${icon('snow')}</i>заморозка</span><span><i class="d off"></i>пропуск</span></div>`;
}

export function streak() {
  const s = state.stats, t = today(), n = streakNow(), f = s.freezes ?? 0, missed = n ? t - s.last - 1 : 0;
  const goal = MILESTONES.find(m => m > n);
  const status = !n ? 'Серия начнётся с первой карточки.'
    : missed > 0 ? `Пропуск: ${days(missed)}. Позанимаемся сегодня — заморозки спасут серию.`
    : s.last === t ? 'Сегодня уже засчитано.' : 'Сегодня ещё не занимались.';
  app.innerHTML = `<div class="top">${back()}<h2>Серия</h2></div>
    <section class="block streak-hero"><div class="big${n ? ' on' : ''}">${icon('flame')}<span class="count">${n}</span></div>
      <div><b>${n ? days(n).replace(/^\d+ /, '') + ' подряд' : 'серии пока нет'}</b></div>
      <div class="small mut">${status} Лучшая серия: ${days(s.best ?? 0)}.</div></section>
    <section class="block freezes"><div class="flakes">${Array.from({ length: FREEZE_MAX }, (_, i) => `<span class="${i < f ? 'have' : ''}">${icon('snow')}</span>`).join('')}</div>
      <div><b>Заморозки: ${f} из ${FREEZE_MAX}</b><div class="small mut">Пропустишь день — мы потратим заморозку, и серия не прервётся.
        ${f < FREEZE_MAX ? `Следующая — через ${days(FREEZE_EVERY - n % FREEZE_EVERY)} подряд.` : 'Запас полный.'}</div></div></section>
    ${goal ? `<section class="block goal"><div class="row-sb"><b>Цель: ${days(goal)}</b><span class="small mut num">${n}/${goal}</span></div>
      <div class="bar"><i style="width:${(n / goal * 100).toFixed(1)}%"></i></div>
      <div class="small mut">Ещё ${days(goal - n)}.</div></section>` : ''}
    <section class="block">${calendar(s, t)}</section>`;
  $('#x').onclick = () => home();
}
