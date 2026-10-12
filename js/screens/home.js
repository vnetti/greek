import { $, esc, today, plural } from '../util.js';
import { state } from '../state.js';
import { DIRS, queue, newWaiting, news } from '../srs.js';
import { auth, signOut, streakNow, markSeen } from '../store.js';
import { key } from '../api.js';
import { app, icon, LINES, badge, lineTrack, scale, streakChip, avatar } from '../ui.js';
import { next } from './review.js';
import { add } from './add.js';
import { list } from './dictionary.js';
import { more, setupReminders } from './more.js';
import { streak, cheer } from './streak.js';

export function home(msg = '') {
  const qq = queue(state.cards, today()), due = qq.length, waiting = newWaiting(state.cards, today()), pend = state.cards.filter(c => c.pending).length;
  const per = d => qq.filter(x => x.dir === d).length;
  const n = streakNow(), doneToday = state.stats.last === today(), u = auth.currentUser;
  const nw = news(state.stats, today()); // milestone / spent freezes: told once, then marked seen
  if (nw.milestone || nw.froze) markSeen();
  if (nw.froze) msg = `Мы потратили ${plural(nw.froze, 'заморозку', 'заморозки', 'заморозок')} на пропуск — серия цела.${msg ? ' ' + msg : ''}`;
  app.innerHTML = `
    <section class="block head"><h1>Λέξεις</h1>
      <div class="meta"><a href="#" id="lst2">${plural(state.cards.length, 'слово', 'слова', 'слов')}</a>${streakChip()}${n && !doneToday ? '<span>повтори сегодня</span>' : ''}</div></section>
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
      <button class="mi" id="rem">Напоминания<span class="v">${state.push.token ? state.push.hour + ':00' : 'выкл'}${icon('chev')}</span></button>
      <button class="mi" id="more">Ещё<span class="v">${icon('chev')}</span></button>
      <div class="acct">${avatar(u)}<div class="who">${esc(u?.displayName || 'Аккаунт')}<small>${esc(u?.email)}</small></div>
        <button class="link" id="out">Выйти</button></div>
    </nav>`;
  $('#rev').onclick = () => { state.q = queue(state.cards, today()); state.total = state.q.length; state.trainAt = 0; next(); };
  $('#add').onsubmit = e => { e.preventDefault(); const w = $('#w').value.trim(); if (w && key()) add(w); };
  $('#w').onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#add').requestSubmit(); } };
  $('#w').oninput = e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; };
  $('#lst').onclick = $('#lst2').onclick = e => { e.preventDefault(); list(); };
  $('#rem').onclick = () => setupReminders();
  $('#more').onclick = () => more();
  $('#streak').onclick = () => streak();
  $('#out').onclick = () => {
    if (!confirm('Выйти из аккаунта?')) return;
    // keys came from this account: don't leave them for whoever signs in next
    localStorage.removeItem('key'); localStorage.removeItem('tts');
    state.cards = []; state.stats = {}; state.push = {};
    signOut(auth); // onAuthStateChanged then shows the login screen
  };
}
