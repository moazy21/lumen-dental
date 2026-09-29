import type { APIRoute } from 'astro';
import { treatments } from '../../data/site.ts';
import { durationForTreatment, nextDays, daySlots } from '../../lib/slots.ts';

export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get('treatment') ?? 'checkup-exam';
  const treatment = treatments.find((t) => t.slug === slug);
  if (!treatment) {
    return Response.json({ error: 'Unknown treatment.' }, { status: 400 });
  }
  const daysParam = Math.min(21, Math.max(1, parseInt(url.searchParams.get('days') ?? '14', 10) || 14));
  const durationMin = durationForTreatment(slug);
  const days = nextDays(daysParam).map((d) => daySlots(d, durationMin));
  return Response.json({
    treatment: treatment.slug,
    durationMin,
    note: 'Request-based booking: slots shown are preferred times, confirmed by the clinic by email.',
    days,
  });
};
