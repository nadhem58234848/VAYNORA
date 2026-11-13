// Day battle: one enemy per screen (Duolingo lesson style), then the victory screen.
import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Image, Animated, ScrollView, StyleSheet, Platform, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import Icon from './icons';
import { C, PRAYERS, HABITS, MSG, MSG_AFTER } from './data';
import { keyOf, dayIndex, weekOf, dayXP, stats, prayerTimes, hm } from './logic';
import { activeEnemies, enemyHP, isDown } from './battle';
import { Smoke, Bar, POSE, StoryCard } from './Battle';

const PRAY = Object.fromEntries(PRAYERS);
const HAB = Object.fromEntries(HABITS.map((h) => [h.id, h]));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const T = ({ s = 15, b, style, children }) => (
  <Text style={[{ color: C.bone, fontFamily: b ? 'C8' : 'C6', fontSize: s, textAlign: 'right', writingDirection: 'rtl' }, style]}>{children}</Text>
);
const buzz = () => { if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {}); };

// Big Duolingo-style option
const Opt = ({ title, dmg, on, onPress, color = C.red }) => (
  <Pressable onPress={onPress} style={[st.opt, on && { borderColor: color, backgroundColor: color === C.red ? '#2a1214' : '#13261a' }]}>
    <T s={15} b={on} style={{ flex: 1 }}>{title}</T>
    {!!dmg && <T b s={14} style={{ color: C.red }}>-{dmg}</T>}
  </Pressable>
);

function Questions({ e, day, idx, set, city }) {
  const w = idx > 21 ? 3 : weekOf(idx);
  const items = e.items.filter((it) => it[4] <= w);
  const pt = prayerTimes(city);
  return items.map((it) => {
    const [kind, id, full, min] = it;
    if (kind === 'k') {
      const kn = day.knots || [false, false, false];
      const names = ['🤲 ذكرت الله كي قمت', '💧 توضّيت', '🕌 صلّيت'];
      return (
        <View key={id} style={{ marginBottom: 6 }}>
          <T b s={18} style={{ textAlign: 'center' }}>فكّ العقد الثلاثة</T>
          <T s={11} style={{ color: C.muted, textAlign: 'center', marginBottom: 4 }}>«يعقد الشيطان على قافية رأس أحدكم إذا هو نام ثلاث عقد» (البخاري 1142)</T>
          {names.map((n, i) => <Opt key={i} title={(kn[i] ? '✓ ' : '') + n} dmg={15} on={kn[i]} onPress={() => set((d) => { d.knots = [...kn]; d.knots[i] = !kn[i]; }, !kn[i])} />)}
        </View>
      );
    }
    if (kind === 'p') {
      const v = day.pr && day.pr[id];
      return (
        <View key={id} style={{ marginBottom: 6 }}>
          <T b s={16}>{PRAY[id]} <T s={12} style={{ color: C.muted }}>· {hm(pt[id])}</T></T>
          <View style={st.two}>
            <View style={{ flex: 1 }}><Opt title="في وقتها" dmg={full} on={v === 'w'} onPress={() => set((d) => { d.pr = d.pr || {}; d.pr[id] = v === 'w' ? null : 'w'; }, v !== 'w')} /></View>
            <View style={{ flex: 1 }}><Opt title="في نهارها" dmg={min} on={v === 'd'} color={C.amber} onPress={() => set((d) => { d.pr = d.pr || {}; d.pr[id] = v === 'd' ? null : 'd'; }, v !== 'd')} /></View>
          </View>
        </View>
      );
    }
    if (kind === 'h') {
      const h = HAB[id]; const v = day.h && day.h[id];
      return (
        <View key={id} style={{ marginBottom: 6 }}>
          <T b s={16}>{h.t}</T>
          <Opt title={'💪 كاملة · ' + h.full} dmg={full} on={v === 'f'} onPress={() => set((d) => { d.h = d.h || {}; d.h[id] = v === 'f' ? null : 'f'; }, v !== 'f')} />
          <Opt title={'على الأقل · ' + h.min} dmg={min} on={v === 'm'} color={C.amber} onPress={() => set((d) => { d.h = d.h || {}; d.h[id] = v === 'm' ? null : 'm'; }, v !== 'm')} />
        </View>
      );
    }
    if (id === 'task') return <Opt key={id} title="🎯 عملت مهمة اليوم" dmg={full} on={!!day.task} onPress={() => set((d) => { d.task = !d.task; }, !day.task)} />;
    if (id === 'safe') return <Opt key={id} title="🛡️ نهاري وليلتي سالمين" dmg={full} on={!!day.safe} onPress={() => set((d) => { d.safe = !d.safe; }, !day.safe)} />;
    if (id === 'tom') return (
      <View key={id}>
        <T b s={16}>مهمة غدوة الوحيدة</T>
        <TomInput day={day} set={set} />
      </View>
    );
    if (id === 'sos') return <T key={id} s={13} style={{ color: (day.sos || 0) > 0 ? C.green : C.muted, marginTop: 6 }}>{(day.sos || 0) > 0 ? '✓ عدّيت موجة بزر الطوارئ اليوم' : 'كي تجيك موجة، زر الطوارئ يضرب هالعدو.'}</T>;
    return null;
  });
}

function TomInput({ day, set }) {
  const [v, setV] = useState(day.tom || '');
  return (
    <View>
      <TextInput value={v} onChangeText={setV} placeholder="حاجة وحدة، الأهم" placeholderTextColor={C.muted} style={st.input} />
      <Opt title={day.tom ? '✓ مكتوبة' : '✍️ اكتبها'} dmg={40} on={!!(day.report && day.tom)} onPress={() => v.trim() && set((d) => { d.tom = v.trim(); d.report = true; }, true)} />
    </View>
  );
}

export default function Fight({ S, save, close }) {
  const k = keyOf(new Date());
  const idx = dayIndex(S.profile);
  const day = S.days[k] || {};
  const enemies = activeEnemies(idx);
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const [line, setLine] = useState('');
  const [shareE, setShareE] = useState(null);
  const shake = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;
  const cardRef = useRef(null);
  const e = enemies[i];
  useEffect(() => { if (e) setLine(pick(e.taunts)); }, [i]);
  useEffect(() => { if (done) Animated.spring(pop, { toValue: 1, friction: 4, useNativeDriver: Platform.OS !== 'web' }).start(); }, [done]);

  const set = (fn, isHit) => {
    save((s) => { s.days[k] = s.days[k] || {}; fn(s.days[k]); return s; });
    if (isHit) {
      buzz();
      setLine(pick(e.hit));
      Animated.sequence([14, -14, 8, -8, 0].map((x) => Animated.timing(shake, { toValue: x, duration: 55, useNativeDriver: Platform.OS !== 'web' }))).start();
    }
  };
  const next = () => { buzz(); if (i < enemies.length - 1) setI(i + 1); else setDone(true); };

  if (done) {
    const down = enemies.filter((x) => isDown(enemyHP(x, day, idx)));
    const s = stats(S);
    const won = down.length === enemies.length;
    return (
      <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
        <T s={16} style={{ color: C.muted, textAlign: 'center' }}>النهار {idx}</T>
        <T b s={32} style={{ color: won ? C.red : C.bone, textAlign: 'center' }}>{won ? 'ربحت المعركة!' : 'المعركة مازالت'}</T>
        <Animated.Image source={won ? POSE.win : POSE.fight} style={{ width: 200, height: 280, transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }} resizeMode="contain" />
        <View style={[st.row, { gap: 10, marginTop: 8 }]}>
          <View style={st.stat}><T b s={20}>{down.length}/{enemies.length}</T><T s={11} style={{ color: C.muted }}>أعداء طاحو</T></View>
          <View style={st.stat}><T b s={20}>+{dayXP(day, idx)}</T><T s={11} style={{ color: C.muted }}>نقطة اليوم</T></View>
          <View style={st.stat}><T b s={20}>🔗 {s.chain}</T><T s={11} style={{ color: C.muted }}>السلسلة</T></View>
        </View>
        <T s={14} style={{ textAlign: 'center', marginTop: 14, color: '#cfc6bd' }}>{won ? '«كل نهار فيه قرار خذيتو رغم التعب. هاذي القوة اللي تبنيها.» · ناظم' : 'الصلوات اللي مازالت ارجعلها في وقتها. المعركة تكمل لآخر النهار.'}</T>
        {down.length > 0 && (
          <Pressable style={[st.ghost, st.row, { gap: 8 }]} onPress={() => setShareE(down[0])}>
            <Icon name="share" size={20} /><T b>انشرها ستوري</T>
          </Pressable>
        )}
        <Pressable style={st.cta} onPress={close}><T b s={18} style={{ textAlign: 'center' }}>كمّل</T></Pressable>
        {shareE && (
          <View style={{ alignItems: 'center', marginTop: 16 }}>
            <StoryCard e={shareE} name={S.profile.name} idx={idx} refCb={(r) => { cardRef.current = r; }} />
            {Platform.OS !== 'web'
              ? <Pressable style={st.cta} onPress={async () => { try { const uri = await captureRef(cardRef.current, { format: 'png' }); await Sharing.shareAsync(uri); } catch {} }}><T b style={{ textAlign: 'center' }}>شارك</T></Pressable>
              : <T s={12} style={{ color: C.muted, marginTop: 6 }}>في التطبيق تتشارك بلمسة. توا صوّر الشاشة.</T>}
          </View>
        )}
      </ScrollView>
    );
  }

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
          <Smoke tint={e.tint} size={170} dead={down} />
        </Animated.View>
        <Questions e={e} day={day} idx={idx} set={set} city={S.profile.city} />
      </ScrollView>
      <Pressable style={[st.cta, { position: 'absolute', bottom: 20, left: 20, right: 20 }]} onPress={next}>
        <T b s={18} style={{ textAlign: 'center' }}>{down ? (i < enemies.length - 1 ? 'طاح! العدو الجاي ⚔️' : 'شوف النتيجة 🏆') : (i < enemies.length - 1 ? 'نكمّل بعد · العدو الجاي' : 'شوف النتيجة')}</T>
      </Pressable>
    </View>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row-reverse', alignItems: 'center' },
  two: { flexDirection: 'row-reverse', gap: 8 },
  opt: { flexDirection: 'row-reverse', alignItems: 'center', borderWidth: 2, borderColor: '#2e2e2e', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14, marginTop: 8, backgroundColor: '#121212', borderBottomWidth: 5 },
  bubble: { alignSelf: 'center', backgroundColor: '#1b1b1b', borderWidth: 1, borderColor: '#333', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 14, maxWidth: 320 },
  cta: { backgroundColor: C.red, borderRadius: 16, paddingVertical: 14, marginTop: 16, alignSelf: 'stretch', borderBottomWidth: 5, borderBottomColor: '#7d1313' },
  ghost: { borderWidth: 2, borderColor: '#333', borderRadius: 16, paddingVertical: 12, marginTop: 16, alignSelf: 'stretch', justifyContent: 'center' },
  stat: { borderWidth: 2, borderColor: '#2e2e2e', borderRadius: 14, paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center' },
  input: { backgroundColor: '#0f0f0f', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 10, color: C.bone, fontFamily: 'C6', fontSize: 15, padding: 10, textAlign: 'right', marginTop: 8 },
});
