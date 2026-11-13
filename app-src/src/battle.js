// The war: enemies, how actions damage them, the beast, boss days, gear.
import { PRAYERS } from './data';
import { keyOf, addDays, parseKey, dayIndex, weekOf } from './logic';

// item: [kind, id, fullWeight, minWeight, week]
//  kind 'h' = habit (f/m), 'p' = prayer (w/d), 'k' = fajr knots, 'x' = special flag in the day
export const ENEMIES = [
  {
    id: 'fajr', n: 'شيطان الفجر', icon: 'knot', week: 1, tint: '#3a1214',
    taunts: ['خمس دقائق فقط...', 'الفراش دافئ، نَم.', 'البرد في الخارج، ماذا ستفعل؟', 'الفجر لن يهرب، صلِّه لاحقًا.'],
    hit: ['آه! سقطت عقدة!', 'من قال لك أن تتوضّأ؟!', 'حسنًا حسنًا... لقد قمت.'],
    dead: 'حللتَ عقدي كلها... سأعود إليك الليلة.',
    items: [['k', 'knots', 45, 0, 1], ['p', 'fajr', 40, 10, 1], ['h', 'sleep', 15, 8, 1]],
  },
  {
    id: 'khanzab', n: 'خنزب · شيطان الخشوع', icon: 'mat', week: 1, tint: '#2b1416',
    taunts: ['صلِّ بسرعة، عندك عمل.', 'تذكّر المباراة وأنت تصلّي...', 'العصر؟ ما زال الوقت.'],
    hit: ['تعوّذت منّي؟!', 'صلاة أخرى في وقتها... أُف.'],
    dead: 'خمس في وقتها... لم يبقَ لي مكان.',
    items: [['p', 'dhuhr', 25, 10, 1], ['p', 'asr', 25, 10, 1], ['p', 'maghrib', 25, 10, 1], ['p', 'isha', 25, 10, 1]],
  },
  {
    id: 'kasal', n: 'شيطان الكسل', icon: 'dumbbell', week: 1, tint: '#2a1a12',
    taunts: ['غدًا تمارس الرياضة.', 'أنت متعب اليوم، تستحق الراحة.', 'شاهد مقطعًا واحدًا فقط قبل.'],
    hit: ['تعرّقت؟! يا للخيبة...', 'قمت من الأريكة؟!'],
    dead: 'صار جسدك أقوى منّي.',
    items: [['h', 'sport', 60, 30, 1], ['h', 'water', 40, 20, 2]],
  },
  {
    id: 'taswif', n: 'شيطان التسويف', icon: 'hourglass', week: 1, tint: '#241616',
    taunts: ['غدًا نبدأ.', 'أكمل هذا الفيديو ثم...', 'ما زال الوقت، لماذا العجلة؟'],
    hit: ['فعلتها الآن؟! ليست عادتك.', 'كتبت مهمة الغد؟! خطير.'],
    dead: 'صرت تفعل الآن... خسرتُ.',
    items: [['x', 'task', 60, 0, 1], ['x', 'tom', 40, 0, 1]],
  },
  {
    id: 'nadhar', n: 'شيطان النظر', icon: 'eye', week: 2, tint: '#2e1018',
    taunts: ['انظر قليلًا فقط، لا بأس.', 'تصفّح، ستجد ما يُسلّيك.', 'افتح الهاتف أول ما تستيقظ.'],
    hit: ['غضضتَ بصرك؟! أصبتني.', 'ساعة بلا هاتف؟! لم أقدر عليك.'],
    dead: '«قل للمؤمنين يغضّوا من أبصارهم»... خسرتُ المعركة.',
    items: [['h', 'phone', 50, 25, 1], ['h', 'gaze', 50, 25, 2]],
  },
  {
    id: 'ghafla', n: 'شيطان الغفلة', icon: 'book', week: 2, tint: '#1f1616',
    taunts: ['القراءة مملّة.', 'القرآن يوم الجمعة فقط.', 'هل عندك وقت لتقرأ؟'],
    hit: ['صفحة أخرى؟!', 'ورد القرآن... آه.'],
    dead: 'استيقظ قلبك.',
    items: [['h', 'read', 50, 25, 2], ['h', 'quran', 50, 25, 3]],
  },
  {
    id: 'khalawat', n: 'شيطان الخلوات', icon: 'flame', week: 3, tint: '#3a0e10',
    taunts: ['أنت وحدك، لا أحد يراك.', 'مرة واحدة فقط ثم تُب.', 'اترك الباب مغلقًا.'],
    hit: ['تجاوزتَ الموجة؟!', 'خرجتَ من الغرفة؟! لم أدركك.'],
    dead: 'الله يراك... وأنت علمت. خسرتُ الليلة.',
    items: [['x', 'safe', 60, 0, 3], ['x', 'sos', 40, 0, 3]],
  },
];

export const FRONTS = [
  { n: 'جبهة الأساس', d: 'الفجر، الخشوع، الكسل والتسويف' },
  { n: 'جبهة الجسد والعقل', d: 'نضيف: النظر والغفلة' },
  { n: 'جبهة الاتجاه', d: 'نضيف: الخلوات، وكل الأعداء معًا' },
];

export const BOSS = {
  7: { n: 'معركة الأسبوع الأول', d: 'الصلوات الخمس في وقتها، والفجر في المسجد إن استطعت.' },
  14: { n: 'معركة الأسبوع الثاني', d: '3 ساعات بلا هاتف من الصباح + صفحتان من القرآن.' },
  21: { n: 'المعركة الكبرى', d: 'يوم كامل: كل العادات «كاملة» وكل الصلوات في وقتها.' },
};

export const GEAR = [
  ['belt', 'حزام', 'جندي'], ['sword', 'سيف', 'محارب'], ['shield', 'درع', 'محارب ثابت'], ['flag', 'راية', 'محارب صامد'], ['crown', 'تاج', 'قائد'],
];

const PRAY = Object.fromEntries(PRAYERS);

function itemVal(day, [kind, id, full, min]) {
  if (!day) return 0;
  if (kind === 'k') return Math.round(((day.knots || []).filter(Boolean).length / 3) * full);
  if (kind === 'p') { const v = day.pr && day.pr[id]; return v === 'w' ? full : v === 'd' ? min : 0; }
  if (kind === 'h') { const v = day.h && day.h[id]; return v === 'f' ? full : v === 'm' ? min : 0; }
  if (id === 'task') return day.task ? full : 0;
  if (id === 'tom') return day.report && day.tom ? full : 0;
  if (id === 'safe') return day.safe ? full : 0;
  if (id === 'sos') return (day.sos || 0) > 0 ? full : 0;
  return 0;
}

export const activeEnemies = (idx) => {
  const w = idx > 21 ? 3 : weekOf(idx);
  return ENEMIES.filter((e) => e.week <= w);
};

// Enemy HP today (0..100) given the day's actions. Only items active this week count.
export function enemyHP(e, day, idx) {
  const w = idx > 21 ? 3 : weekOf(idx);
  const items = e.items.filter((it) => it[4] <= w);
  const max = items.reduce((a, it) => a + it[2], 0) || 1;
  const got = items.reduce((a, it) => a + itemVal(day, it), 0);
  return Math.max(0, Math.round(100 - (got / max) * 100));
}
export const isDown = (hp) => hp <= 25;

// Beast: the commanding soul. HP 2100 over 21 days.
export function beast(state) {
  const pr = state.profile;
  const today = dayIndex(pr);
  let dmg = 0;
  for (let i = 1; i <= Math.min(today, 21); i++) {
    const k = keyOf(addDays(parseKey(pr.start), i - 1));
    const d = state.days[k];
    const es = activeEnemies(i);
    const avg = es.reduce((a, e) => a + (100 - enemyHP(e, d, i)), 0) / es.length;
    dmg += avg;
    if (d && d.boss) dmg += 100;
  }
  dmg -= (state.sos.falls || 0) * 30; // a fall heals the beast a little
  const max = 2100;
  return { hp: Math.max(0, Math.round(max - Math.max(0, dmg))), max };
}
