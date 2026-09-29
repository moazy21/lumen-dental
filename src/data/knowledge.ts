// RAG knowledge corpus for the LUMEN chat assistant.
// Each doc is chunked by paragraph at load time; chunks carry their doc title for citations.
// Demo content — replace with the real clinic's copy before client handoff.

export interface KnowledgeDoc {
  id: string;
  title: string;
  tags: string[];
  body: string;
}

export const knowledgeDocs: KnowledgeDoc[] = [
  {
    id: 'services-overview',
    title: 'Services overview',
    tags: ['services', 'treatments', 'general', 'offer'],
    body: `LUMEN Family Dental is a general family practice. We offer checkups and exams, professional hygiene cleans, tooth-colored fillings, crowns, root canal treatment, children's dentistry, professional whitening, night guards, and same-day emergency care.

We do not offer braces, Invisalign, implants, or oral surgery in house. For those we refer to trusted local specialists and share your records with your permission.

Every new patient starts with a full exam: digital X-rays, gum health check, oral cancer screening, and a written treatment plan with exact pricing before anything begins.`,
  },
  {
    id: 'pricing',
    title: 'Pricing',
    tags: ['price', 'cost', 'pricing', 'fees', 'how much'],
    body: `Sample pricing for layout. New patient exam from $89. Professional hygiene clean from $129. Tooth-colored filling from $149. Crown from $799. Root canal treatment from $699. Professional whitening from $349. Kids checkup from $69.

Exact quotes are confirmed in person after examination. Written treatment plans list every item and cost before treatment starts. LUMEN Plan members receive the member prices shown on the Pricing page, plus 15 percent off most additional treatments.

We never start treatment without your signed approval of the written plan.`,
  },
  {
    id: 'first-visit',
    title: 'Your first visit',
    tags: ['first visit', 'new patient', 'what to expect', 'nervous', 'anxiety'],
    body: `Your first visit takes about 60 minutes. It includes a full exam, digital X-rays, a gum health check, an oral cancer screening, and time to talk through your goals. Most first visits do not include treatment unless you ask for it or need urgent care.

Nervous patients are common here and explicitly welcome. Tell us when you book and we will slow down, explain each step before it happens, and agree on a stop signal you control. Noise-cancelling headphones and blankets are available on request.

Bring your ID, insurance card if you have one, and a list of current medications. Arrive 10 minutes early for paperwork, or fill it in from the confirmation email.`,
  },
  {
    id: 'kids',
    title: "Children's dentistry",
    tags: ['kids', 'children', 'child', 'family', 'pediatric'],
    body: `Yes, we see children — usually from around age 3, or earlier if you have concerns. Kids checkups from $69 include a gentle exam, clean, fluoride, and a sticker bribe system with a near-perfect success rate.

First visits for children are kept short and pressure-free: a ride in the chair, a look with the mirror, and only treatment the child agrees to. Parents stay in the room for the whole visit.

We recommend checkups every 6 months for children, plus fluoride twice a year. Sealants for molars are available from $59 per tooth and take minutes.`,
  },
  {
    id: 'emergency',
    title: 'Emergencies',
    tags: ['emergency', 'pain', 'toothache', 'broken', 'urgent', 'knocked', 'swelling'],
    body: `Tooth pain, swelling, a knocked-out tooth, or a broken tooth with sharp edges counts as an emergency. Call (303) 555-0182 immediately — we hold same-day emergency slots every weekday morning.

Knocked-out adult tooth: hold it by the crown (not the root), rinse briefly without scrubbing, keep it in milk or saliva, and reach us within 60 minutes for the best chance of saving it. Baby teeth are not reimplanted.

Until you are seen: rinse with warm salt water, use dental floss to dislodge trapped food, and take over-the-counter pain relief as directed. Do not place aspirin directly on the gum. This chat is not a substitute for professional diagnosis — severe swelling, fever, or difficulty swallowing needs urgent in-person care.`,
  },
  {
    id: 'aftercare-fillings',
    title: 'Aftercare: fillings and crowns',
    tags: ['aftercare', 'after', 'filling', 'crown', 'numb', 'sore'],
    body: `After a filling or crown: your mouth may stay numb for 2 to 4 hours. Avoid chewing on that side and skip hot drinks until feeling returns so you do not bite your cheek.

Mild sensitivity to cold for a few days is normal. If your bite feels high or uneven when the numbness wears off, call us — a 5-minute adjustment fixes it free of charge.

Temporary crowns need gentle care: avoid sticky or very hard foods on that tooth until the permanent crown is fitted, usually within 2 to 3 weeks. If a temporary crown comes off, keep it safe and call us the same day.`,
  },
  {
    id: 'aftercare-root-canal',
    title: 'Aftercare: root canal treatment',
    tags: ['aftercare', 'after', 'root canal', 'pain', 'recovery'],
    body: `After root canal treatment: soreness for 2 to 5 days is normal and usually managed with over-the-counter pain relief. The tooth may feel slightly different from its neighbors for a couple of weeks.

Avoid chewing hard foods on the treated tooth until your permanent crown or filling is placed — an uncrowned root-treated tooth can crack. Most patients return to work the same day.

Call us if pain worsens after day 3 instead of improving, if swelling appears, or if you develop a fever. These need a prompt in-person review.`,
  },
  {
    id: 'aftercare-whitening',
    title: 'Aftercare: whitening',
    tags: ['aftercare', 'after', 'whitening', 'white', 'sensitivity', 'stain'],
    body: `After professional whitening: some sensitivity for 24 to 48 hours is normal. Use sensitive-formula toothpaste and avoid very hot or cold foods for a day.

For the first 48 hours, avoid staining foods and drinks: coffee, red wine, turmeric, berries, and tobacco. White or light-colored foods are the safe choice.

Results typically last 1 to 3 years depending on diet and habits. LUMEN Plan Plus members receive annual top-up whitening at member pricing. Whitening is cosmetic and not suitable during pregnancy or for children under 16.`,
  },
  {
    id: 'insurance-plans',
    title: 'Insurance and LUMEN Plans',
    tags: ['insurance', 'plan', 'membership', 'payment', 'pay', 'cost', 'ppo', 'delta'],
    body: `We work with most major PPO plans including Delta Dental, Cigna, Aetna, and MetLife. We verify your benefits before treatment and file claims for you. Bring your card to your first visit.

No insurance? Our LUMEN Plans cover exams, cleans, and X-rays with member pricing on treatments: Essential $29 per month, Plus $49 per month, Family $119 per month for up to 4 members. No annual maximums, no waiting periods, cancel anytime with 30 days notice.

We accept card, cash, and HSA/FSA payments. Treatment over $500 can be split across visits on request. A written estimate always comes before treatment.`,
  },
  {
    id: 'hours-location',
    title: 'Hours and location',
    tags: ['hours', 'open', 'location', 'address', 'phone', 'parking', 'where'],
    body: `LUMEN Family Dental, 4180 Tennyson Street, Denver, CO 80212. Free parking in the lot behind the building, plus street parking on Tennyson.

Hours: Monday to Friday 8:00 to 17:00, Saturday 9:00 to 13:00, Sunday closed. Emergency slots are held every weekday morning — call (303) 555-0182.

Book online any time through the Book page: pick a treatment, choose a dentist and time, and we email your confirmation within 2 business hours. Prefer to talk? Call during opening hours and a human answers.`,
  },
  {
    id: 'hygiene-prevention',
    title: 'Hygiene and prevention',
    tags: ['clean', 'hygiene', 'hygienist', 'checkup', 'how often', 'prevent', 'gum'],
    body: `Most adults need a checkup and professional clean every 6 months. Patients with gum disease, braces-age teenagers, or frequent decay may need 3 to 4 month recalls — your dentist sets the interval at your exam.

A hygiene visit takes 45 to 60 minutes: plaque and tartar removal, polish, gum measurements, and personalized home-care advice. It is painless for most people; let us know about sensitivity and we will adapt.

Bleeding gums are not normal and usually signal gum inflammation, which is reversible when caught early. Do not wait for pain — book a hygiene visit if your gums bleed when brushing.`,
  },
  {
    id: 'anxiety-comfort',
    title: 'Nervous patients',
    tags: ['nervous', 'anxious', 'anxiety', 'scared', 'fear', 'phobia', 'painful', 'hurt'],
    body: `Dental anxiety is one of the most common things we see, and the whole visit is designed around it. You set the pace: we explain before we do, check in constantly, and stop the moment you raise a hand.

Practical options: morning appointments when you are freshest, noise-cancelling headphones with your own music, blankets, and breaks whenever you want one. For longer treatments we schedule extra time so nothing feels rushed.

Be honest on the booking form about anxiety — it helps us prepare, and roughly a third of our patients do the same. The first step is just a conversation; most first visits involve no treatment at all.`,
  },
];
