import { tts } from './api.js';
import { save } from './store.js';

export function play(audio, text) {
  if (audio) return new Audio('data:audio/mpeg;base64,' + audio).play().catch(() => {});
  const u = new SpeechSynthesisUtterance(text); // fallback: iOS voice
  u.lang = 'el-GR';
  speechSynthesis.speak(u);
}
export const say = c => play(c.audio, c.gr);
// Greek words only from the grammar line: "аор.: έφαγα · буд.: θα φάω" → "έφαγα, θα φάω"
export const formsText = c => c.forms?.match(/[\p{Script=Greek}\p{M}]+(?:\s+[\p{Script=Greek}\p{M}]+)*/gu)?.join(', ') || '';
export function sayPart(c, k, text) {
  play(c[k], text);
  // older cards lack this recording: speak with iOS now, fetch Google audio for next time
  if (!c[k] && text) tts(text).then(a => { c[k] = a; save(c); }).catch(() => {});
}
