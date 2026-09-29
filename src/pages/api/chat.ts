import type { APIRoute } from 'astro';
import { retrieve, isEmergencyQuery } from '../../lib/retrieval.ts';

export const prerender = false;

// Best-effort in-memory throttle. Serverless instances do not share memory,
// so this is a courtesy limit, not a security boundary. Redis-backed limiting
// is the documented upgrade path.
const hits = new Map<string, number[]>();
function throttled(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 20;
}

const EMERGENCY_REPLY = `Tooth pain, swelling, or a knocked-out tooth needs a human, not a chatbot. Call us now at (303) 555-0182 — we hold same-day emergency slots every weekday morning. If there is severe swelling, fever, or trouble swallowing, seek urgent in-person care right away.`;

const SYSTEM = `You are Lumen, the chat assistant for LUMEN Family Dental, a general family practice in Denver.
Rules:
- Answer ONLY from the provided clinic notes. If the notes do not cover it, say you do not know and suggest calling (303) 555-0182 or booking online.
- Keep answers short: 2 to 5 sentences, plain language.
- Never diagnose, never prescribe medication, never contradict the notes.
- End answers about pain, swelling, trauma, or emergencies by telling the person to call immediately.
- Mention that pricing shown is sample pricing confirmed in person when relevant.
- This is general information, not medical advice.`;

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

export const POST: APIRoute = async ({ request }) => {
  let body: { message?: unknown; history?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (message.length < 2 || message.length > 500) {
    return Response.json({ error: 'Message must be 2 to 500 characters.' }, { status: 400 });
  }
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (throttled(ip)) {
    return Response.json(
      { error: 'Too many messages. Please wait a few minutes or call (303) 555-0182.' },
      { status: 429 }
    );
  }

  if (isEmergencyQuery(message)) {
    return Response.json({ reply: EMERGENCY_REPLY, sources: ['Emergencies'] });
  }

  const chunks = retrieve(message, 4);
  if (chunks.length === 0) {
    return Response.json({
      reply:
        'I could not find that in our clinic notes. Call (303) 555-0182 and the front desk will help, or try asking about treatments, prices, kids, or opening hours.',
      sources: [],
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'Chat is not configured yet (missing OPENAI_API_KEY).' },
      { status: 503 }
    );
  }

  const history: ChatMsg[] = Array.isArray(body.history)
    ? (body.history as ChatMsg[])
        .filter(
          (m) =>
            m &&
            (m.role === 'user' || m.role === 'assistant') &&
            typeof m.content === 'string' &&
            m.content.length > 0 &&
            m.content.length <= 500
        )
        .slice(-6)
    : [];

  const context = chunks
    .map((c, i) => `[${i + 1}] (${c.docTitle}) ${c.text}`)
    .join('\n\n');

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 350,
        messages: [
          { role: 'system', content: SYSTEM },
          ...history,
          {
            role: 'user',
            content: `Clinic notes:\n${context}\n\nQuestion: ${message}\n\nAnswer from the notes only.`,
          },
        ],
      }),
    });
    if (!res.ok) {
      return Response.json(
        { error: 'The assistant is unavailable right now. Please call (303) 555-0182.' },
        { status: 502 }
      );
    }
    const data = await res.json();
    const reply: string =
      data?.choices?.[0]?.message?.content?.trim() ||
      'Sorry, I could not put that together. Please call (303) 555-0182.';
    return Response.json({
      reply,
      sources: [...new Set(chunks.map((c) => c.docTitle))],
    });
  } catch {
    return Response.json(
      { error: 'The assistant is unavailable right now. Please call (303) 555-0182.' },
      { status: 502 }
    );
  }
};
