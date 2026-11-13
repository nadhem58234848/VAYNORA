import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { HABITS, RANKS, CITIES, PRAYERS, WIN_DAYS } from './data';
import { activeEnemies, enemyHP, isDown } from './battle';

export const pad = (n) => String(n).padStart(2, '0');
export const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const hm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
export const toMin = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
export const fromMin = (m) => { m = ((m % 1440) + 1440) % 1440; return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`; };

export const emptyState = () => ({
  v: 1,
  profile: null, // {name, city, start}
  days: {}, // key -> {pr:{fajr:'w'|'d'|'m'}, h:{id:'f'|'m'|'x'}, win:'', lost:'', tom:'', report:bool}
  tasks: [], // {id, t, time:'HH:MM', daily:bool, done:{key:true}}
  settings: { wake: '04:30', sleep: '22:00', sport: '17:30', prayers: true, shield: true, fajr: true, sportOn: true },
  sos: { passed: 0, falls: 0 },
  orders: [],
});

export function dayIndex(profile, date = new Date()) {
  if (!profile) return 1;
  const s = parseKey(profile.start);
  const t = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((t - s) / 86400000) + 1;
}
export const weekOf = (idx) => Math.min(3, Math.max(1, Math.ceil(idx / 7)));
export const activeHabits = (idx) => HABITS.filter((h) => h.week <= weekOf(Math.min(idx, 21)) || idx > 21);

export function prayerTimes(cityName, date = new Date()) {
  const c = CITIES.find((x) => x[0] === cityName) || CITIES[0];
  const p = CalculationMethod.MuslimWorldLeague();
  p.fajrAngle = 18; p.ishaAngle = 18; // angles used for Tunisia
  const pt = new PrayerTimes(new Coordinates(c[1], c[2]), date, p);
  return { fajr: pt.fajr, sunrise: pt.sunrise, dhuhr: pt.dhuhr, asr: pt.asr, maghrib: pt.maghrib, isha: pt.isha };
}

// Is a day "won"? every enemy of that day is down.
export function dayWon(day, idx) {
  if (!day) return false;
  return activeEnemies(idx).every((e) => isDown(enemyHP(e, day, idx)));
}

export function dayXP(day, idx) {
  if (!day) return 0;
  let xp = 0;
  PRAYERS.forEach(([id]) => { const v = day.pr && day.pr[id]; if (v === 'w') xp += 10; else if (v === 'd') xp += 5; });
  activeHabits(idx).forEach((h) => { const v = day.h && day.h[h.id]; if (v === 'f') xp += 10; else if (v === 'm') xp += 5; });
  xp += (day.knots || []).filter(Boolean).length * 5;
  if (day.task) xp += 10;
  if (day.lesson === 'ok') xp += 10;
  xp += Math.min(60, day.ribat || 0);
  if (day.boss) xp += 50;
  if (day.report) xp += 15;
  if (dayWon(day, idx)) xp += 30;
  return xp;
}

export function stats(state) {
  const pr = state.profile;
  const today = new Date();
  const todayIdx = dayIndex(pr, today);
  let xp = state.sos.passed * 20, won = 0, chain = 0, best = 0, prevLost = false, fajrRun = 0, fajrDays = 0, adhRun = 0, shields = 0, usedShields = 0;
  const list = [];
  for (let i = 1; i <= todayIdx; i++) {
    const k = keyOf(addDays(parseKey(pr.start), i - 1));
    const d = state.days[k];
    const w = dayWon(d, i);
    xp += dayXP(d, i);
    const isToday = i === todayIdx;
    const adh = d && d.h && (d.h.adhkar === 'f' || d.h.adhkar === 'm');
    adhRun = adh ? adhRun + 1 : (isToday ? adhRun : 0);
    if (adh && adhRun % 3 === 0) shields = Math.min(2, shields + 1);
    if (w) { won++; chain++; prevLost = false; }
    else if (!isToday) {
      if (shields > 0) { shields--; usedShields++; }
      else { if (prevLost) chain = 0; prevLost = true; }
    }
    best = Math.max(best, chain);
    const fj = d && d.pr && d.pr.fajr === 'w';
    if (fj) { fajrRun++; fajrDays++; } else if (!isToday) fajrRun = 0;
    list.push({ i, k, won: w, today: isToday, fajr: fj });
  }
  let rank = RANKS[0][1], next = null;
  RANKS.forEach(([min, n], j) => { if (xp >= min) { rank = n; next = RANKS[j + 1] || null; } });
  const first21 = list.slice(0, 21).filter((x) => x.won).length;
  const badges = [
    ['🌅', '7 أيام فجر ورا بعضهم', fajrRun >= 7],
    ['🔗', 'سلسلة 7 أيام', best >= 7],
    ['📝', 'أول تقرير ليلي', Object.values(state.days).some((d) => d.report)],
    ['🛡️', 'عدّيت 3 موجات', state.sos.passed >= 3],
    ['⚔️', 'ربحت 21 يوم', first21 >= 21],
  ];
  return { shields, usedShields, todayIdx, xp, won, chain, best, fajrRun, fajrDays, list, rank, next, badges, first21, certified: todayIdx >= 21 && first21 >= WIN_DAYS };
}
