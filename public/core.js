export function validDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s+'T12:00:00Z');
  return !isNaN(d) && d.toISOString().slice(0,10) === s;
}
export function marker(line) {
  // Only dedicated date headings or timestamps at the start of a line count.
  const clean = line.trim().replace(/^#{1,6}\s*/, '').replace(/^\*\*|\*\*$/g, '');
  const m = clean.match(/^(?:(?:IN[IÍ]CIO DO DIA|DATA|DIA)\s*:?\s*)?\[?(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})\]?(?=$|\s+\d{2}:\d{2}(?::\d{2})?(?:\s|$))/i);
  if (!m) return null;
  const s = m[1].includes('/') ? m[1].split('/').reverse().join('-') : m[1];
  return validDate(s) ? s : null;
}
export function filterDay(text, day) {
  if (!validDate(day)) throw new Error('Escolha uma data válida.');
  let current = null, found = false, unknown = 0;
  const lines = [];
  for (const line of text.split(/\r?\n/)) {
    const date = marker(line);
    if (date) { current = date; found = true; }
    if (current === day) lines.push(line);
    if (!current && line.trim()) unknown++;
  }
  return {text: lines.join('\n').trim(), found, unknown};
}
export function basicSummary(text, count = 7) {
  const sentences = text.split(/\n+|(?<=[.!?])\s+/u).map(s=>s.trim()).filter(s=>s && !marker(s) && !/^(?:você disse|you said|chatgpt disse|chatgpt said|assistant|user)\s*:?$/i.test(s));
  if (!sentences.length) return [];
  const stop = new Set('para como uma que com por dos das não sim isso esse essa você ele ela foi são mais muito também sobre pelo pela'.split(' '));
  const words = s => s.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu)?.filter(w=>!stop.has(w)) || [];
  const freq = new Map();
  for (const s of sentences) for (const w of new Set(words(s))) freq.set(w,(freq.get(w)||0)+1);
  const seen = new Set();
  const ranked = sentences.map((s,i)=>({s,i,score:words(s).reduce((n,w)=>n+(freq.get(w)||0),0)/Math.sqrt(Math.max(1,words(s).length))})).filter(x=>{if(seen.has(x.s)) return false; seen.add(x.s);return true;});
  return ranked.sort((a,b)=>b.score-a.score).slice(0,count).sort((a,b)=>a.i-b.i).map(x=>x.s);
}
