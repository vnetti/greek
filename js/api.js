// Google APIs: Gemini makes the card text, Cloud Text-to-Speech the recordings.
import { sec } from './util.js';
import { formsText } from './audio.js';

// A translation card needs no reasoning: lite with minimal thinking is fastest. Some versions reject 'minimal' (400),
// which just moves on to lite with defaults, then full Flash with 'low' (supported by every Gemini 3 Flash).
const TRIES = [['gemini-flash-lite-latest', { thinkingLevel: 'minimal' }], ['gemini-flash-lite-latest'], ['gemini-flash-latest', { thinkingLevel: 'low' }]];

// keys are set on the account screen (or come from the shared doc, store.js loadKeys)
export const key = (n = 'key') => localStorage.getItem(n) || '';

const PROMPT = `Ты делаешь карточки для русскоговорящего, который учит новогреческий.
На входе слово или фраза на русском или греческом. Верни JSON:
gr — греческий вариант (существительные с артиклем ο/η/το, глаголы в 1 л. ед. ч. настоящего времени, фразы как есть);
ru — короткий русский перевод (1–3 варианта через запятую);
tr — произношение gr русскими буквами, слоги через дефис, ударный слог ЗАГЛАВНЫМИ (пример: и ка-ли-МЭ-ра);
ex — короткий простой пример на греческом с этим словом;
exRu — перевод примера;
forms — краткая грамматика: у существительного мн. число с артиклем («мн.: οι θάλασσες»), у глагола аорист и будущее
(«аор.: έφαγα · буд.: θα φάω»), у прилагательного м/ж/ср («καλός, καλή, καλό»); для остального пустая строка;
emoji — один эмодзи, лучше всего передающий смысл.
Вход: `;
async function google(url, body, k = key()) {
  if (!k) throw Object.assign(new Error('нет ключа'), { status: 401 });
  const r = await fetch(url + '?key=' + encodeURIComponent(k), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    signal: AbortSignal.timeout(12000)
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.error?.message || r.status), { status: r.status });
  return j;
}
// Errors without .status are network trouble (offline, timeout): callers park the word until we're online.
async function ask(text) {
  const S = { type: 'STRING' }, fields = ['gr', 'ru', 'tr', 'ex', 'exRu', 'forms', 'emoji'];
  const config = {
    responseMimeType: 'application/json',
    responseSchema: { type: 'OBJECT', properties: Object.fromEntries(fields.map(f => [f, S])), required: fields }
  };
  for (const [i, [model, thinkingConfig]] of TRIES.entries()) {
    try {
      const t0 = performance.now();
      const j = await google(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        { contents: [{ parts: [{ text: PROMPT + text }] }], generationConfig: { ...config, thinkingConfig } });
      ask.took = `Gemini ${sec(t0)} (${model.replace('gemini-', '').replace('-latest', '')}${i ? ', попытка ' + (i + 1) : ''})`;
      // text parts only (no thoughts), without a ```json fence; anything unreadable is a model error, not «no network»
      const out = j.candidates?.[0], txt = (out?.content?.parts ?? []).filter(p => !p.thought).map(p => p.text ?? '').join('')
        .replace(/^\s*```(?:json)?|```\s*$/g, '').trim();
      try { return JSON.parse(txt); }
      catch { throw Object.assign(new Error(`Gemini ответил не JSON (${out?.finishReason || txt.slice(0, 60) || 'пусто'})`), { status: 502 }); }
    } catch (e) {
      // overload/bad param/unreadable answer/too slow → next model; real offline (fetch itself failed) goes to the queue
      const retryable = e.status ? [400, 429, 500, 502, 503].includes(e.status) : e.name === 'TimeoutError';
      if (i === TRIES.length - 1 || !retryable) throw e;
      await new Promise(r => setTimeout(r, 800 * i));
    }
  }
}
export const tts = async text => { if (!key('tts')) throw new Error('нет ключа'); return (await google('https://texttospeech.googleapis.com/v1/text:synthesize', {
  input: { text }, voice: { languageCode: 'el-GR' }, audioConfig: { audioEncoding: 'MP3' }
}, key('tts'))).audioContent; };

// Full card content from a word: Gemini text, then both recordings in parallel.
export async function build(text, step = () => {}) {
  step('Переводим…');
  const c = await ask(text);
  step('Записываем произношение…');
  const t0 = performance.now();
  const [a, ea, fa] = await Promise.allSettled([tts(c.gr), tts(c.ex), formsText(c) && tts(formsText(c))]);
  c.audio = a.value; c.exAudio = ea.value; c.formsAudio = fa.value || undefined; // undefined: iOS voice plays instead
  const timing = `${ask.took} · озвучка ${sec(t0)}`; // shown under the preview to see where time goes
  return { c, note: a.reason ? `Озвучка голосом iOS (Cloud TTS: ${a.reason.message}) · ${timing}` : timing };
}
