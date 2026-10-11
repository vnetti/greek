// Forgiving dictionary search. plain(): case, accents, ς, article and punctuation don't matter.
// phon(): one loose Latin sound key shared by Greek, Cyrillic transcription and Latin, so «таласса», «thalasa» and «θάλασσα» collide.
// relayout(): the query as if typed with another of the three keyboard layouts active (same key positions).
const KB = ["qwertyuiop[]asdfghjkl;'zxcvbnm,.", 'йцукенгшщзхъфывапролджэячсмитьбю', ";ςερτυθιοπ[]ασδφγηξκλ΄'ζχψωβνμ,."];
const relayout = q => KB.flatMap((a, i) => KB.filter((_, j) => j !== i).map(b => [...q].map(ch => a.includes(ch) ? b[a.indexOf(ch)] : ch).join('')));
const plain = s => (s || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/ς/g, 'σ').trim()
  .replace(/^(ο\/η|η\/ο|οι|ο|η|το|τα|о\/и|и\/о|о|и|то|та)\s+/, '').replace(/[-‐'’]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const LAT = { ξ: 'ks', ψ: 'ps', ц: 'ts', ч: 'ts', ш: 's', щ: 's', ю: 'iu', я: 'ia' };
[['αβγδεζηθικλμνοπρστυφχω', 'avgdezitiklmnoprstifho'], ['абвгдежзийклмнопрстуфхыэ', 'abvgdezziiklmnoprstufhie']]
  .forEach(([a, b]) => [...a].forEach((c, i) => LAT[c] = b[i]));
const SOUND = [[/[kc]h/g, 'h'], [/th/g, 't'], [/dh/g, 'd'], [/ph/g, 'f'], [/x/g, 'ks'], [/[cq]/g, 'k'], [/w/g, 'o'], [/[yj]/g, 'i'],
  [/([ae])u/g, '$1v'], [/ou|oo/g, 'u'], [/ee/g, 'i'], [/ai/g, 'e'], [/[eo]i/g, 'i'], [/([ae])v/g, '$1f'],
  [/m[pb]/g, 'b'], [/n[td]/g, 'd'], [/ng|gk/g, 'g'], [/tz/g, 'dz'], [/(.)\1+/g, '$1']];
const phon = (p, front) => SOUND.reduce((s, [re, to]) => s.replace(re, to), [...p.replace(/ου/g, 'u').replace(/([αεη])υ/g, '$1β')
  .replace(/γ(?=[εηιυ]|αι|ει|οι)/g, front ? 'y' : 'γ')].map(c => LAT[c] ?? c).join('').replace(/[^a-z0-9]/g, ''));
export const searchKeys = c => {
  const g = plain(c.gr || c.text), t = plain(c.tr);
  return { p: [g, plain(c.ru), t].join('|'), f: [...new Set([phon(g), phon(g, true), phon(t)])].join('|') };
};
// approximate substring (Sellers): q occurs somewhere in k with at most one typo
const near = (q, k) => {
  let p = [...Array(q.length + 1).keys()];
  for (const ch of k) {
    const n = [0];
    for (let i = 1; i <= q.length; i++) n[i] = Math.min(p[i] + 1, n[i - 1] + 1, p[i - 1] + (q[i - 1] !== ch));
    if (n[q.length] <= 1) return true;
    p = n;
  }
  return false;
};
// one-letter queries match plainly; longer ones also via layouts and sound, 6+ letters forgive one typo
export const matcher = raw => {
  const q = raw.trim().toLowerCase();
  if (!q) return () => true;
  const vs = q.length < 2 ? [plain(q)] : [...new Set([q, ...relayout(q)].map(plain))].filter((v, i) => !i || v.length > 1);
  const ps = q.length < 2 ? [] : [...new Set(vs.map(v => phon(v)))].filter(Boolean);
  const fz = ps[0]?.length >= 6 ? ps[0] : '';
  return k => vs.some(v => k.p.includes(v)) || ps.some(f => k.f.includes(f)) || !!fz && near(fz, k.f);
};
