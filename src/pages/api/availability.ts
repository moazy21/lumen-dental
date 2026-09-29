import type { APIRoute } from 'astro';
import { treatments, dentists } from '../../data/site.ts';
import { durationForTreatment, nextDays, daySlots } from '../../lib/slots.ts';
import { getHolds, storeConfigured } from '../../lib/store.ts';

export const prerender = false;

const LANES = ['osei', 'reyes', 'lindqvist'];

function overlaps(startA: string, durA: number, startB: string, durB: number): boolean {
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  return toMin(startA) < toMin(startB) + durB && toMin(startB) < toMin(startA) + durA;
}

export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get('treatment') ?? 'checkup-exam';
  const treatment = treatments.find((t) => t.slug === slug);
  if (!treatment) {
    return Response.json({ error: 'Unknown treatment.' }, { status: 400 });
  }
  const dentistParam = url.searchParams.get('dentist') ?? 'any';
  const dentist = dentists.find((d) => d.id === dentistParam) ?? dentists[0];
  const daysParam = Math.min(21, Math.max(1, parseInt(url.searchParams.get('days') ?? '14', 10) || 14));
  const durationMin = durationForTreatment(slug);
  const lanes = dentist.id === 'any' ? LANES : [dentist.id];

  const days = [];
  for (const date of nextDays(daysParam)) {
    const base = daySlots(date, durationMin);
    if (base.closed) {
      days.push({ ...base, full: false });
      continue;
    }
    let slots = base.slots;
    if (storeConfigured()) {
      const holds = (await Promise.all(lanes.map((l) => getHolds(l, date)))).flat();
      slots = base.slots.filter(
        (s) => !holds.some((h) => overlaps(s, durationMin, h.start, h.durationMin))
      );
    }
    days.push({ ...base, slots, full: slots.length === 0 });
  }
  return Response.json({
    treatment: treatment.slug,
    dentist: dentist.id,
    durationMin,
    liveInventory: storeConfigured(),
    note: storeConfigured()
      ? 'Taken times are removed automatically. Remaining times are requested, then confirmed by email.'
      : 'Request-based booking: slots shown are preferred times, confirmed by the clinic by email.',
    days,
  });
};
