// Swipe back from the left edge, the iOS way: the screen follows the finger and the previous one shows beneath it.
// The back button (#x) already knows where "back" is, so we press it to render that screen underneath and drag the
// current screen's live nodes on top in a layer; letting go short of the threshold puts those nodes back.
import { app, motion } from './ui.js';

const EDGE = 32, SLIDE = .3; // start zone (px); how far the screen underneath sits to the left (share of the width)
let g = null; // the gesture in progress

const quietly = f => { motion.quiet = true; f(); setTimeout(() => { motion.quiet = false; }); }; // no screen-change animation
const place = dx => {
  const p = Math.min(1, dx / innerWidth);
  g.layer.style.transform = `translateX(${dx}px)`;
  app.style.transform = `translateX(${(p - 1) * SLIDE * 100}%)`;
  app.style.opacity = .6 + .4 * p;
};

function start() {
  const layer = document.createElement('div'), col = document.createElement('main');
  layer.className = 'swipe'; layer.append(col);
  col.style.transform = `translateY(${-scrollY}px)`;
  g.y = scrollY; g.layer = layer; g.col = col;
  quietly(() => {
    col.append(...app.childNodes);
    document.body.append(layer);
    layer.querySelector('#x').click(); // renders the previous screen into #app
  });
  scrollTo(0, 0);
  place(0);
}

function end() {
  if (!g?.layer) { g = null; return; }
  const { layer, col, y } = g, go = g.dx > innerWidth * .35 || g.v > .5;
  g = null;
  layer.classList.add('settle'); app.classList.add('settle');
  layer.style.transform = `translateX(${go ? innerWidth : 0}px)`;
  app.style.transform = go ? '' : `translateX(${-SLIDE * 100}%)`;
  app.style.opacity = go ? '' : .6;
  setTimeout(() => {
    if (!go) quietly(() => app.replaceChildren(...col.childNodes)); // cancelled: the same nodes, handlers and all
    layer.remove();
    app.classList.remove('settle'); app.style.transform = app.style.opacity = '';
    if (!go) scrollTo(0, y);
  }, 300);
}

addEventListener('touchstart', e => {
  const t = e.touches[0];
  if (g || e.touches.length > 1 || t.clientX > EDGE || !app.querySelector('#x')) return;
  g = { x: t.clientX, y0: t.clientY, dx: 0, v: 0, t: e.timeStamp };
}, { passive: true });

addEventListener('touchmove', e => {
  if (!g) return;
  const t = e.touches[0], dx = t.clientX - g.x, dy = t.clientY - g.y0;
  if (!g.layer) { // decide: a horizontal pull to the right, or let the page scroll
    if (Math.abs(dy) > 10 && Math.abs(dy) > dx) { g = null; return; }
    if (dx < 10) return;
    start();
  }
  e.preventDefault();
  g.v = (dx - g.dx) / Math.max(1, e.timeStamp - g.t); g.t = e.timeStamp; // px per ms, for a quick flick
  g.dx = Math.max(0, dx);
  place(g.dx);
}, { passive: false });

addEventListener('touchend', end);
addEventListener('touchcancel', () => { if (g) g.v = g.dx = 0; end(); });

// Swipe a review card: right = the #y button (Знал / Засчитать / Дальше), left = #n (Не знал / Дальше) when there is one.
// The card follows the finger and tilts, the button's word shows on it, and past the threshold it flies off and presses that button.
export function swipeCard(card, right, left) {
  let s = null;
  const tag = document.createElement('span');
  tag.className = 'swipe-tag'; tag.setAttribute('aria-hidden', 'true'); card.append(tag);
  const show = dx => {
    const b = dx > 0 ? right : left;
    card.style.transform = `translateX(${dx}px) rotate(${dx / 24}deg)`;
    tag.textContent = b?.textContent || '';
    tag.className = 'swipe-tag ' + (dx > 0 ? 'r ' : 'l ') + (b?.classList.contains('bad') || b?.id === 'n' ? 'no' : 'yes');
    tag.style.opacity = b ? Math.min(1, Math.abs(dx) / 90) : 0;
  };
  card.addEventListener('touchstart', e => {
    const t = e.touches[0];
    if (e.touches.length > 1 || t.clientX <= EDGE || e.target.closest('button')) return; // the edge belongs to swipe-back
    s = { x: t.clientX, y: t.clientY, dx: 0, v: 0, t: e.timeStamp, on: false };
    card.classList.remove('settle');
  }, { passive: true });
  card.addEventListener('touchmove', e => {
    if (!s) return;
    const t = e.touches[0], dx = t.clientX - s.x, dy = t.clientY - s.y;
    if (!s.on) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { s = null; return; } // a scroll
      if (Math.abs(dx) < 10) return;
      s.on = true;
    }
    e.preventDefault();
    s.v = (dx - s.dx) / Math.max(1, e.timeStamp - s.t); s.t = e.timeStamp; s.dx = dx;
    show((dx > 0 ? right : left) ? dx : dx / 4); // no button that way: the card resists
  }, { passive: false });
  const end = () => {
    if (!s?.on) { s = null; return; }
    const { dx, v } = s, b = dx > 0 ? right : left;
    s = null;
    card.classList.add('settle');
    if (b && (Math.abs(dx) > innerWidth * .3 || Math.abs(v) > .5 && Math.sign(v) === Math.sign(dx))) {
      show(Math.sign(dx) * innerWidth * 1.3);
      setTimeout(() => b.click(), 220);
    } else { show(0); tag.style.opacity = 0; }
  };
  card.addEventListener('touchend', end);
  card.addEventListener('touchcancel', () => { if (s) s.dx = 0; end(); });
}
