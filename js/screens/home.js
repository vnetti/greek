import { $, esc, today, plural } from '../util.js';
import { state } from '../state.js';
import { DIRS, queue, newWaiting, news } from '../srs.js';
import { auth, streakNow, markSeen } from '../store.js';
import { key } from '../api.js';
import { app, icon, LINES, badge, lineTrack, scale, streakChip, avatar } from '../ui.js';
import { next } from './review.js';
import { add } from './add.js';
import { list } from './dictionary.js';
import { account } from './account.js';
import { help } from './help.js';
import { streak, cheer } from './streak.js';

export function home(msg = '') {
  const qq = queue(state.cards, today()), due = qq.length, waiting = newWaiting(state.cards, today()), pend = state.cards.filter(c => c.pending).length;
  const per = d => qq.filter(x => x.dir === d).length;
  const n = streakNow(), doneToday = state.stats.last === today(), u = auth.currentUser;
  let nw = news(state.stats, today()); // milestone / spent freezes: marked seen once, kept on screen until reload or tomorrow
  if (nw.milestone || nw.froze) { markSeen(); state.news = { ...nw, day: today() }; }
  else if (state.news?.day === today()) nw = state.news;
  app.innerHTML = `
    <section class="block head"><button class="acct" id="me" aria-label="Аккаунт">${avatar(u)}</button><h1>Λέξεις</h1>
      <div class="meta"><a href="#" id="lst2">${plural(state.cards.length, 'слово', 'слова', 'слов')}</a>${streakChip()}${n && !doneToday ? '<span>повтори сегодня</span>' : ''}</div>
      ${nw.froze ? `<div class="froze small" role="status">Мы потратили ${plural(nw.froze, 'заморозку', 'заморозки', 'заморозок')} на пропуск — серия цела.</div>` : ''}</section>
    ${nw.milestone ? cheer(nw.milestone) : ''}
    <section class="block today">
      <div class="count">${due}</div>
      <div class="small mut">${due ? `${plural(due, 'карточка', 'карточки', 'карточек').replace(/^\d+ /, '')} на сегодня · около ${Math.max(1, Math.round(due / 3))} мин` : 'всё повторено'}${waiting ? ` · ещё ${waiting} новых ждут` : ''}</div>
      <div class="lines">${DIRS.map(d => `<div class="line">${badge(d)}<div><div class="name">${LINES[d].name}</div>${lineTrack(d)}</div>
        <div class="n${per(d) ? '' : ' zero'}">${per(d)}</div></div>`).join('')}${scale()}</div>
      <button id="rev" ${due ? '' : 'disabled'}>${due ? 'Поехали' : 'До завтра'}</button>
    </section>
    <form id="add" class="block add"><textarea id="w" rows="1" placeholder="Новое слово или список" aria-label="Новое слово" autocomplete="off"></textarea>
      <button aria-label="Добавить">${icon('plus')}</button></form>
    <div class="msg">${esc(msg)}${pend ? `<div>${icon('clock')}Ждут интернета: ${pend} — доделаем сами</div>` : ''}</div>
    <nav class="block menu">
      <button class="mi" id="lst">Словарь<span class="v num">${state.cards.length}${icon('chev')}</span></button>
      <button class="mi" id="help">Как это работает<span class="v">${icon('chev')}</span></button>
    </nav>`;
  $('#rev').onclick = () => { state.q = queue(state.cards, today()); state.total = state.q.length; state.trainAt = 0; next(); };
  $('#add').onsubmit = e => { e.preventDefault(); const w = $('#w').value.trim(); if (!w) return; if (!key()) return account('Сначала вставь ключ Gemini — без него не сделать карточку', 'keys'); add(w); };
  $('#w').onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#add').requestSubmit(); } };
  const w = $('#w'), grow = () => { w.style.height = 'auto'; w.style.height = w.scrollHeight + 'px'; };
  w.oninput = () => { state.draft = w.value; grow(); };
  w.value = state.draft; if (w.value) grow();
  $('#lst').onclick = $('#lst2').onclick = e => { e.preventDefault(); list(); };
  $('#me').onclick = () => account();
  $('#help').onclick = () => help();
  $('#streak').onclick = () => streak();
}
