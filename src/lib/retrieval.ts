// Tiny TF-IDF retrieval over the knowledge corpus. No dependencies, runs in
// serverless functions. Chunks are paragraphs; each cites its parent doc.

import { knowledgeDocs } from '../data/knowledge.ts';

export interface Chunk {
  docId: string;
  docTitle: string;
  text: string;
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s$]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

const STOP = new Set(
  'the,and,for,are,you,your,with,that,this,from,have,has,will,can,our,they,them,than,then,also,into,per,all,any,each,not,but,was,were,been,being,who,what,when,where,how,why,does,our,its,their,theirs,such,more,most,some,than,too,very,just,about,after,before,between,under,over,while,should,would,could,there,here,which,whom,whose,many,much,own,same,than,once,only,both,few,had,his,her,she,him,they,we,was,were,are,is,was,were,be,been,being,have,has,had,having,does,did,doing,would,should,could,ought,might,must,shall,will,may,need,dare,used,because,until,unless,since,though,although,even,ever,never,always,often,usually,sometimes,rarely,generally,typically,normally,please,thank,thanks,welcome,every,including,include,includes,included,using,use,used,take,takes,taking,make,makes,making,get,gets,getting,come,comes,coming,visit,visits,well,much,many,lot,may,might,must,shall,let,via,etc,ie,eg'.split(
    ','
  )
);

let cache: { chunks: Chunk[]; idf: Map<string, number> } | null = null;

export function getIndex() {
  if (cache) return cache;
  const chunks: Chunk[] = [];
  for (const doc of knowledgeDocs) {
    for (const para of doc.body.split(/\n\n+/)) {
      const text = para.trim();
      if (text.length < 40) continue;
      chunks.push({ docId: doc.id, docTitle: doc.title, text });
    }
  }
  const df = new Map<string, number>();
  for (const c of chunks) {
    for (const t of new Set(tokenize(c.text))) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const idf = new Map<string, number>();
  for (const [t, d] of df) idf.set(t, Math.log(1 + chunks.length / d));
  cache = { chunks, idf };
  return cache;
}

export interface ScoredChunk extends Chunk {
  score: number;
}

export function retrieve(query: string, k = 4): ScoredChunk[] {
  const { chunks, idf } = getIndex();
  const qTerms = tokenize(query);
  if (qTerms.length === 0) return [];
  const qCounts = new Map<string, number>();
  for (const t of qTerms) qCounts.set(t, (qCounts.get(t) ?? 0) + 1);

  const scored: ScoredChunk[] = [];
  for (const c of chunks) {
    const counts = new Map<string, number>();
    for (const t of tokenize(c.text)) counts.set(t, (counts.get(t) ?? 0) + 1);
    let dot = 0;
    let qNorm = 0;
    let cNorm = 0;
    for (const [t, qc] of qCounts) {
      const w = idf.get(t) ?? 0;
      const qw = qc * w;
      qNorm += qw * qw;
      const cw = (counts.get(t) ?? 0) * w;
      dot += qw * cw;
    }
    for (const [, cc] of counts) cNorm += cc * cc;
    // Title/tag bonus: doc tags matching query terms
    const doc = knowledgeDocs.find((d) => d.id === c.docId)!;
    const tagHits = doc.tags.filter((tag) =>
      qTerms.some((q) => tag.includes(q) || q.includes(tag))
    ).length;
    const denom = Math.sqrt(qNorm) * Math.sqrt(cNorm);
    const score = (denom > 0 ? dot / denom : 0) + tagHits * 0.35;
    if (score > 0.02) scored.push({ ...c, score });
  }
  scored.sort((a, b) => b.score - a.score);
  // Diversity: max 2 chunks per doc
  const seen = new Map<string, number>();
  const out: ScoredChunk[] = [];
  for (const s of scored) {
    const n = seen.get(s.docId) ?? 0;
    if (n >= 2) continue;
    seen.set(s.docId, n + 1);
    out.push(s);
    if (out.length >= k) break;
  }
  return out;
}

// Cheap emergency detector — short-circuits to the call CTA client-side too.
const EMERGENCY_RE =
  /(knocked|knock(ed)? out|swell(ing|en)|severe|unbearable|bleeding a lot|trauma|accident|broken tooth|excruciating|fever)/i;

export function isEmergencyQuery(q: string): boolean {
  return EMERGENCY_RE.test(q);
}
