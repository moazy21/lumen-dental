import type { APIRoute } from 'astro';

export const prerender = false;

// Reschedule / cancel requests are emailed to the clinic — request-based,
// like bookings. No slot inventory exists without a database (documented).

const emailRe = /.+@.+\..+/;

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
  const action = b.action === 'cancel' ? 'Cancellation' : 'Reschedule';
  const reference = typeof b.reference === 'string' ? b.reference.trim().toUpperCase() : '';
  const email = typeof b.email === 'string' ? b.email.trim() : '';
  const message = typeof b.message === 'string' ? b.message.trim().slice(0, 500) : '';

  if (!/^LUM-[A-Z0-9]{4}$/.test(reference)) {
    return Response.json({ error: 'Reference looks like LUM-XXXX. Please check it.' }, { status: 400 });
  }
  if (!emailRe.test(email)) {
    return Response.json({ error: 'Please add the email from your booking.' }, { status: 400 });
  }
  if (message.length < 4) {
    return Response.json({ error: 'Please add a line about what you need.' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const inbox = process.env.CLINIC_INBOX;
  const from = process.env.CLINIC_FROM ?? 'onboarding@resend.dev';
  if (!apiKey || !inbox) {
    return Response.json({ error: 'Booking email is not configured yet.' }, { status: 503 });
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `LUMEN Family Dental <${from}>`,
        to: [inbox],
        subject: `${action} request ${reference} (website)`,
        text: `${action} request from the website.\n\nReference: ${reference}\nEmail: ${email}\nDetails: ${message}\n\nPlease confirm with the patient directly.`,
        reply_to: email,
      }),
    });
    if (!res.ok) {
      return Response.json({ error: 'Could not send. Please call (303) 555-0182.' }, { status: 502 });
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Could not send. Please call (303) 555-0182.' }, { status: 502 });
  }
};
