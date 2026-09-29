// Persistent booking store on Upstash Redis (REST, no TCP needed in serverless).
// If UPSTASH_REDIS_REST_URL/TOKEN are missing, every function here degrades to
// "not configured" and callers fall back to the old email-only behavior, so the
// site keeps working before the clinic connects a database.

const URL = () => process.env.UPSTASH_REDIS_REST_URL || '';
const TOKEN = () => process.env.UPSTASH_REDIS_REST_TOKEN || '';

export function storeConfigured(): boolean {
  return URL() !== '' && TOKEN() !== '';
}

async function cmd<T>(...parts: (string | number)[]): Promise<T | null> {
  if (!storeConfigured()) return null;
  try {
    const path = parts.map((p) => encodeURIComponent(String(p))).join('/');
    const res = await fetch(`${URL()}/${path}`, {
      headers: { Authorization: `Bearer ${TOKEN()}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.result ?? null) as T | null;
  } catch {
    return null;
  }
}

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

export interface SlotHold {
  start: string; // HH:MM
  durationMin: number;
}

const slotKey = (dentistId: string, dateISO: string) => `slots:${dentistId}:${dateISO}`;
const bookingKey = (reference: string) => `booking:${reference}`;

function parseMember(m: string): SlotHold | null {
  const [start, dur] = m.split(':');
  if (!/^\d{2}:\d{2}$/.test(start)) return null;
  const durationMin = parseInt(dur, 10);
  if (!durationMin || durationMin <= 0 || durationMin > 240) return null;
  return { start, durationMin };
}

function overlaps(a: SlotHold, b: SlotHold): boolean {
  const a0 = toMin(a.start);
  const a1 = a0 + a.durationMin;
  const b0 = toMin(b.start);
  const b1 = b0 + b.durationMin;
  return a0 < b1 && b0 < a1;
}

/** All holds for a dentist on a date. Empty array when unconfigured or none. */
export async function getHolds(dentistId: string, dateISO: string): Promise<SlotHold[]> {
  const members = await cmd<string[]>( 'smembers', slotKey(dentistId, dateISO));
  if (!members) return [];
  return members
    .map(parseMember)
    .filter((h): h is SlotHold => h !== null);
}

/** True when [start, start+duration) collides with any hold. */
export async function isTaken(
  dentistId: string,
  dateISO: string,
  start: string,
  durationMin: number
): Promise<boolean> {
  const holds = await getHolds(dentistId, dateISO);
  const want: SlotHold = { start, durationMin };
  return holds.some((h) => overlaps(h, want));
}

/**
 * Atomically claim a slot. SADD returns 1 only when the exact member is new,
 * so double-submits of the same slot are safe. Returns false when taken
 * (overlap) or the store is unreachable.
 */
export async function claimSlot(
  dentistId: string,
  dateISO: string,
  start: string,
  durationMin: number
): Promise<boolean> {
  if (!storeConfigured()) return false;
  if (await isTaken(dentistId, dateISO, start, durationMin)) return false;
  const added = await cmd<number>('sadd', slotKey(dentistId, dateISO), `${start}:${durationMin}`);
  if (added !== 1) return false;
  // Stale day-keys expire on their own (90 days).
  await cmd('expire', slotKey(dentistId, dateISO), 60 * 60 * 24 * 90);
  return true;
}

/** Free a previously claimed slot. No-op when unconfigured. */
export async function releaseSlot(
  dentistId: string,
  dateISO: string,
  start: string,
  durationMin: number
): Promise<void> {
  if (!storeConfigured()) return;
  await cmd('srem', slotKey(dentistId, dateISO), `${start}:${durationMin}`);
}

export interface StoredBooking {
  reference: string;
  treatment: string;
  dentist: string;
  date: string;
  time: string;
  durationMin: number;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
}

export async function saveBooking(b: StoredBooking): Promise<void> {
  if (!storeConfigured()) return;
  await cmd('set', bookingKey(b.reference), JSON.stringify(b), 'EX', 60 * 60 * 24 * 90);
}

export async function getBooking(reference: string): Promise<StoredBooking | null> {
  const raw = await cmd<string>('get', bookingKey(reference.toUpperCase()));
  if (!raw || typeof raw !== 'string') return null;
  try {
    const b = JSON.parse(raw) as StoredBooking;
    if (!b || b.reference !== reference.toUpperCase()) return null;
    return b;
  } catch {
    return null;
  }
}

export async function deleteBooking(reference: string): Promise<void> {
  if (!storeConfigured()) return;
  await cmd('del', bookingKey(reference.toUpperCase()));
}
