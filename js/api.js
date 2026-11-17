// Card text comes from Gemini or OpenAI (picked on the account screen), the recordings from Google Cloud Text-to-Speech.
import { sec } from './util.js';
import { formsText } from './audio.js';

// A translation card needs no reasoning: lite with minimal thinking is fastest. Some versions reject 'minimal' (400),
// which just moves on to lite with defaults, then full Flash with 'low' (supported by every Gemini 3 Flash).
const TRIES = [['gemini-flash-lite-latest', { thinkingLevel: 'minimal' }], ['gemini-flash-lite-latest'], ['gemini-flash-latest', { thinkingLevel: 'low' }]];

// OpenAI: same ladder as Gemini — the cheapest model (Luna) without reasoning, Luna with defaults, then Terra with 'low'.
// Models get retired (gpt-5-mini on 2026-12-11): check developers.openai.com/api/docs/deprecations.
const OTRIES = [['gpt-6-luna', { reasoning_effort: 'none' }], ['gpt-6-luna'], ['gpt-6.1-terra', { reasoning_effort: 'low' }]];

// which service makes the cards and the localStorage name of its key ('key' stays Gemini's for old devices)
export const AI = { gemini: ['Gemini', 'key'], openai: ['OpenAI', 'okey'] };
export const ai = () => AI[localStorage.getItem('ai')] ? localStorage.getItem('ai') : 'gemini';
// keys are set on the account screen (or come from the shared doc, store.js loadKeys); key() is the card maker's
export const key = (n = AI[ai()][1]) => localStorage.getItem(n) || '';

const PROMPT = `Ты делаешь карточки для русскоговорящего, который учит новогреческий.
На входе слово или фраза на русском, греческом, английском или другом языке. Верни JSON:
gr — греческий вариант (существительные с артиклем ο/η/το, глаголы в 1 л. ед. ч. настоящего времени, фразы как есть);
если вход не греческий, gr — греческий ПЕРЕВОД его смысла, а не греческое слово, похожее на него написанием или звучанием;
ru — короткий русский перевод (1–3 варианта через запятую);
tr — произношение gr русскими буквами, слоги через дефис, ударный слог ЗАГЛАВНЫМИ (пример: и ка-ли-МЭ-ра);
ex — короткий простой пример на греческом с этим словом;
exRu — перевод примера;
forms — краткая грамматика: у существительного мн. число с артиклем («мн.: οι θάλασσες»), у глагола аорист и будущее
(«аор.: έφαγα · буд.: θα φάω»), у прилагательного м/ж/ср («καλός, καλή, καλό»); для остального пустая строка;
emoji — один эмодзи, лучше всего передающий смысл.
Вход: `;
const noKey = () => Object.assign(new Error('нет ключа'), { status: 401 });
const google = (url, body, k) => { if (!k) throw noKey(); return post(url + '?key=' + encodeURIComponent(k), body); };
async function post(url, body, headers = {}) {
  const r = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
    signal: AbortSignal.timeout(12000)
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.error?.message || r.status), { status: r.status });
  return j;
}
const fields = ['gr', 'ru', 'tr', 'ex', 'exRu', 'forms', 'emoji'];
// one model call → { txt, why }: the raw JSON text and the stop reason (shown when the text isn't JSON)
async function gemini(model, thinkingConfig, text, k) {
  const S = { type: 'STRING' };
  const j = await google(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    contents: [{ parts: [{ text: PROMPT + text }] }],
    generationConfig: { responseMimeType: 'application/json', thinkingConfig,
      responseSchema: { type: 'OBJECT', properties: Object.fromEntries(fields.map(f => [f, S])), required: fields } }
  }, k);
  const out = j.candidates?.[0]; // text parts only, no thoughts
  return { txt: (out?.content?.parts ?? []).filter(p => !p.thought).map(p => p.text ?? '').join(''), why: out?.finishReason };
}
async function openai(model, opt, text, k) {
  const j = await post('https://api.openai.com/v1/chat/completions', {
    model, ...opt, messages: [{ role: 'user', content: PROMPT + text }],
    response_format: { type: 'json_schema', json_schema: { name: 'card', strict: true, schema: {
      type: 'object', properties: Object.fromEntries(fields.map(f => [f, { type: 'string' }])), required: fields, additionalProperties: false } } }
  }, { Authorization: 'Bearer ' + k }).catch(async e => {
    if (e.status || e.name === 'TimeoutError') throw e;
    // OpenAI's POST errors (bad key, no money) lack CORS headers, so the browser says only «Failed to fetch»;
    // GET /models does carry them: it tells a bad key from real offline. Key fine → it's the account (quota) or the request.
    const r = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: 'Bearer ' + k }, signal: AbortSignal.timeout(5000) }).catch(() => null);
    if (!r) throw e;
    if (!r.ok) throw Object.assign(new Error((await r.json().catch(() => ({}))).error?.message || r.status), { status: r.status });
    throw Object.assign(new Error('OpenAI не принял запрос, хотя ключ рабочий. Скорее всего, на твоём аккаунте OpenAI кончились деньги или упёрся лимит — проверь баланс: platform.openai.com/settings/organization/billing. Реже — OpenAI убрал модель, тогда нужно обновить приложение'), { status: 502 });
  });
  const out = j.choices?.[0];
  return { txt: out?.message?.content ?? '', why: out?.finish_reason };
}
// Errors without .status are network trouble: callers park the word. Offline it waits for 'online'; online it means the
// service didn't answer (timeout, or fetch failed anyway): .noAnswer says so, the word waits for a retry by hand or the next start.
async function ask(text) {
  const p = ai(), [name] = AI[p], k = key(), call = p === 'openai' ? openai : gemini, tries = p === 'openai' ? OTRIES : TRIES;
  if (!k) throw Object.assign(new Error(`нет ключа ${name} — вставь его в аккаунте`), { status: 401 });
  for (const [i, [model, opt]] of tries.entries()) {
    try {
      const t0 = performance.now();
      const { txt: raw, why } = await call(model, opt, text, k);
      ask.took = `${name} ${sec(t0)} (${model.replace('gemini-', '').replace('-latest', '')}${i ? ', попытка ' + (i + 1) : ''})`;
      // without a ```json fence; anything unreadable is a model error, not «no network»
      const txt = raw.replace(/^\s*```(?:json)?|```\s*$/g, '').trim();
      try { return JSON.parse(txt); }
      catch { throw Object.assign(new Error(`${name} ответил не JSON (${why || txt.slice(0, 60) || 'пусто'})`), { status: 502 }); }
    } catch (e) {
      // overload/bad param/unreadable answer/too slow → next model; real offline (fetch itself failed) goes to the queue
      const retryable = e.status ? [400, 404, 429, 500, 502, 503].includes(e.status) : e.name === 'TimeoutError';
      if (!e.status && navigator.onLine) e = Object.assign(new Error(e.name === 'TimeoutError' ? `${name} не ответил` : `${name} недоступен (${e.message})`), { noAnswer: true });
      if (i === tries.length - 1 || !retryable) {
        if (e.status && !String(e.message).startsWith(name)) e.message = `${name}: ${e.message}`; // the dictionary shows whose key/answer failed
        throw e;
      }
      await new Promise(r => setTimeout(r, 800 * i));
    }
  }
}
export const tts = async text => { if (!key('tts')) throw new Error('нет ключа'); return (await google('https://texttospeech.googleapis.com/v1/text:synthesize', {
  input: { text }, voice: { languageCode: 'el-GR' }, audioConfig: { audioEncoding: 'MP3' }
}, key('tts'))).audioContent; };

// Same word again soon (cancelled preview, retyped) → the card from the Cache API instead of another AI call. sw.js caches only same-origin fetches under 'v1', so 'cards' is ours.
const TTL = 5 * 6e4; // 5 minutes
const cacheKey = text => new URL('card-cache?q=' + encodeURIComponent(text.trim().toLowerCase().normalize('NFC').replace(/\s+/g, ' ')), location.href).href;
// any failure (no `caches` outside a secure context, quota) just skips the cache, never the card
// ponytail: no pruning — expired entries are deleted on lookup and the cache is small; sweep cache.keys() if it grows
async function cached(text) {
  try {
    const cache = await caches.open('cards'), k = cacheKey(text), r = await cache.match(k);
    if (!r) return;
    const { at, c } = await r.json();
    if (Date.now() - at < TTL) return c;
    await cache.delete(k);
  } catch {}
}
// serialized before the first await, so the caller's later edits to c don't leak in
const keep = async (text, c) => { const v = JSON.stringify({ at: Date.now(), c }); try { await (await caches.open('cards')).put(cacheKey(text), new Response(v)); } catch {} };

// «Отмена» on a preview: a bad card shouldn't come back from the cache
export const forget = text => globalThis.caches?.open('cards').then(c => c.delete(cacheKey(text))).catch(() => {});

// Full card content from a word: AI text, then both recordings in parallel.
export async function build(text, step = () => {}) {
  const hit = await cached(text);
  if (hit) return { c: hit, note: 'Из кеша' };
  step('Переводим…');
  const c = await ask(text);
  step('Записываем произношение…');
  const t0 = performance.now();
  const [a, ea, fa] = await Promise.allSettled([tts(c.gr), tts(c.ex), formsText(c) && tts(formsText(c))]);
  c.audio = a.value; c.exAudio = ea.value; c.formsAudio = fa.value || undefined; // undefined: iOS voice plays instead
  const timing = `${ask.took} · озвучка ${sec(t0)}`; // shown under the preview to see where time goes
  if (c.gr) keep(text, c); // not awaited
  return { c, note: a.reason ? `Озвучка голосом iOS (Cloud TTS: ${a.reason.message}) · ${timing}` : timing };
}
