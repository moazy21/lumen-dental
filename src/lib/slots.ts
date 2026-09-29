// Rule-based slot grid for booking requests. Deterministic: same input, same
// grid. Email-only persistence means availability is "request your preferred
// time", never a live-inventory guarantee — the UI must say so.

import { treatments } from '../data/site.ts';

// Opening hours by JS weekday (0=Sun). null = closed.
const HOURS: Record<number, { open: string; close: string } | null> = {
  0: null,
  1: { open: '08:00', close: '17:00' },
  2: { open: '08:00', close: '17:00' },
  3: { open: '08:00', close: '17:00' },
  4: { open: '08:00', close: '17:00' },
  5: { open: '08:00', close: '17:00' },
  6: { open: '09:00', close: '13:00' },
};

// Demo blackout dates (YYYY-MM-DD). Replace with real holidays.
const BLACKOUTS = new Set(['2026-12-25', '2026-12-26', '2027-01-01']);

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const toHHMM = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

export interface DaySlots {
  date: string; // YYYY-MM-DD
  weekday: string;
  slots: string[]; // HH:MM start times
  closed: boolean;
}

export function durationForTreatment(slug: string): number {
  const t = treatments.find((x) => x.slug === slug);
  if (!t) return 60;
  if (t.slug === 'emergency-care') return 30;
  if (t.slug === 'kids-dentistry') return 45;
  if (t.slug === 'whitening' || t.slug === 'root-canal') return 90;
  if (t.slug === 'crowns') return 60;
  return 60;
}

export function daySlots(dateISO: string, durationMin: number): DaySlots {
  const d = new Date(dateISO + 'T12:00:00');
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  const rule = HOURS[d.getDay()];
  if (!rule || BLACKOUTS.has(dateISO)) return { date: dateISO, weekday, slots: [], closed: true };
  const open = toMin(rule.open);
  const close = toMin(rule.close);
  const slots: string[] = [];
  for (let s = open; s + durationMin <= close; s += 30) slots.push(toHHMM(s));
  // Same-day: hide past slots (generous 60-min lead buffer)
  const now = new Date();
  const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
  if (dateISO === todayISO) {
    const cutoff = now.getHours() * 60 + now.getMinutes() + 60;
    return { date: dateISO, weekday, slots: slots.filter((s) => toMin(s) >= cutoff), closed: false };
  }
  return { date: dateISO, weekday, slots, closed: false };
}

export function nextDays(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    out.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(
        2,
        '0'
      )}`
    );
  }
  return out;
}

export function isValidSlot(dateISO: string, timeHHMM: string, durationMin: number): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO) || !/^\d{2}:\d{2}$/.test(timeHHMM)) return false;
  return daySlots(dateISO, durationMin).slots.includes(timeHHMM);
}

export function makeReference(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  const buf = new Uint32Array(4);
  crypto.getRandomValues(buf);
  for (const n of buf) s += chars[n % chars.length];
  return `LUM-${s}`;
}
