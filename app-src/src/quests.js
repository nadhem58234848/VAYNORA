// Daily quests (3 per day, change every day) and the reward chest.
import { PRAYERS } from './data';

const cnt = (o, v) => Object.values(o || {}).filter((x) => x === v).length;
const POOL = [
  { id: 'fajr', icon: 'sun', t: 'صلِّ الفجر في وقتها', n: 1, w: 1, v: (d) => (d.pr && d.pr.fajr === 'w' ? 1 : 0) },
  { id: 'pr5', icon: 'mat', t: 'الصلوات الخمس في وقتها', n: 5, w: 1, v: (d) => PRAYERS.filter(([id]) => d.pr && d.pr[id] === 'w').length },
  { id: 'knots', icon: 'knot', t: 'حُلَّ العقد الثلاث', n: 3, w: 1, v: (d) => (d.knots || []).filter(Boolean).length },
  { id: 'ribat', icon: 'hourglass', t: 'رباط 25 دقيقة', n: 25, w: 1, v: (d) => d.ribat || 0 },
  { id: 'lesson', icon: 'book', t: 'أجب سؤال درس اليوم صحيحًا', n: 1, w: 1, v: (d) => (d.lesson === 'ok' ? 1 : 0) },
  { id: 'combo', icon: 'sword', t: '5 ضربات متتالية في المعركة', n: 5, w: 1, v: (d) => d.combo || 0 },
  { id: 'full3', icon: 'flame', t: '3 عادات «كاملة»', n: 3, w: 1, v: (d) => cnt(d.h, 'f') },
  { id: 'tom', icon: 'flag', t: 'اكتب مهمة الغد الوحيدة', n: 1, w: 1, v: (d) => (d.report && d.tom ? 1 : 0) },
  { id: 'task', icon: 'crown', t: 'أنجز مهمة اليوم', n: 1, w: 1, v: (d) => (d.task ? 1 : 0) },
  { id: 'adhkar', icon: 'shield', t: 'أذكار الصباح والمساء كلاهما', n: 1, w: 1, v: (d) => (d.h && d.h.adhkar === 'f' ? 1 : 0) },
  { id: 'gaze', icon: 'eye', t: 'غضّ البصر اليوم كله', n: 1, w: 2, v: (d) => (d.h && d.h.gaze === 'f' ? 1 : 0) },
  { id: 'quran', icon: 'book', t: 'وردك من القرآن كاملًا', n: 1, w: 3, v: (d) => (d.h && d.h.quran === 'f' ? 1 : 0) },
];

const hash = (s) => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };

export function questsOf(dayKey, idx, day) {
  const wk = Math.min(3, Math.ceil(idx / 7));
  const pool = POOL.filter((q) => q.w <= wk);
  let h = hash(dayKey);
  const out = [];
  while (out.length < 3) {
    const q = pool[h % pool.length];
    if (!out.includes(q)) out.push(q);
    h = (h * 1103515245 + 12345) >>> 0;
  }
  const d = day || {};
  return out.map((q) => { const cur = Math.min(q.n, q.v(d)); return { ...q, cur, done: cur >= q.n }; });
}

// Chest reward, fixed per day so reopening the app gives the same result.
export function chestOf(dayKey, shieldsNow) {
  const r = hash(dayKey + 'chest') % 10;
  if (r < 3 && shieldsNow < 2) return { shield: 1, xp: 20, t: 'درع جديد يحمي سلسلتك يومًا', icon: 'shield' };
  if (r < 6) return { xp: 50, t: '50 نقطة', icon: 'crown' };
  if (r < 9) return { xp: 30, t: '30 نقطة', icon: 'crown' };
  return { xp: 100, t: 'غنيمة كبيرة: 100 نقطة', icon: 'crown' };
}
