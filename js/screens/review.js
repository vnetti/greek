import { $, esc, today } from '../util.js';
import { state } from '../state.js';
import { check, pickNext, grade, learnedDay } from '../srs.js';
import { save, remove, bumpStreak } from '../store.js';
import { say } from '../audio.js';
import { app, LINES, badge, back, sayBtn, SAY, cardHtml, wire, clearable } from '../ui.js';
import { home } from './home.js';
import { swipeCard } from '../swipe.js';

// Review progress is a ride along the current card's line; the train glides from where the last card left it.
const topBar = d => `<div class="top l-${d}">${back('x', 'Закончить', 'x')}
  <span class="dir">${badge(d)}${LINES[d].name}</span>
  <div class="track"><i class="fill" style="width:${state.trainAt}%"></i><i class="train" style="left:${state.trainAt}%"></i></div>
  <span class="small mut num">${state.total - state.q.length}/${state.total}</span></div>`;
function ride() { // called after q.shift(): the card on screen counts as not yet done
  const p = (state.total - state.q.length - 1) / state.total * 100;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if ($('.top .fill')) { $('.top .fill').style.width = p + '%'; $('.top .train').style.left = p + '%'; }
    state.trainAt = p;
  }));
}

export function next() {
  const it = state.q.length && pickNext(state.q, state.recent);
  if (!it) return home('Готово на сегодня. До завтра!');
  state.recent = [...state.recent.slice(-2), it.c];
  const { c, dir } = it;
  const answer = `<form id="f" class="answer" style="margin-top:12px"><input id="a" lang="el" autocomplete="off" autocorrect="off" autocapitalize="off"
    spellcheck="false" placeholder="По-гречески" aria-label="Ответ по-гречески"><button style="margin-top:12px">Проверить</button></form>`;
  if (dir === 'gr2ru') {
    app.innerHTML = topBar(dir) + `<article class="block card front"><div class="word" lang="el">${esc(c.gr)}${SAY}</div></article>
      <button id="show" style="margin-top:12px">Показать перевод</button>`;
    $('#show').onclick = () => back_(it, null);
  } else if (dir === 'ru2gr') {
    app.innerHTML = topBar(dir) + `<article class="block card front"><div class="emoji">${esc(c.emoji)}</div><div class="word">${esc(c.ru)}</div></article>` + answer;
  } else { // listen: audio only, type what you hear
    app.innerHTML = topBar(dir) + `<article class="block card front">${sayBtn('say', 'big', 'Послушать ещё раз')}
      <div class="prompt">Нажми, чтобы послушать ещё раз</div></article>` + answer;
  }
  wire(c);
  ride();
  if (dir !== 'ru2gr') say(c);
  if ($('#f')) { clearable($('#a')); $('#a').focus(); $('#f').onsubmit = e => { e.preventDefault(); back_(it, $('#a').value); }; }
  $('#x').onclick = () => home();
}

function back_(it, answer) {
  const c = it.c;
  let top = '', buttons = '<button class="bad" id="n">Не знал</button><button class="ok" id="y">Знал</button>';
  if (answer !== null) {
    const r = check(answer, c.gr);
    // the verdict stamps onto the card and stays, like a validated ticket
    top = `<span class="stamp ${r === 'accent' ? 'warn' : r}">${r === 'ok' ? 'Верно' : r === 'accent' ? 'Ударение' : 'Ошибка'}</span>`
      + (r === 'ok' ? '' : `<div class="yours">Ты написал: «<span lang="el">${esc(answer)}</span>»</div>`);
    buttons = r === 'bad' ? '<button class="sec" id="y">Засчитать</button><button id="n">Дальше</button>'
      : '<button id="y">Дальше</button>';
    say(c);
  }
  app.innerHTML = topBar(it.dir) + cardHtml(c, top) + `<div class="row">${buttons}</div>
    <p class="center" style="margin:32px 0 0"><button class="link del" id="del">Удалить карточку</button></p>`;
  ride();
  $('#x').onclick = () => home();
  wire(c);
  $('#y').onclick = () => done(it, true);
  if ($('#n')) $('#n').onclick = () => done(it, false);
  swipeCard($('.card'), $('#y'), $('#n'));
  $('#del').onclick = () => {
    if (!confirm(`Удалить «${c.gr}»?`)) return;
    state.cards = state.cards.filter(x => x !== c);
    state.q = state.q.filter(x => x.c !== c);
    remove(c.id);
    next();
  };
}

function done(it, ok) {
  if (!it.retry) { // re-shows within a session don't move the schedule
    const was = learnedDay(it.c); // before grading: a miss would hide the estimate for words known before stamping
    grade(it.c[it.dir], ok, today());
    bumpStreak();
    it.c.introduced ??= today(); // counts toward today's NEW_PER_DAY
    it.c.learned ??= was ?? learnedDay(it.c); // stamped the first time the word is known (today, or the estimate for older ones); kept if it slips back
    save(it.c);
  }
  if (!ok) { state.q.push({ ...it, retry: true }); state.total++; }
  next();
}
