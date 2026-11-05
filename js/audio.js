import { tts } from './api.js';
import { save } from './store.js';

function speak(text) { // fallback: iOS voice
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'el-GR';
  speechSynthesis.speak(u);
}
export function play(audio, text) {
  if (!audio) return speak(text);
  // a broken recording falls back to the iOS voice; a blocked autoplay (NotAllowedError) would block that too
  new Audio('data:audio/mpeg;base64,' + audio).play().catch(e => e.name !== 'NotAllowedError' && speak(text));
}
// Greek words only from the grammar line: "аор.: έφαγα · буд.: θα φάω" → "έφαγα, θα φάω"
export const formsText = c => c.forms?.match(/[\p{Script=Greek}\p{M}]+(?:\s+[\p{Script=Greek}\p{M}]+)*/gu)?.join(', ') || '';
export function sayPart(c, k, text) {
  play(c[k], text);
  // card lacks this recording (Cloud TTS failed when it was made or edited): speak with iOS now, fetch Google audio for next time
  if (!c[k] && text) tts(text).then(a => { c[k] = a; if (c.id) save(c); }).catch(() => {}); // no id: unsaved preview
}
export const say = c => sayPart(c, 'audio', c.gr);
