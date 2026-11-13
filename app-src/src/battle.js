// The war: enemies, how actions damage them, the beast, boss days, gear.
import { PRAYERS } from './data';
import { keyOf, addDays, parseKey, dayIndex, weekOf } from './logic';

// item: [kind, id, fullWeight, minWeight, week]
//  kind 'h' = habit (f/m), 'p' = prayer (w/d), 'k' = fajr knots, 'x' = special flag in the day
export const ENEMIES = [
  {
    id: 'fajr', n: 'شيطان الفجر', icon: 'knot', week: 1, tint: '#3a1214',
    taunts: ['خمسة دقايق برك...', 'الفراش سخون، ارقد.', 'البرد برّا، شنوة باش تعمل؟', 'الفجر ماهوش باش يهرب، صلّيه بعد.'],
    hit: ['آآه! عقدة طاحت!', 'شكون قلّك تتوضّا؟!', 'باهي باهي... قمت.'],
    dead: 'فكّيت عقدي الكل... نرجعلك الليلة.',
    items: [['k', 'knots', 45, 0, 1], ['p', 'fajr', 40, 10, 1], ['h', 'sleep', 15, 8, 1]],
  },
  {
    id: 'khanzab', n: 'خنزب · شيطان الخشوع', icon: 'mat', week: 1, tint: '#2b1416',
    taunts: ['صلّي بالزربة، عندك خدمة.', 'تفكّر في الماتش وانت تصلّي...', 'العصر؟ مازال الوقت.'],
    hit: ['تعوّذت منّي؟!', 'صلاة أخرى في وقتها... أوف.'],
    dead: 'خمسة في وقتهم... ما عادش عندي بلاصة.',
    items: [['p', 'dhuhr', 25, 10, 1], ['p', 'asr', 25, 10, 1], ['p', 'maghrib', 25, 10, 1], ['p', 'isha', 25, 10, 1]],
  },
  {
    id: 'kasal', n: 'شيطان الكسل', icon: 'dumbbell', week: 1, tint: '#2a1a12',
    taunts: ['غدوة تعمل رياضة.', 'تعبان اليوم، تستاهل راحة.', 'شوف ريل واحد برك قبل.'],
    hit: ['عرقت؟! يا خيبة...', 'قمت من الكنابي؟!'],
    dead: 'جسدك ولّى أقوى منّي.',
    items: [['h', 'sport', 60, 30, 1], ['h', 'water', 40, 20, 2]],
  },
  {
    id: 'taswif', n: 'شيطان التسويف', icon: 'hourglass', week: 1, tint: '#241616',
    taunts: ['غدوة نبداو.', 'كمّل الفيديو هذا ومن بعد...', 'مازال الوقت، علاش مزروب؟'],
    hit: ['عملتها توا؟! موش عادتك.', 'كتبت مهمة غدوة؟! خطير.'],
    dead: 'ولّيت تعمل توا... خسرت.',
    items: [['x', 'task', 60, 0, 1], ['x', 'tom', 40, 0, 1]],
  },
  {
    id: 'nadhar', n: 'شيطان النظر', icon: 'eye', week: 2, tint: '#2e1018',
    taunts: ['شوف شوية برك، ما فيها شي.', 'سكرولي، تلقى حاجة تفرهد.', 'حلّ التليفون أول ما تقوم.'],
    hit: ['غضّيت بصرك؟! ضربتني.', 'ساعة بلا تليفون؟! ما نجّمتلكش.'],
    dead: '«قل للمؤمنين يغضّوا من أبصارهم»... خسرت المعركة.',
    items: [['h', 'phone', 50, 25, 1], ['h', 'gaze', 50, 25, 2]],
  },
  {
    id: 'ghafla', n: 'شيطان الغفلة', icon: 'book', week: 2, tint: '#1f1616',
    taunts: ['القراية ممِلّة.', 'القرآن نهار الجمعة برك.', 'عندك وقت تقرا؟'],
    hit: ['صفحة أخرى؟!', 'ورد القرآن... آه.'],
    dead: 'قلبك صحى.',
    items: [['h', 'read', 50, 25, 2], ['h', 'quran', 50, 25, 3]],
  },
  {
    id: 'khalawat', n: 'شيطان الخلوات', icon: 'flame', week: 3, tint: '#3a0e10',
    taunts: ['انت وحدك، حتى حد ما يشوف.', 'مرة برك وتوب من بعد.', 'خلّي الباب مسكّر.'],
    hit: ['عدّيت الموجة؟!', 'خرجت من البيت؟! ما لحقتكش.'],
    dead: 'الله يراك... وانت عرفت. خسرت الليلة.',
    items: [['x', 'safe', 60, 0, 3], ['x', 'sos', 40, 0, 3]],
  },
];

export const FRONTS = [
  { n: 'جبهة الأساس', d: 'الفجر، الخشوع، الكسل والتسويف' },
  { n: 'جبهة الجسد والعقل', d: 'نزيدو: النظر والغفلة' },
  { n: 'جبهة الاتجاه', d: 'نزيدو: الخلوات، وكل الأعداء مع بعضهم' },
];

export const BOSS = {
  7: { n: 'معركة الأسبوع الأول', d: 'الخمس صلوات في وقتها، والفجر في الجامع كان تنجم.' },
  14: { n: 'معركة الأسبوع الثاني', d: '3 ساعات بلا تليفون من الصباح + صفحتين قرآن.' },
  21: { n: 'المعركة الكبرى', d: 'نهار كامل: كل العادات «كاملة» وكل الصلوات في وقتها.' },
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
