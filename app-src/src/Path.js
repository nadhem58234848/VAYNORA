// Home: the road of 21 days (Duolingo path), fronts, beast, VAY talking, ribat.
import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Image, Animated, StyleSheet, Platform, AppState, Modal } from 'react-native';
import Icon from './icons';
import { C, MSG, MSG_AFTER } from './data';
import { keyOf, dayIndex, weekOf, stats, addDays, parseKey } from './logic';
import { FRONTS, BOSS, activeEnemies, enemyHP, isDown, beast } from './battle';
import { Bar, POSE, ENEMY_IMG } from './Battle';

const T = ({ s = 15, b, style, children }) => (
  <Text style={[{ color: C.bone, fontFamily: b ? 'C8' : 'C6', fontSize: s, textAlign: 'right', writingDirection: 'rtl' }, style]}>{children}</Text>
);
const OFF = [0, -60, -90, -60, 0, 60, 90];

// What VAY says, depending on the day
function vaySays(S, idx, day, downN, total) {
  const h = new Date().getHours();
  if (day.fell) return 'سقطت؟ أنا أيضًا سقطت. قُم، نُكمل معًا.';
  if (downN === total) return 'أسقطناهم جميعًا اليوم! غدًا نعود.';
  if (h < 9 && !(day.knots || []).some(Boolean)) return 'صباح الخير أيها المحارب. شيطان الفجر عقد عليك 3 عقد، هيّا نحلّها.';
  if (h >= 21) return 'جاء الليل. أتمم تقرير المعركة وضع الهاتف خارج الغرفة.';
  if (downN === 0) return 'أين أنت؟ الأعداء يسخرون منّي. ادخل المعركة!';
  return `أسقطنا ${downN} من ${total}. بقي ${total - downN}، لا تدعهم يرتاحون.`;
}

function Ribat({ close, save }) {
  const [min, setMin] = useState(null);
  const [left, setLeft] = useState(0);
  const [state, setState] = useState('pick'); // pick | run | won | lost
  useEffect(() => {
    if (state !== 'run') return;
    const t = setInterval(() => setLeft((l) => { if (l <= 1) { clearInterval(t); setState('won'); save((s) => { const k = keyOf(new Date()); s.days[k] = s.days[k] || {}; s.days[k].ribat = (s.days[k].ribat || 0) + min; return s; }); return 0; } return l - 1; }), 1000);
    const sub = AppState.addEventListener('change', (st8) => { if (st8 === 'background') { clearInterval(t); setState('lost'); } });
    return () => { clearInterval(t); sub.remove(); };
  }, [state]);
  const mm = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Pressable onPress={close} style={{ position: 'absolute', top: 20, right: 20 }}><T s={26} style={{ color: C.muted }}>✕</T></Pressable>
      <T b s={28} style={{ textAlign: 'center' }}>⏳ الرباط</T>
      {state === 'pick' && (<>
        <T s={15} style={{ textAlign: 'center', color: C.muted, marginVertical: 10 }}>اختر مدة، وضع الهاتف. VAY يحرس القلعة. إن خرجت من التطبيق قبل الوقت دخل العدو.</T>
        {[[25, 'قراءة أو قرآن'], [45, 'عمل أو دراسة'], [60, 'رباط كامل']].map(([m, n]) => (
          <Pressable key={m} style={st.opt} onPress={() => { setMin(m); setLeft(m * 60); setState('run'); }}><T b s={18}>{m} دقيقة</T><T s={13} style={{ color: C.muted }}>{n}</T></Pressable>
        ))}
      </>)}
      {state === 'run' && (<>
        <Image source={POSE.fight} style={{ width: 160, height: 230, alignSelf: 'center' }} resizeMode="contain" />
        <T b s={56} style={{ textAlign: 'center' }}>{mm}</T>
        <T s={14} style={{ textAlign: 'center', color: C.muted }}>VAY يحرس القلعة. لا تخرج.</T>
      </>)}
      {state === 'won' && (<>
        <Image source={POSE.win} style={{ width: 160, height: 230, alignSelf: 'center' }} resizeMode="contain" />
        <T b s={26} style={{ textAlign: 'center', color: C.red }}>القلعة سالمة! +{min} دقيقة رباط</T>
        <Pressable style={st.cta} onPress={close}><T b style={{ textAlign: 'center' }}>متابعة</T></Pressable>
      </>)}
      {state === 'lost' && (<>
        <Image source={POSE.fall} style={{ width: 160, height: 230, alignSelf: 'center' }} resizeMode="contain" />
        <T b s={22} style={{ textAlign: 'center' }}>خرجت قبل الوقت فدخل العدو.</T>
        <T s={14} style={{ textAlign: 'center', color: C.muted }}>لا بأس، أعِد من جديد.</T>
        <Pressable style={st.cta} onPress={() => setState('pick')}><T b style={{ textAlign: 'center' }}>أعِد الرباط</T></Pressable>
      </>)}
    </View>
  );
}

export default function Path({ S, save, openFight }) {
  const idx = dayIndex(S.profile);
  const k = keyOf(new Date());
  const day = S.days[k] || {};
  const s = stats(S);
  const bst = beast(S);
  const enemies = activeEnemies(idx);
  const downN = enemies.filter((e) => isDown(enemyHP(e, day, idx))).length;
  const wk = idx > 21 ? 3 : weekOf(idx);
  const front = FRONTS[wk - 1];
  const pulse = useRef(new Animated.Value(1)).current;
  const [ribat, setRibat] = useState(false);
  const [orders, setOrders] = useState(S.lastOrders !== k);
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.08, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
    ])).start();
  }, []);

  // days of the current week, top = last day
  const first = (wk - 1) * 7 + 1;
  const days = [];
  for (let d = first + 6; d >= first; d--) days.push(d);
  const won = Object.fromEntries(s.list.map((x) => [x.i, x.won]));

  return (
    <View>
      <View style={st.unit}>
        <View style={{ flex: 1 }}><T s={12} style={{ opacity: 0.85 }}>الجبهة {wk} · الأسبوع {wk}</T><T b s={22}>{front.n}</T><T s={12} style={{ opacity: 0.8 }}>{front.d}</T></View>
        <View style={st.unitIc}><Icon name={['knot', 'eye', 'flame'][wk - 1]} size={28} /></View>
      </View>
      <View style={st.beast}>
        <Image source={ENEMY_IMG.beast} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={st.beastShade} />
        <T b s={20} style={{ color: C.bone }}>النفس الأمّارة بالسوء</T>
        <T s={12} style={{ color: '#d9cfc6' }}>الوحش الأكبر · تهزمه في 21 يومًا</T>
      </View>
      <View style={[st.row, { gap: 8, marginVertical: 10 }]}>
        <T s={12} style={{ color: C.muted }}>صحة الوحش</T>
        <View style={{ flex: 1 }}><Bar v={bst.hp} max={bst.max} h={10} /></View>
        <T s={12} style={{ color: C.muted }}>{Math.round((bst.hp / bst.max) * 100)}%</T>
      </View>

      <View style={st.say}><T s={14}>{vaySays(S, idx, day, downN, enemies.length)}</T></View>
      <View style={{ minHeight: 560 }}>
        <Image source={day.fell ? POSE.fall : downN === enemies.length ? POSE.win : POSE.fight} style={st.vay} resizeMode="contain" />
        {days.map((d, j) => {
          const off = OFF[(d - 1) % 7];
          const isToday = d === idx; const past = d < idx; const boss = !!BOSS[d];
          const node = (
            <View style={[st.node, past && (won[d] ? st.done : st.lost), isToday && st.today, !past && !isToday && (boss ? st.boss : st.locked)]}>
              <Icon name={isToday ? 'sword' : past ? (won[d] ? 'shield' : 'chain') : boss ? 'crown' : 'knot'} size={isToday ? 38 : 30} color={!past && !isToday ? '#555' : C.bone} accent={!past && !isToday ? (boss ? C.amber : '#555') : C.bone} />
            </View>
          );
          return (
            <View key={d} style={{ alignItems: 'center', marginBottom: 14, transform: [{ translateX: off }] }}>
              {isToday && <Pressable onPress={openFight} style={st.go}><T b s={13} style={{ color: C.night }}>{downN === enemies.length ? 'ربحت اليوم ✓' : `ابدأ معركة اليوم ${d}`}</T></Pressable>}
              {isToday ? (
                <Pressable onPress={openFight}><Animated.View style={{ transform: [{ scale: pulse }] }}>{node}</Animated.View></Pressable>
              ) : node}
              <T s={11} style={{ color: C.muted, marginTop: 6, textAlign: 'center' }}>{boss ? 'معركة كبرى' : `اليوم ${d}`}</T>
            </View>
          );
        })}
      </View>

      <Pressable style={[st.ribatBtn, st.row]} onPress={() => setRibat(true)}>
        <Icon name="hourglass" size={26} />
        <View style={{ flex: 1, marginRight: 10 }}><T b s={16}>الرباط</T><T s={12} style={{ color: C.muted }}>جلسة تركيز: VAY يحرس القلعة وأنت تعمل أو تقرأ</T></View>
        <T b s={14} style={{ color: C.red }}>{day.ribat ? `${day.ribat} د ✓` : 'ابدأ'}</T>
      </Pressable>

      <Modal visible={ribat} animationType="slide" onRequestClose={() => setRibat(false)}>
        <View style={{ flex: 1, backgroundColor: C.night }}><Ribat close={() => setRibat(false)} save={save} /></View>
      </Modal>
      <Modal visible={orders} transparent animationType="fade" onRequestClose={() => setOrders(false)}>
        <View style={st.modalBg}>
          <View style={st.ordersCard}>
            <T b s={14} style={{ color: C.red }}>⚔️ أوامر القائد ناظم · اليوم {idx}</T>
            <T s={17} style={{ marginTop: 8 }}>{idx <= 21 ? MSG[idx - 1] : MSG_AFTER}</T>
            <Pressable style={st.cta} onPress={() => { setOrders(false); save((x) => { x.lastOrders = k; return x; }); }}><T b style={{ textAlign: 'center' }}>فهمت، لنبدأ</T></Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  beast: { height: 190, borderRadius: 18, overflow: 'hidden', marginTop: 10, justifyContent: 'flex-end', padding: 14, borderWidth: 1, borderColor: '#5a1214' },
  beastShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 80, backgroundColor: 'rgba(0,0,0,0.6)' },
  row: { flexDirection: 'row-reverse', alignItems: 'center' },
  unit: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: C.crimson, borderRadius: 18, padding: 14, borderBottomWidth: 5, borderBottomColor: '#5a1214' },
  unitIc: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 12, padding: 6 },
  say: { backgroundColor: '#1b1b1b', borderWidth: 1, borderColor: '#333', borderRadius: 16, padding: 10, marginBottom: 6 },
  vay: { position: 'absolute', left: 0, top: 150, width: 120, height: 220, opacity: 0.95 },
  node: { width: 72, height: 66, borderRadius: 36, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 6 },
  done: { backgroundColor: C.red, borderBottomColor: '#7d1313' },
  lost: { backgroundColor: '#3a3a3a', borderBottomColor: '#222' },
  today: { width: 88, height: 80, borderRadius: 44, backgroundColor: C.red, borderBottomColor: '#7d1313' },
  boss: { backgroundColor: '#2a2a2a', borderBottomColor: '#151515', borderWidth: 2, borderColor: C.amber },
  locked: { backgroundColor: '#222', borderBottomColor: '#151515' },
  go: { backgroundColor: C.bone, borderRadius: 12, paddingVertical: 5, paddingHorizontal: 12, marginBottom: 8 },
  ribatBtn: { backgroundColor: '#161616', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 16, padding: 14, marginTop: 6 },
  cta: { backgroundColor: C.red, borderRadius: 16, paddingVertical: 13, marginTop: 16, borderBottomWidth: 5, borderBottomColor: '#7d1313' },
  opt: { borderWidth: 2, borderColor: '#2e2e2e', borderBottomWidth: 5, borderRadius: 16, padding: 14, marginTop: 10, alignItems: 'center' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  ordersCard: { backgroundColor: '#141414', borderWidth: 1, borderColor: C.crimson, borderRadius: 20, padding: 20 },
});
