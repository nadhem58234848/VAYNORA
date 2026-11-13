// Day battle: one enemy per screen (Duolingo lesson style), then the victory screen.
import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Image, Animated, ScrollView, StyleSheet, Platform, TextInput, Share } from 'react-native';
import * as Haptics from 'expo-haptics';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import Icon from './icons';
import { sfx } from './sfx';
import Lesson from './Lesson';
import Quests from './Quests';
import Svg, { Path as SP } from 'react-native-svg';
import { C, PRAYERS, HABITS, MSG, MSG_AFTER, TASK, RANKS } from './data';
import { keyOf, dayIndex, weekOf, dayXP, stats, prayerTimes, hm, addDays, activeHabits, parseKey, dayWon } from './logic';
import { activeEnemies, enemyHP, isDown, beast, GEAR, nafsStage } from './battle';
import { EnemyArt, Bar, POSE } from './Battle';

const PRAY = Object.fromEntries(PRAYERS);
const HAB = Object.fromEntries(HABITS.map((h) => [h.id, h]));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const T = ({ s = 15, b, style, children }) => (
  <Text style={[{ color: C.bone, fontFamily: b ? 'C8' : 'C6', fontSize: s, textAlign: 'right', writingDirection: 'rtl' }, style]}>{children}</Text>
);
const buzz = () => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {}); };

// Big Duolingo-style option
const Opt = ({ title, dmg, on, onPress, color = C.red }) => (
  <Pressable onPress={onPress} style={[st.opt, on && { borderColor: color, backgroundColor: color === C.red ? '#2a1214' : '#1d1b19' }]}>
    <T s={15} b={on} style={{ flex: 1 }}>{title}</T>
    {on ? <T s={13} style={{ color: C.muted }}>🔒</T> : !!dmg && <T b s={14} style={{ color: C.red }}>-{dmg}</T>}
  </Pressable>
);

function Questions({ e, day, idx, set, city }) {
  const w = Math.min(3, Math.ceil(idx / 7));
  const items = e.items.filter((it) => it[4] <= w);
  const pt = prayerTimes(city);
  return items.map((it) => {
    const [kind, id, full, min] = it;
    if (kind === 'k') {
      const kn = day.knots || [false, false, false];
      const names = ['🤲 ذكرت الله حين استيقظت', '💧 توضّأت', '🕌 صلّيت'];
      return (
        <View key={id} style={{ marginBottom: 6 }}>
          <T b s={18} style={{ textAlign: 'center' }}>حُلَّ العقد الثلاث</T>
          <T s={11} style={{ color: C.muted, textAlign: 'center', marginBottom: 4 }}>«يعقد الشيطان على قافية رأس أحدكم إذا هو نام ثلاث عقد» (البخاري 1142)</T>
          {names.map((n, i) => <Opt key={i} title={(kn[i] ? '✓ ' : '') + n} dmg={15} on={kn[i]} onPress={() => !kn[i] && set((d) => { d.knots = [...kn]; d.knots[i] = true; }, true)} />)}
        </View>
      );
    }
    if (kind === 'p') {
      const v = day.pr && day.pr[id];
      return (
        <View key={id} style={{ marginBottom: 6 }}>
          <T b s={16}>{PRAY[id]} <T s={12} style={{ color: C.muted }}>· {hm(pt[id])}</T></T>
          <View style={st.two}>
            <View style={{ flex: 1 }}><Opt title="في وقتها" dmg={full} on={v === 'w'} onPress={() => !v && set((d) => { d.pr = d.pr || {}; d.pr[id] = 'w'; }, true)} /></View>
            <View style={{ flex: 1 }}><Opt title="في يومها" dmg={min} on={v === 'd'} color={C.amber} onPress={() => !v && set((d) => { d.pr = d.pr || {}; d.pr[id] = 'd'; }, true)} /></View>
          </View>
        </View>
      );
    }
    if (kind === 'h') {
      const h = HAB[id]; const v = day.h && day.h[id];
      return (
        <View key={id} style={{ marginBottom: 6 }}>
          <T b s={16}>{h.t}</T>
          <Opt title={'💪 كاملة · ' + h.full} dmg={full} on={v === 'f'} onPress={() => !v && set((d) => { d.h = d.h || {}; d.h[id] = 'f'; }, true)} />
          <Opt title={'على الأقل · ' + h.min} dmg={min} on={v === 'm'} color={C.amber} onPress={() => !v && set((d) => { d.h = d.h || {}; d.h[id] = 'm'; }, true)} />
        </View>
      );
    }
    if (id === 'task') return <Opt key={id} title="🎯 أنجزت مهمة اليوم" dmg={full} on={!!day.task} onPress={() => !day.task && set((d) => { d.task = true; }, true)} />;
    if (id === 'safe') return <Opt key={id} title="🛡️ يومي وليلتي سالمان" dmg={full} on={!!day.safe} onPress={() => !day.safe && set((d) => { d.safe = true; }, true)} />;
    if (id === 'tom') return (
      <View key={id}>
        <T b s={16}>مهمة الغد الوحيدة</T>
        <TomInput day={day} set={set} />
      </View>
    );
    if (id === 'sos') return <T key={id} s={13} style={{ color: (day.sos || 0) > 0 ? C.green : C.muted, marginTop: 6 }}>{(day.sos || 0) > 0 ? '✓ تجاوزت موجة بزر الطوارئ اليوم' : 'إذا جاءتك موجة فزر الطوارئ يضرب هذا العدو.'}</T>;
    return null;
  });
}

function TomInput({ day, set }) {
  const [v, setV] = useState(day.tom || '');
  return (
    <View>
      <TextInput editable={!(day.report && day.tom)} value={v} onChangeText={setV} placeholder="شيء واحد، الأهم" placeholderTextColor={C.muted} style={st.input} />
      <Opt title={day.tom ? '✓ مكتوبة' : '✍️ اكتبها'} dmg={40} on={!!(day.report && day.tom)} onPress={() => v.trim() && !(day.report && day.tom) && set((d) => { d.tom = v.trim(); d.report = true; }, true)} />
    </View>
  );
}

const PRAISE = ['ضربة موفّقة!', 'أحسنت!', 'ثبّتك الله', 'هكذا يُقاتل المحارب', 'ضربة في الصميم!', 'واصل، هو يضعف'];
const MILE = { 7: 'وسام الأسبوع الأول', 14: 'وسام الأسبوعين', 21: 'وسام الواحد والعشرين', 30: 'وسام الشهر', 50: 'وسام الخمسين', 100: 'وسام المئة', 200: 'وسام المئتين', 365: 'وسام السنة' };
const DAYL = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
const FLAME_SAY = [
  'أول شعلة. من هنا تبدأ الحرب حقًّا.',
  'كنت أعلم أنك ستعود. موعدنا غدًا.',
  'ثلاثة أيام. الشيطان بدأ يحسب لك حسابًا.',
];
const flameSay = (n) => (n <= 3 ? FLAME_SAY[n - 1] : n % 7 === 0 ? `${n} يومًا! أسبوع كامل من الثبات. أحبّ الأعمال إلى الله أدومها.` : `${n} يومًا والشعلة لم تنطفئ. لا تُضيّع يومين متتاليين.`);

// Our own flame: crimson blade-shaped fire
const FlameArt = ({ size = 150 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <SP fill={C.crimson} d="M50 4C56 22 78 34 78 60C78 80 66 96 50 96C34 96 22 80 22 60C22 46 30 38 34 26C40 34 42 40 44 44C46 30 46 16 50 4Z" />
    <SP fill={C.red} d="M50 28C54 42 68 50 68 66C68 80 60 90 50 90C40 90 32 80 32 66C32 58 36 52 40 46C43 52 44 56 46 58C48 48 48 38 50 28Z" />
    <SP fill={C.bone} d="M50 58C53 66 59 70 59 78C59 85 55 89 50 89C45 89 41 85 41 78C41 73 44 69 46 66C48 70 49 72 50 74C50 68 50 63 50 58Z" />
  </Svg>
);

function Flame({ S, onNext }) {
  const s = stats(S);
  const idx = dayIndex(S.profile);
  const n = Math.max(1, s.chain);
  const grow = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const [shown, setShown] = useState(Math.max(0, n - 1));
  const nd = Platform.OS !== 'web';
  useEffect(() => {
    sfx(MILE[n] ? 'win' : 'flame');
    Animated.spring(grow, { toValue: 1, friction: 4, tension: 60, useNativeDriver: nd }).start();
    const t = setTimeout(() => { setShown(n); buzz(); }, 650);
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.06, duration: 600, useNativeDriver: nd }),
      Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: nd }),
    ])).start();
    return () => clearTimeout(t);
  }, []);
  const start = parseKey(S.profile.start);
  const wk = Math.ceil(idx / 7);
  const first = (wk - 1) * 7 + 1;
  const wonMap = Object.fromEntries(s.list.map((x) => [x.i, x.won]));
  const invite = () => Share.share({ message: `شعلتي ${n} ${n >= 3 && n <= 10 ? 'أيام' : 'يومًا'} في حرب النفس مع VAYNORA 🔥 هل تقبل التحدي؟\nhttps://nadhem58234848.github.io/VAYNORA/app/` }).catch(() => {});
  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'space-between' }}>
      <View />
      <View style={{ alignItems: 'center' }}>
        {MILE[n] && <View style={[st.row, st.mile]}><Icon name="crown" size={22} /><T b s={16}>{MILE[n]}</T></View>}
        <View style={st.bubbleBig}><T s={16} style={{ textAlign: 'center' }}>{MILE[n] ? `${MILE[n]} لك. قليل من يصل إلى هنا، فاحمد الله واثبت.` : flameSay(n)}</T></View>
        <View style={[st.row, { justifyContent: 'center', alignItems: 'flex-end', marginTop: 16 }]}>
          <Image source={POSE.win} style={{ width: 120, height: 170 }} resizeMode="contain" />
          <Animated.View style={{ transform: [{ scale: Animated.multiply(grow, pulse) }] }}><FlameArt size={150} /></Animated.View>
        </View>
        <T b s={84} style={{ color: C.red, lineHeight: 104, textAlign: 'center' }}>{shown}</T>
        <T b s={24} style={{ color: C.red, textAlign: 'center', marginTop: -8 }}>{n === 1 ? 'يوم ثبات' : n === 2 ? 'يوما ثبات' : n <= 10 ? 'أيام ثبات' : 'يوم ثبات'}</T>
        <View style={[st.row, { justifyContent: 'space-between', alignSelf: 'stretch', marginTop: 26 }]}>
          {[0, 1, 2, 3, 4, 5, 6].map((j) => {
            const d = first + j; const w = wonMap[d]; const isT = d === idx;
            return (
              <View key={d} style={{ alignItems: 'center' }}>
                <T s={13} style={{ color: isT ? C.red : C.muted, marginBottom: 4 }}>{DAYL[addDays(start, d - 1).getDay()]}</T>
                <View style={[st.dot, { width: 36, height: 36, borderRadius: 18 }, w && { backgroundColor: C.red, borderColor: C.red }, d % 7 === 0 && !w && { borderColor: C.amber }]}>
                  {w ? <T b s={15}>✓</T> : d % 7 === 0 ? <Icon name="crown" size={16} /> : null}
                </View>
              </View>
            );
          })}
        </View>
      </View>
      <View style={[st.row, { gap: 10 }]}>
        <Pressable style={[st.cta, { flex: 1, marginTop: 0 }]} onPress={() => { buzz(); sfx('tap'); onNext(); }}><T b s={18} style={{ textAlign: 'center' }}>أنا ثابت</T></Pressable>
        <Pressable style={[st.ghost, { marginTop: 0, alignSelf: 'auto', paddingHorizontal: 16 }]} onPress={invite}><Icon name="share" size={22} /></Pressable>
      </View>
    </View>
  );
}
const BOSS_DAYS = [7, 14, 21];

// ---------- Achievements card (after the day battle) ----------
const Sec = ({ title, children }) => (
  <View style={st.sec}><T b s={13} style={{ color: C.muted, marginBottom: 8 }}>{title}</T>{children}</View>
);
const Line = ({ label, value, color }) => (
  <View style={[st.row, { justifyContent: 'space-between', paddingVertical: 4 }]}><T s={14} style={{ flex: 1 }}>{label}</T><T b s={13} style={{ color: color || C.bone }}>{value}</T></View>
);

function dayFacts(S) {
  const now = new Date();
  const k = keyOf(now);
  const idx = dayIndex(S.profile);
  const day = S.days[k] || {};
  const enemies = activeEnemies(idx);
  const down = enemies.filter((x) => isDown(enemyHP(x, day, idx)));
  const s = stats(S);
  const xp = dayXP(day, idx);
  const yk = keyOf(addDays(now, -1));
  const yxp = idx > 1 ? dayXP(S.days[yk], idx - 1) : null;
  const bst = beast(S);
  const hit = Math.round(enemies.reduce((a, x) => a + (100 - enemyHP(x, day, idx)), 0) / enemies.length);
  return { k, idx, day, enemies, down, s, xp, yxp, bst, hit, won: down.length === enemies.length };
}

function DayStory({ S, refCb }) {
  const f = dayFacts(S);
  return (
    <View ref={refCb} collapsable={false} style={st.story}>
      <View style={st.storyBanner}><T b s={14} style={{ textAlign: 'center', letterSpacing: 3 }}>VAYNORA · حرب النفس</T></View>
      <T s={15} style={{ textAlign: 'center', color: C.muted, marginTop: 16 }}>اليوم {f.idx}</T>
      <T b s={54} style={{ textAlign: 'center', color: C.red, lineHeight: 70 }}>{f.s.chain}</T>
      <T b s={16} style={{ textAlign: 'center', marginTop: -6 }}>أيام في السلسلة</T>
      <T s={13} style={{ textAlign: 'center', color: C.muted, marginTop: 16 }}>أسقطتُ اليوم {f.down.length} من {f.enemies.length}</T>
      <View style={[st.row, { justifyContent: 'center', flexWrap: 'wrap', gap: 6, marginTop: 8, paddingHorizontal: 14 }]}>
        {f.enemies.map((x) => <View key={x.id} style={{ opacity: f.down.includes(x) ? 1 : 0.25 }}><EnemyArt id={x.id} size={58} /></View>)}
      </View>
      <View style={{ paddingHorizontal: 22, marginTop: 18 }}>
        <T s={12} style={{ color: C.muted, textAlign: 'center', marginBottom: 6 }}>قوة النفس {f.bst.hp}% · قوتي {f.bst.you}%</T>
        <Bar v={f.bst.hp} max={f.bst.max} h={10} />
      </View>
      <View style={{ flex: 1 }} />
      <T b s={17} style={{ textAlign: 'center' }}>اصنع من الألم قوة</T>
      <T s={13} style={{ textAlign: 'center', color: C.muted, marginTop: 2, marginBottom: 16 }}>{S.profile.name} · @vaynora_</T>
    </View>
  );
}

function Result({ S, save, close, pop }) {
  const f = dayFacts(S);
  const { idx, day, enemies, down, s, xp, yxp, bst, hit, won, k } = f;
  const [best, setBest] = useState(day.win || '');
  const [story, setStory] = useState(false);
  const cardRef = useRef(null);
  const wk = Math.ceil(idx / 7);
  const first = (wk - 1) * 7 + 1;
  const wonMap = Object.fromEntries(s.list.map((x) => [x.i, x.won]));
  const habits = HABITS.filter((h) => day.h && (day.h[h.id] === 'f' || day.h[h.id] === 'm'));
  const rankMin = (RANKS.find((r) => r[1] === s.rank) || [0])[0];
  const rankUp = rankMin > 0 && s.xp - xp < rankMin;
  const gear = GEAR.find((g) => g[2] === s.rank);
  const news = [];
  if (rankUp) news.push(['crown', `رتبة جديدة: ${s.rank}`]);
  if (rankUp && gear) news.push([gear[0], `عتاد جديد: ${gear[1]}`]);
  if (won) news.push(['shield', 'يوم مربوح يُضاف إلى سلسلتك']);
  if ((day.sos || 0) > 0) news.push(['sos', 'تجاوزت موجة اليوم (+20 نقطة)']);
  const quote = idx <= 21 ? MSG[idx - 1] : MSG_AFTER;
  const tomorrow = idx < 21 ? TASK[idx] : null;
  const stage = nafsStage(bst.hp);
  const invite = () => Share.share({ message: `أنا في اليوم ${idx} من حرب النفس مع VAYNORA ⚔️ سلسلتي ${s.chain}. هل تقبل التحدي؟\nhttps://nadhem58234848.github.io/VAYNORA/app/` }).catch(() => {});
  return (
    <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
      <T s={15} style={{ color: C.muted, textAlign: 'center' }}>اليوم {idx}</T>
      <T b s={32} style={{ color: won ? C.red : C.bone, textAlign: 'center' }}>{won ? 'انتصرت اليوم' : 'أتممت جولتك'}</T>
      {!won && <T s={13} style={{ color: C.muted, textAlign: 'center' }}>المعركة مفتوحة إلى آخر اليوم. عُد وأسقِط من بقي.</T>}
      {day.closed && <T s={13} style={{ color: C.muted, textAlign: 'center' }}>🔒 أُغلقت معركة اليوم. موعدك غدًا مع معركة جديدة.</T>}
      <Animated.Image source={day.fell ? POSE.fall : won ? POSE.win : POSE.fight} style={{ width: 150, height: 210, alignSelf: 'center', transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }} resizeMode="contain" />

      <Sec title="السلسلة">
        <View style={[st.row, { gap: 12 }]}>
          <T b s={40} style={{ color: C.red }}>{s.chain}</T>
          <View style={{ flex: 1 }}>
            <T b s={15}>{s.chain === 1 ? 'يوم واحد' : 'أيام متتالية'}</T>
            <T s={12} style={{ color: C.muted }}>أطول سلسلة: {s.best}{s.shields ? ` · دروع: ${s.shields}` : ''}</T>
          </View>
        </View>
        <View style={[st.row, { justifyContent: 'space-between', marginTop: 10 }]}>
          {[0, 1, 2, 3, 4, 5, 6].map((j) => {
            const d = first + j; const isT = d === idx; const w = isT ? won : wonMap[d];
            return (
              <View key={d} style={{ alignItems: 'center' }}>
                <View style={[st.dot, w && { backgroundColor: C.red, borderColor: C.red }, isT && !w && { borderColor: C.red }, d > idx && { opacity: 0.35 }]}>
                  <T b s={12}>{w ? '✓' : d < idx ? '✕' : ''}</T>
                </View>
                <T s={10} style={{ color: isT ? C.bone : C.muted, marginTop: 3 }}>{d}</T>
              </View>
            );
          })}
        </View>
      </Sec>

      <Sec title={`الأعداء · سقط ${down.length} من ${enemies.length}`}>
        <View style={[st.row, { flexWrap: 'wrap', gap: 8 }]}>
          {enemies.map((x) => {
            const dn = down.includes(x);
            return (
              <View key={x.id} style={{ alignItems: 'center', width: 72 }}>
                <View style={{ opacity: dn ? 1 : 0.3 }}><EnemyArt id={x.id} size={64} /></View>
                <T s={10} style={{ color: dn ? C.green : C.muted, textAlign: 'center', marginTop: 3 }}>{dn ? 'سقط' : `${enemyHP(x, day, idx)}%`}</T>
              </View>
            );
          })}
        </View>
      </Sec>

      <Quests S={S} save={save} />

      <Sec title="الصلوات الخمس">
        <View style={[st.row, { justifyContent: 'space-between' }]}>
          {PRAYERS.map(([id, n]) => {
            const v = day.pr && day.pr[id];
            const col = v === 'w' ? C.green : v === 'd' ? C.amber : '#333';
            return (
              <View key={id} style={{ alignItems: 'center', flex: 1 }}>
                <View style={[st.dot, { borderColor: col, backgroundColor: v ? col : 'transparent' }]}><T b s={12} style={{ color: C.night }}>{v ? '✓' : ''}</T></View>
                <T s={11} style={{ marginTop: 3 }}>{n}</T>
                <T s={9} style={{ color: C.muted }}>{v === 'w' ? 'في وقتها' : v === 'd' ? 'في يومها' : '—'}</T>
              </View>
            );
          })}
        </View>
      </Sec>

      <Sec title={`العادات · ${habits.length} من ${activeHabits(idx).length}`}>
        {habits.length === 0 && <T s={13} style={{ color: C.muted }}>لم تُسجَّل عادة بعد.</T>}
        {habits.map((h) => <Line key={h.id} label={h.t} value={day.h[h.id] === 'f' ? 'كاملة' : 'على الأقل'} color={day.h[h.id] === 'f' ? C.green : C.amber} />)}
        {day.lesson === 'ok' && <Line label="درس اليوم" value="أجبت صحيحًا" color={C.green} />}
        {!!day.task && <Line label="مهمة اليوم" value="أُنجزت" color={C.green} />}
        {!!day.ribat && <Line label="الرباط" value={`${day.ribat} دقيقة`} color={C.green} />}
      </Sec>

      <Sec title="الميزان بينك وبين نفسك">
        <T b s={15}>{stage[0]}</T>
        <T s={13} style={{ color: bst.gain >= 0 ? C.green : C.red, marginTop: 2 }}>{bst.gain >= 0 ? `قويتَ اليوم +${bst.gain} وصغرت هي` : `قويت هي اليوم ${-bst.gain} وضعفت أنت`}</T>
        <View style={[st.row, { justifyContent: 'space-between', marginTop: 6 }]}><T s={12} style={{ color: C.muted }}>النفس {bst.hp}%</T><T s={12} style={{ color: C.green }}>أنت {bst.you}%</T></View>
        <View style={{ marginTop: 8 }}><Bar v={bst.hp} max={bst.max} h={10} /></View>
      </Sec>

      <Sec title="النقاط والرتبة">
        <View style={[st.row, { justifyContent: 'space-between' }]}>
          <View><T b s={24} style={{ color: C.amber }}>+{xp}</T><T s={11} style={{ color: C.muted }}>نقاط اليوم</T></View>
          <View style={{ alignItems: 'flex-start' }}><T b s={18}>{s.rank}</T><T s={11} style={{ color: C.muted }}>{s.next ? `بقي ${s.next[0] - s.xp} لبلوغ «${s.next[1]}»` : 'أعلى رتبة'}</T></View>
        </View>
        {yxp !== null && <T s={12} style={{ color: xp >= yxp ? C.green : C.muted, marginTop: 6 }}>{xp > yxp ? `أفضل من أمس بـ${xp - yxp} نقطة` : xp === yxp ? 'مثل أمس تمامًا' : `أقل من أمس بـ${yxp - xp} نقطة. غدًا تعوّض.`}</T>}
      </Sec>

      {news.length > 0 && (
        <Sec title="الجديد اليوم">
          {news.map(([ic, t], j) => <View key={j} style={[st.row, { gap: 8, paddingVertical: 4 }]}><Icon name={ic} size={20} /><T s={14} style={{ flex: 1 }}>{t}</T></View>)}
        </Sec>
      )}

      <Sec title="أفضل ما فعلته اليوم">
        <TextInput value={best} onChangeText={setBest} onBlur={() => save((x) => { x.days[k] = x.days[k] || {}; x.days[k].win = best.trim(); return x; })} placeholder="كلمة واحدة تكفي" placeholderTextColor={C.muted} style={[st.input, { marginTop: 0 }]} />
      </Sec>

      <Sec title="كلمة ناظم">
        <T s={14} style={{ color: '#d9cfc6' }}>«{quote}»</T>
        {tomorrow && <T s={13} style={{ color: C.amber, marginTop: 8 }}>مهمة الغد: {tomorrow}</T>}
      </Sec>

      <Pressable style={[st.ghost, st.row, { gap: 8 }]} onPress={() => setStory(!story)}><Icon name="share" size={20} /><T b>شارك في القصة</T></Pressable>
      {story && (
        <View style={{ alignItems: 'center', marginTop: 14 }}>
          <DayStory S={S} refCb={(r) => { cardRef.current = r; }} />
          {Platform.OS !== 'web'
            ? <Pressable style={st.cta} onPress={async () => { try { const uri = await captureRef(cardRef.current, { format: 'png' }); await Sharing.shareAsync(uri); } catch {} }}><T b style={{ textAlign: 'center' }}>مشاركة</T></Pressable>
            : <T s={12} style={{ color: C.muted, marginTop: 6 }}>في التطبيق تُشارَك بلمسة. الآن صوّر الشاشة.</T>}
        </View>
      )}
      <Pressable style={[st.ghost, st.row, { gap: 8 }]} onPress={invite}><Icon name="flag" size={20} /><T b>تحدَّ صديقك</T></Pressable>
      <Pressable style={st.cta} onPress={close}><T b s={18} style={{ textAlign: 'center' }}>متابعة</T></Pressable>
    </ScrollView>
  );
}

export default function Fight({ S, save, close }) {
  const k = keyOf(new Date());
  const idx = dayIndex(S.profile);
  const day = S.days[k] || {};
  const enemies = activeEnemies(idx);
  const [i, setI] = useState(0);
  const [done, setDone] = useState(!!day.closed);
  const [line, setLine] = useState('');
  const [praise, setPraise] = useState(null);
  const combo = useRef(0);
  const praiseT = useRef(null);
  const [phase, setPhase] = useState(day.closed ? 'card' : 'fight');
  const [skipL, setSkipL] = useState(false);
  const shake = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;
  const cardRef = useRef(null);
  const e = enemies[i];
  useEffect(() => { if (e) setLine(pick(e.taunts)); }, [i]);
  useEffect(() => { if (done) Animated.spring(pop, { toValue: 1, friction: 4, useNativeDriver: Platform.OS !== 'web' }).start(); }, [done]);

  const set = (fn, isHit) => {
    save((s) => { s.days[k] = s.days[k] || {}; fn(s.days[k]); return s; });
    if (!isHit) { combo.current = 0; sfx('tap'); }
    if (isHit) {
      buzz();
      combo.current += 1;
      const s2 = { ...S, days: { ...S.days, [k]: JSON.parse(JSON.stringify(S.days[k] || {})) } };
      fn(s2.days[k]);
      const fell = !isDown(enemyHP(e, day, idx)) && isDown(enemyHP(e, s2.days[k], idx));
      sfx(fell ? 'down' : 'hit');
      const c = combo.current;
      if (c > (day.combo || 0)) save((x) => { x.days[k] = x.days[k] || {}; x.days[k].combo = Math.max(x.days[k].combo || 0, c); return x; });
      setPraise(fell ? `سقط ${e.n.split(' · ')[0]}!` : c >= 5 ? `${c} ضربات متتالية! لا تتوقف` : c >= 3 ? `${c} ضربات متتالية 🔥` : pick(PRAISE));
      clearTimeout(praiseT.current);
      praiseT.current = setTimeout(() => setPraise(null), 1500);
      setLine(pick(e.hit));
      Animated.sequence([14, -14, 8, -8, 0].map((x) => Animated.timing(shake, { toValue: x, duration: 55, useNativeDriver: Platform.OS !== 'web' }))).start();
    }
  };
  const next = () => {
    buzz(); sfx('tap'); setPraise(null);
    if (i < enemies.length - 1) { setI(i + 1); return; }
    const allDown = enemies.every((x) => isDown(enemyHP(x, day, idx)));
    const first = dayWon(day, idx) && !day.flame;
    save((x) => { x.days[k] = x.days[k] || {}; if (first) x.days[k].flame = true; if (allDown) x.days[k].closed = true; return x; });
    setPhase(first ? 'flame' : 'card');
    sfx(allDown ? 'win' : 'tap');
    setDone(true);
  };

  if (!done && !day.lesson && !skipL) {
    return <Lesson idx={idx} close={close} onDone={(ok) => { save((x) => { x.days[k] = x.days[k] || {}; x.days[k].lesson = ok ? 'ok' : 'no'; return x; }); setSkipL(true); }} />;
  }
  if (done && phase === 'flame') return <Flame S={S} onNext={() => setPhase('card')} />;
  if (done) return <Result S={S} save={save} close={close} pop={pop} />;

  const hp = enemyHP(e, day, idx);
  const down = isDown(hp);
  return (
    <View style={{ flex: 1 }}>
      <View style={[st.row, { gap: 12, padding: 16 }]}>
        <Pressable onPress={close}><T s={26} style={{ color: C.muted }}>✕</T></Pressable>
        <View style={[st.row, { flex: 1, gap: 6 }]}>
          {enemies.map((x, j) => {
            const xd = isDown(enemyHP(x, day, idx));
            return <View key={x.id} style={{ flex: 1, height: 12, borderRadius: 6, backgroundColor: j === i ? C.red : xd ? C.green : '#262626' }} />;
          })}
        </View>
        <T b s={14} style={{ color: C.muted }}>{i + 1}/{enemies.length}</T>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}>
        <View style={[st.row, { justifyContent: 'center', gap: 8 }]}><Icon name={e.icon} size={24} /><T b s={26} style={{ textAlign: 'center' }}>{e.n}</T></View>
        <View style={[st.row, { gap: 10, marginVertical: 8 }]}>
          <View style={{ flex: 1 }}><Bar v={hp} h={16} color={down ? C.green : C.red} /></View>
          <T b s={16}>{hp}</T>
        </View>
        <View style={st.bubble}><T s={14} style={{ textAlign: 'center', color: down ? C.green : '#e6d9d0' }}>«{down ? e.dead : line}»</T></View>
        <Animated.View style={{ alignItems: 'center', transform: [{ translateX: shake }], marginVertical: 6 }}>
          <EnemyArt id={e.id} size={230} dead={down} />
        </Animated.View>
        <Questions e={e} day={day} idx={idx} set={set} city={S.profile.city} />
      </ScrollView>
      {praise && (
        <View style={st.praise} pointerEvents="none"><Icon name="sword" size={22} color={C.night} accent={C.night} /><T b s={17} style={{ color: C.night, flex: 1 }}>{praise}</T></View>
      )}
      <Pressable style={[st.cta, { position: 'absolute', bottom: 20, left: 20, right: 20 }]} onPress={next}>
        <T b s={18} style={{ textAlign: 'center' }}>{down ? (i < enemies.length - 1 ? 'سقط! العدو التالي ⚔️' : 'النتيجة 🏆') : (i < enemies.length - 1 ? 'أُكمل لاحقًا · العدو التالي' : 'النتيجة')}</T>
      </Pressable>
    </View>
  );
}

const st = StyleSheet.create({
  mile: { gap: 8, borderWidth: 2, borderColor: C.bone, borderRadius: 30, paddingVertical: 8, paddingHorizontal: 18, marginBottom: 14, backgroundColor: C.crimson },
  praise: { position: 'absolute', bottom: 92, left: 20, right: 20, backgroundColor: C.green, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  bubbleBig: { borderWidth: 2, borderColor: '#333', borderRadius: 18, paddingVertical: 12, paddingHorizontal: 16, marginHorizontal: 10 },
  sec: { backgroundColor: '#151515', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 16, padding: 14, marginTop: 12 },
  dot: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: '#333', alignItems: 'center', justifyContent: 'center' },
  story: { width: 300, height: 533, backgroundColor: C.night, borderWidth: 1, borderColor: '#5a1214', borderRadius: 18, overflow: 'hidden' },
  storyBanner: { backgroundColor: C.crimson, paddingVertical: 10 },
  row: { flexDirection: 'row-reverse', alignItems: 'center' },
  two: { flexDirection: 'row-reverse', gap: 8 },
  opt: { flexDirection: 'row-reverse', alignItems: 'center', borderWidth: 2, borderColor: '#2e2e2e', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14, marginTop: 8, backgroundColor: '#121212', borderBottomWidth: 5 },
  bubble: { alignSelf: 'center', backgroundColor: '#1b1b1b', borderWidth: 1, borderColor: '#333', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 14, maxWidth: 320 },
  cta: { backgroundColor: C.red, borderRadius: 16, paddingVertical: 14, marginTop: 16, alignSelf: 'stretch', borderBottomWidth: 5, borderBottomColor: '#7d1313' },
  ghost: { borderWidth: 2, borderColor: '#333', borderRadius: 16, paddingVertical: 12, marginTop: 16, alignSelf: 'stretch', justifyContent: 'center' },
  stat: { borderWidth: 2, borderColor: '#2e2e2e', borderRadius: 14, paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center' },
  input: { backgroundColor: '#0f0f0f', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 10, color: C.bone, fontFamily: 'C6', fontSize: 15, padding: 10, textAlign: 'right', marginTop: 8 },
});
