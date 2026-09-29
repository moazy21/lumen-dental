export const site = {
  name: 'LUMEN',
  fullName: 'LUMEN Family Dental',
  tagline: 'Honest dentistry for the whole family.',
  phone: '(303) 555-0182',
  phoneHref: 'tel:+13035550182',
  address: '4180 Tennyson Street, Denver, CO 80212',
  hours: [
    ['Monday – Friday', '8:00 – 17:00'],
    ['Saturday', '9:00 – 13:00'],
    ['Sunday', 'Closed'],
  ],
  rating: '4.9',
  reviewCount: '900+',
};

export const navLinks = [
  { label: 'Treatments', href: '/treatments' },
  { label: 'About', href: '/about' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Book', href: '/book' },
];

export type Dentist = { id: string; name: string; role: string };

export const dentists: Dentist[] = [
  { id: 'any', name: 'First available', role: 'Fastest appointment' },
  { id: 'osei', name: 'Dr. Amara Osei', role: 'Lead dentist' },
  { id: 'reyes', name: 'Dr. Daniel Reyes', role: 'Dentist' },
  { id: 'lindqvist', name: 'Sarah Lindqvist', role: 'Hygienist' },
];

export type Treatment = {
  slug: string;
  title: string;
  category: 'Preventive' | 'Restorative' | 'Cosmetic' | 'Family';
  priceFrom: number;
  duration: string;
  visits: string;
  excerpt: string;
  image: string;
  benefits: string[];
};

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;

export const treatments: Treatment[] = [
  {
    slug: 'checkup-exam',
    title: 'Checkup & Exam',
    category: 'Preventive',
    priceFrom: 89,
    duration: '60 min',
    visits: '1 visit',
    excerpt: 'Full exam, digital X-rays, gum check, written plan.',
    image: img('1606811841689-23dfddce3e95'),
    benefits: ['Digital X-rays included', 'Oral cancer screening', 'Written plan with exact pricing'],
  },
  {
    slug: 'hygiene-clean',
    title: 'Hygiene Clean',
    category: 'Preventive',
    priceFrom: 129,
    duration: '45–60 min',
    visits: '1 visit',
    excerpt: 'Tartar removal, polish, gum measurements, home-care plan.',
    image: img('1588776814546-1ffcf47267a5'),
    benefits: ['Gentle, judgement-free', 'Stain polish included', 'Recall interval set for you'],
  },
  {
    slug: 'whitening',
    title: 'Professional Whitening',
    category: 'Cosmetic',
    priceFrom: 349,
    duration: '90 min',
    visits: '1 visit',
    excerpt: 'In-chair whitening, up to 8 shades, sensitivity-safe.',
    image: img('1494790108377-be9c29b29330'),
    benefits: ['Shade check before and after', 'Enamel-safe gels', 'Take-home top-up kit'],
  },
  {
    slug: 'fillings',
    title: 'Tooth-Colored Fillings',
    category: 'Restorative',
    priceFrom: 149,
    duration: '45 min',
    visits: '1 visit',
    excerpt: 'Mercury-free composite, matched to your tooth.',
    image: img('1629909613654-28e377c37b09'),
    benefits: ['Single visit, same day', 'Shade-matched composite', 'Bite checked before you leave'],
  },
  {
    slug: 'crowns',
    title: 'Crowns',
    category: 'Restorative',
    priceFrom: 799,
    duration: '2 × 60 min',
    visits: '2 visits',
    excerpt: 'Protect cracked or root-treated teeth. Natural look.',
    image: img('1629909615184-74f495363b67'),
    benefits: ['Digital impressions, no goop', 'Temporary crown same day', '5-year warranty'],
  },
  {
    slug: 'root-canal',
    title: 'Root Canal Treatment',
    category: 'Restorative',
    priceFrom: 699,
    duration: '90 min',
    visits: '1–2 visits',
    excerpt: 'Save the tooth, stop the pain. Profoundly numb throughout.',
    image: img('1606811841689-23dfddce3e95'),
    benefits: ['Numbing checked before starting', 'Most done in one visit', 'Crown plan included'],
  },
  {
    slug: 'kids-dentistry',
    title: "Kids' Dentistry",
    category: 'Family',
    priceFrom: 69,
    duration: '30–45 min',
    visits: '1 visit',
    excerpt: 'Gentle first visits from age 3. Parents stay in the room.',
    image: img('1508214751196-bcfd4ca60f91'),
    benefits: ['Short, pressure-free visits', 'Fluoride and sealants', 'Evening slots for school days'],
  },
  {
    slug: 'emergency-care',
    title: 'Emergency Care',
    category: 'Family',
    priceFrom: 99,
    duration: '30–60 min',
    visits: 'Same day',
    excerpt: 'Same-day slots every weekday morning. Call first.',
    image: img('1576091160399-112ba8d25d1d'),
    benefits: ['Same-day weekday slots', 'Pain relief first', 'Clear next steps in writing'],
  },
];

export const reviews = [
  { name: 'Hannah B.', context: 'New patient exam', text: 'First dentist visit in six years. Zero lecture, full plan in writing.' },
  { name: 'Tom R.', context: 'Root canal', text: 'Fell asleep during a root canal. I did not know that was possible.' },
  { name: 'Priya N.', context: 'Kids checkups', text: 'Both kids ask when they go back. The sticker system is undefeated.' },
  { name: 'Greg W.', context: 'Crown', text: 'Two visits, exact quote upfront, tooth looks like the others.' },
  { name: 'Maria S.', context: 'Emergency', text: 'Cracked molar at 8am, seen by 10, pain gone by lunch.' },
  { name: 'Jonas K.', context: 'Whitening', text: 'Five shades brighter, no zingers. Take-home kit keeps it there.' },
];

export const faqs = [
  { q: 'Do you take my insurance?', a: 'We work with most major PPO plans including Delta Dental, Cigna, Aetna, and MetLife. We verify benefits before treatment and file claims for you.' },
  { q: 'I am nervous about dentists. Is that okay?', a: 'Very common here. Tell us when you book: we slow down, explain each step, agree on a stop signal, and most first visits involve no treatment at all.' },
  { q: 'How fast can I be seen for pain?', a: 'We hold same-day emergency slots every weekday morning. Call (303) 555-0182 and we triage you over the phone.' },
  { q: 'Do you see children?', a: 'Yes, usually from age 3. Visits are short and pressure-free, parents stay in the room, and evening slots fit around school.' },
  { q: 'What if I need a specialist?', a: 'Braces, implants, and oral surgery go to trusted local specialists. We share records with your permission and coordinate the plan.' },
];
