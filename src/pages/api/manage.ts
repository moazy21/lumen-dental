import type { APIRoute } from 'astro';
import { isValidSlot } from '../../lib/slots.ts';
import {
  claimSlot,
  deleteBooking,
  getBooking,
  releaseSlot,
  saveBooking,
  storeConfigured,
} from '../../lib/store.ts';

export const prerender = false;

const emailRe = /.+@.+\..+/;

async function emailClinic(subject: string, text: string, replyTo?: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const inbox = process.env.CLINIC_INBOX;
  const from = process.env.CLINIC_FROM ?? 'onboarding@resend.dev';
  if (!apiKey || !inbox) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `LUMEN Family Dental <${from}>`,
        to: [inbox],
        subject,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
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
  if (typeof b.website === 'string' && b.website.trim() !== '') {
    return Response.json({ ok: true });
  }
  const action = b.action === 'cancel' ? 'cancel' : 'reschedule';
  const reference = typeof b.reference === 'string' ? b.reference.trim().toUpperCase() : '';
  const email = typeof b.email === 'string' ? b.email.trim() : '';
  const phone = typeof b.phone === 'string' ? b.phone.trim() : '';
  const message = typeof b.message === 'string' ? b.message.trim().slice(0, 500) : '';
  const newDate = typeof b.newDate === 'string' ? b.newDate : '';
  const newTime = typeof b.newTime === 'string' ? b.newTime : '';

  if (!/^LUM-[A-Z0-9]{4}$/.test(reference)) {
    return Response.json({ error: 'Reference looks like LUM-XXXX. Please check it.' }, { status: 400 });
  }
  if (!emailRe.test(email) && phone.length < 7) {
    return Response.json({ error: 'Please add the email or phone from your booking.' }, { status: 400 });
  }

  // Real path: booking exists in the store — cancel/reschedule for real.
  const stored = storeConfigured() ? await getBooking(reference) : null;
  const matches =
    stored &&
    ((emailRe.test(email) && stored.email.toLowerCase() === email.toLowerCase()) ||
      (phone.length >= 7 && stored.phone === phone));
  if (stored && !matches) {
    return Response.json(
      { error: 'Those details do not match this reference. Please check and retry.' },
      { status: 403 }
    );
  }

  if (stored && matches) {
    if (action === 'cancel') {
      await releaseSlot(stored.dentist, stored.date, stored.time, stored.durationMin);
      await deleteBooking(reference);
      await emailClinic(
        `Cancelled ${reference} (website)`,
        `Booking ${reference} was cancelled online by the patient.\n\nWas: ${stored.date} at ${stored.time} (${stored.treatment}).\nPatient: ${stored.name} — ${stored.phone || stored.email}\n\nThe slot is free again automatically.`,
        emailRe.test(email) ? email : undefined
      );
      return Response.json({ ok: true, cancelled: true });
    }
    // Reschedule with a concrete new time: move the hold atomically-ish.
    if (newDate && newTime) {
      if (!isValidSlot(newDate, newTime, stored.durationMin)) {
        return Response.json({ error: 'That new time is outside opening hours.' }, { status: 400 });
      }
      await releaseSlot(stored.dentist, stored.date, stored.time, stored.durationMin);
      const claimed = await claimSlot(stored.dentist, newDate, newTime, stored.durationMin);
      if (!claimed) {
        // Roll back: re-claim the original slot.
        await claimSlot(stored.dentist, stored.date, stored.time, stored.durationMin);
        return Response.json(
          { error: 'That new time just filled. Your original booking is untouched.' },
          { status: 409 }
        );
      }
      await saveBooking({ ...stored, date: newDate, time: newTime });
      await emailClinic(
        `Rescheduled ${reference} (website)`,
        `Booking ${reference} moved online by the patient.\n\nWas: ${stored.date} at ${stored.time}.\nNow: ${newDate} at ${newTime} (${stored.treatment}).\nPatient: ${stored.name} — ${stored.phone || stored.email}`,
        emailRe.test(email) ? email : undefined
      );
      return Response.json({ ok: true, rescheduled: true, date: newDate, time: newTime });
    }
  }

  // Fallback: email-only request (unknown reference, e.g. pre-database bookings).
  if (message.length < 4) {
    return Response.json({ error: 'Please add a line about what you need.' }, { status: 400 });
  }
  const label = action === 'cancel' ? 'Cancellation' : 'Reschedule';
  const sent = await emailClinic(
    `${label} request ${reference} (website)`,
    `${label} request from the website.\n\nReference: ${reference}\nEmail: ${email}\nPhone: ${phone}\nDetails: ${message}\n\nPlease confirm with the patient directly.`,
    emailRe.test(email) ? email : undefined
  );
  if (!sent) {
    return Response.json({ error: 'Could not send. Please call (303) 555-0182.' }, { status: 502 });
  }
  return Response.json({ ok: true });
};
