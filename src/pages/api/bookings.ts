import type { APIRoute } from 'astro';
import { treatments, dentists } from '../../data/site.ts';
import { durationForTreatment, isValidSlot, makeReference, daySlots } from '../../lib/slots.ts';

export const prerender = false;

// Best-effort in-memory throttle (see chat.ts for the caveat).
const hits = new Map<string, number[]>();
function throttled(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 60 * 60 * 1000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 10;
}

const emailRe = /.+@.+\..+/;

async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CLINIC_FROM ?? 'onboarding@resend.dev';
  if (!apiKey) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `LUMEN Family Dental <${from}>`,
        to: [opts.to],
        subject: opts.subject,
        text: opts.text,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({ request }) => {
  let b: Record<string, unknown>;
  try {
    b = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  // Honeypot: bots fill it, humans never see it. Pretend success.
  if (typeof b.website === 'string' && b.website.trim() !== '') {
    return Response.json({ ok: true, reference: makeReference() });
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (throttled(ip)) {
    return Response.json({ error: 'Too many requests. Please call (303) 555-0182.' }, { status: 429 });
  }

  const treatment = treatments.find((t) => t.slug === b.treatment);
  const dentist = dentists.find((d) => d.id === b.dentist);
  const name = typeof b.name === 'string' ? b.name.trim() : '';
  const phone = typeof b.phone === 'string' ? b.phone.trim() : '';
  const email = typeof b.email === 'string' ? b.email.trim() : '';
  const date = typeof b.date === 'string' ? b.date : '';
  const time = typeof b.time === 'string' ? b.time : '';
  const notes = typeof b.notes === 'string' ? b.notes.trim().slice(0, 500) : '';
  const anxious = b.anxious === true;

  if (!treatment) return Response.json({ error: 'Please choose a treatment.' }, { status: 400 });
  if (!dentist) return Response.json({ error: 'Please choose a dentist.' }, { status: 400 });
  if (name.length < 2) return Response.json({ error: 'Please add your full name.' }, { status: 400 });
  if (phone.length < 7 && !emailRe.test(email)) {
    return Response.json({ error: 'Please add a valid phone number or email.' }, { status: 400 });
  }
  const durationMin = durationForTreatment(treatment.slug);
  if (!isValidSlot(date, time, durationMin)) {
    return Response.json(
      { error: 'That time is outside opening hours. Please pick another slot.' },
      { status: 400 }
    );
  }

  const inbox = process.env.CLINIC_INBOX;
  if (!process.env.RESEND_API_KEY || !inbox) {
    return Response.json({ error: 'Booking email is not configured yet.' }, { status: 503 });
  }

  const reference = makeReference();
  const day = daySlots(date, durationMin);
  const subject = `Booking request ${reference} — ${treatment.title} on ${date} at ${time}`;
  const text = [
    `New booking request (website, request-based — please confirm with the patient).`,
    ``,
    `Reference: ${reference}`,
    `Treatment: ${treatment.title} (~${durationMin} min)`,
    `Dentist: ${dentist.name}`,
    `Preferred time: ${day.weekday} ${date} at ${time}`,
    `Patient: ${name}`,
    `Phone: ${phone || '—'}`,
    `Email: ${email || '—'}`,
    `Nervous patient: ${anxious ? 'YES — allow extra time, explain each step' : 'No'}`,
    `Notes: ${notes || '—'}`,
  ].join('\n');

  const sent = await sendEmail({ to: inbox, subject, text, replyTo: emailRe.test(email) ? email : undefined });
  if (!sent) {
    return Response.json(
      { error: 'Could not send your request. Please call (303) 555-0182.' },
      { status: 502 }
    );
  }

  // Patient copy: best effort (Resend test mode only delivers to the account owner).
  if (emailRe.test(email)) {
    await sendEmail({
      to: email,
      subject: `We received your request ${reference} — LUMEN Family Dental`,
      text: [
        `Hi ${name},`,
        ``,
        `We received your booking request and will confirm within 2 business hours:`,
        `${treatment.title} with ${dentist.name}, ${day.weekday} ${date} at ${time}.`,
        `Your reference: ${reference} (quote it if you call us).`,
        ``,
        `Need changes? Reply to this email or call (303) 555-0182.`,
        `LUMEN Family Dental, 4180 Tennyson Street, Denver`,
      ].join('\n'),
    });
  }

  return Response.json({ ok: true, reference });
};
