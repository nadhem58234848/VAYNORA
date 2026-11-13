import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Image, Animated, TextInput, StyleSheet, Platform, Modal } from 'react-native';
import Svg, { Path, Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import Icon from './icons';
import { C, MSG, MSG_AFTER, TASK, PRAYERS, HABITS } from './data';
import { keyOf, dayIndex, weekOf, prayerTimes, hm, stats } from './logic';
import { ENEMIES, FRONTS, BOSS, GEAR, activeEnemies, enemyHP, isDown, beast } from './battle';

export const POSE = {
  fight: require('../assets/vay/P22.png'), win: require('../assets/vay/P18.png'),
  fall: require('../assets/vay/P16.png'), wudu: require('../assets/vay/P35.png'),
};
const PRAY = Object.fromEntries(PRAYERS);
const HAB = Object.fromEntries(HABITS.map((h) => [h.id, h]));
const pick = (a) => a[Math.floor(Math.random() * a.length)];

const T = ({ s = 15, b, style, children }) => (
  <Text style={[{ color: C.bone, fontFamily: b ? 'C8' : 'C6', fontSize: s, textAlign: 'right', writingDirection: 'rtl' }, style]}>{children}</Text>
);

// Faceless smoke silhouette of an enemy
export function Smoke({ tint, size = 70, dead }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id="g" cx="50%" cy="55%" r="55%">
          <Stop offset="0" stopColor={dead ? '#444' : C.red} stopOpacity={dead ? 0.3 : 0.55} />
          <Stop offset="0.6" stopColor={tint} stopOpacity="0.9" />
          <Stop offset="1" stopColor="#000" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="50" cy="55" r="46" fill="url(#g)" />
      <Path fill={dead ? '#2a2a2a' : '#0b0b0b'} d="M50 12C62 12 68 24 66 34C78 36 84 48 80 60C86 70 80 86 66 88C58 94 42 94 34 88C20 86 14 70 20 60C16 48 22 36 34 34C32 24 38 12 50 12Z" />
      <Path fill="none" stroke={dead ? '#3a3a3a' : C.red} strokeWidth="2" strokeLinecap="round" opacity="0.7" d="M30 30C26 22 30 14 38 12M70 30C74 22 70 14 62 12M50 12C48 6 52 3 55 1" />
    </Svg>
  );
}

export function Bar({ v, max = 100, h = 8, color = C.red }) {
  return (
    <View style={{ height: h, backgroundColor: '#262626', borderRadius: h / 2, overflow: 'hidden' }}>
      <View style={{ height: h, width: `${Math.max(0, Math.min(100, (v / max) * 100))}%`, backgroundColor: color }} />
    </View>
  );
}

const Chip = ({ title, on, color = C.red, onPress }) => (
  <Pressable onPress={onPress} style={[st.chip, on && { backgroundColor: color, borderColor: color }]}>
    <T s={13} b={on}>{title}</T>
  </Pressable>
);

function EnemyCard({ e, day, idx, open, setOpen, act, onShare, hit }) {
  const hp = enemyHP(e, day, idx);
  const down = isDown(hp);
  const shake = useRef(new Animated.Value(0)).current;
  const [line, setLine] = useState(pick(e.taunts));
  useEffect(() => {
    if (hit && hit.id === e.id) {
      setLine(isDown(enemyHP(e, day, idx)) ? e.dead : pick(e.hit));
      Animated.sequence([10, -10, 6, -6, 0].map((x) => Animated.timing(shake, { toValue: x, duration: 50, useNativeDriver: Platform.OS !== 'web' }))).start();
    }
  }, [hit]);
  const w = idx > 21 ? 3 : weekOf(idx);
  const items = e.items.filter((it) => it[4] <= w);

  return (
    <View style={[st.card, down && { borderColor: '#1f3a22' }, open && { borderColor: C.crimson }]}>
      <Pressable onPress={() => setOpen(open ? null : e.id)} style={st.row}>
        <Animated.View style={{ transform: [{ translateX: shake }] }}><Smoke tint={e.tint} dead={down} /></Animated.View>
        <View style={{ flex: 1, marginRight: 10 }}>
          <View style={[st.row, { justifyContent: 'space-between' }]}>
            <View style={st.row}><Icon name={e.icon} size={18} /><T b s={16} style={{ marginRight: 6 }}>{e.n}</T></View>
            <T s={12} style={{ color: down ? C.green : C.muted }}>{down ? 'طاح ✓' : `${hp}/100`}</T>
          </View>
          <View style={{ marginVertical: 6 }}><Bar v={hp} color={down ? '#3b5' : C.red} /></View>
          <View style={st.bubble}><T s={13} style={{ color: down ? C.green : '#e6d9d0' }}>«{down ? e.dead : line}»</T></View>
        </View>
      </Pressable>
      {open && (
        <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: '#262626', paddingTop: 10 }}>
          {items.map((it) => <Action key={it[1]} it={it} day={day} act={(fn, label) => act(e, fn, label)} />)}
          {down && (
            <Pressable onPress={() => onShare(e)} style={[st.row, st.shareBtn]}>
              <Icon name="share" size={18} /><T b s={14} style={{ marginRight: 6 }}>انشر انتصارك ستوري</T>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

export function Action({ it, day, act }) {
  const [kind, id] = it;
  if (kind === 'k') {
    const kn = day.knots || [false, false, false];
    const names = ['ذكرت الله كي قمت', 'توضّيت', 'صلّيت'];
    return (
      <View style={{ marginBottom: 8 }}>
        <T b s={14}>فكّ العقد الثلاثة</T>
        <T s={11} style={{ color: C.muted }}>«يعقد الشيطان على قافية رأس أحدكم إذا هو نام ثلاث عقد...» (البخاري 1142)</T>
        <View style={[st.row, { marginTop: 6, flexWrap: 'wrap', gap: 6 }]}>
          {names.map((n, i) => (
            <Chip key={i} title={(kn[i] ? '✓ ' : '🪢 ') + n} on={kn[i]} color={C.green} onPress={() => act((d) => { d.knots = [...kn]; d.knots[i] = !kn[i]; }, kn[i] ? null : 'عقدة طاحت!')} />
          ))}
        </View>
      </View>
    );
  }
  if (kind === 'p') {
    const v = day.pr && day.pr[id];
    return (
      <View style={[st.row, { justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }]}>
        <T b s={14}>{PRAY[id]}</T>
        <View style={[st.row, { gap: 6 }]}>
          <Chip title="في وقتها" on={v === 'w'} color={C.green} onPress={() => act((d) => { d.pr = d.pr || {}; d.pr[id] = v === 'w' ? null : 'w'; }, v === 'w' ? null : 'ضربة!')} />
          <Chip title="في نهارها" on={v === 'd'} color={C.amber} onPress={() => act((d) => { d.pr = d.pr || {}; d.pr[id] = v === 'd' ? null : 'd'; }, v === 'd' ? null : 'ضربة خفيفة')} />
        </View>
      </View>
    );
  }
  if (kind === 'h') {
    const h = HAB[id]; const v = day.h && day.h[id];
    return (
      <View style={{ marginBottom: 8 }}>
        <T b s={14}>{h.t}</T>
        <View style={[st.row, { marginTop: 4, gap: 6, flexWrap: 'wrap' }]}>
          <Chip title={'كاملة · ' + h.full} on={v === 'f'} color={C.green} onPress={() => act((d) => { d.h = d.h || {}; d.h[id] = v === 'f' ? null : 'f'; }, v === 'f' ? null : 'ضربة قوية!')} />
          <Chip title={'على الأقل · ' + h.min} on={v === 'm'} color={C.amber} onPress={() => act((d) => { d.h = d.h || {}; d.h[id] = v === 'm' ? null : 'm'; }, v === 'm' ? null : 'ضربة')} />
        </View>
      </View>
    );
  }
  const labels = { task: 'عملت مهمة اليوم', tom: 'كتبت مهمة غدوة (في تقرير الليل)', safe: 'نهاري وليلتي سالمين', sos: 'عدّيت موجة بزر الطوارئ' };
  const on = id === 'sos' ? (day.sos || 0) > 0 : id === 'tom' ? !!(day.report && day.tom) : !!day[id];
  const can = id === 'task' || id === 'safe';
  return (
    <View style={[st.row, { justifyContent: 'space-between', marginBottom: 8 }]}>
      <T s={14}>{labels[id]}</T>
      {can ? <Chip title={on ? '✓' : 'عملتها'} on={on} color={C.green} onPress={() => act((d) => { d[id] = !d[id]; }, on ? null : 'ضربة!')} />
        : <T s={13} style={{ color: on ? C.green : C.muted }}>{on ? '✓' : '—'}</T>}
    </View>
  );
}

export function StoryCard({ e, name, idx, refCb }) {
  return (
    <View ref={refCb} collapsable={false} style={st.story}>
      <View style={st.storyBanner}><T b s={14} style={{ textAlign: 'center', letterSpacing: 3 }}>VAYNORA · حرب النفس</T></View>
      <T s={16} style={{ textAlign: 'center', color: C.muted, marginTop: 18 }}>النهار {idx}</T>
      <T b s={30} style={{ textAlign: 'center', marginTop: 4 }}>{e.id === 'khalawat' ? 'ربحت معركة اليوم' : 'غلبت'}</T>
      <T b s={30} style={{ textAlign: 'center', color: C.red }}>{e.id === 'khalawat' ? '⚔️' : e.n}</T>
      <Image source={POSE.win} style={{ width: 150, height: 250, alignSelf: 'center', marginTop: 10 }} resizeMode="contain" />
      <T b s={18} style={{ textAlign: 'center', marginTop: 8 }}>اصنع من الألم قوة</T>
      <T s={14} style={{ textAlign: 'center', color: C.muted, marginTop: 4 }}>{name} · @vaynora_</T>
    </View>
  );
}

export default function Battle({ S, save }) {
  const k = keyOf(new Date());
  const idx = dayIndex(S.profile);
  const day = S.days[k] || {};
  const s = stats(S);
  const bst = beast(S);
  const [open, setOpen] = useState('fajr');
  const [hit, setHit] = useState(null);
  const [share, setShare] = useState(null);
  const [tom, setTom] = useState(day.tom || '');
  const [win, setWin] = useState(day.win || '');
  const cardRef = useRef(null);
  const enemies = activeEnemies(idx);
  const downCount = enemies.filter((e) => isDown(enemyHP(e, day, idx))).length;
  const allDown = downCount === enemies.length;
  const pose = (day.fell && !allDown) ? POSE.fall : allDown ? POSE.win : POSE.fight;
  const front = FRONTS[(idx > 21 ? 3 : weekOf(idx)) - 1];
  const boss = BOSS[idx];
  const gearOn = (rank) => { const order = ['مبتدئ', 'جندي', 'محارب', 'محارب ثابت', 'محارب صامد', 'قائد']; return order.indexOf(s.rank) >= order.indexOf(rank); };

  const act = (e, fn, label) => {
    save((st8) => { st8.days[k] = st8.days[k] || {}; fn(st8.days[k]); return st8; });
    if (label) {
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      setHit({ id: e.id, t: Date.now() });
    }
  };
  const doShare = async () => {
    if (Platform.OS === 'web' || !cardRef.current) return;
    try { const uri = await captureRef(cardRef.current, { format: 'png', quality: 1 }); await Sharing.shareAsync(uri); } catch {}
  };

  return (
    <View>
      <View style={[st.row, { justifyContent: 'space-between' }]}>
        <T b s={13} style={{ color: C.red }}>النهار {idx}{idx <= 21 ? ' / 21' : ''}</T>
        <T s={12} style={{ color: C.muted }}>{front.n} · {front.d}</T>
      </View>

      {/* commander's orders */}
      <View style={[st.card, { borderColor: C.crimson }]}>
        <T b s={13} style={{ color: C.red }}>⚔️ أوامر القائد ناظم</T>
        <T s={15} style={{ marginTop: 4 }}>{idx <= 21 ? MSG[idx - 1] : MSG_AFTER}</T>
        <T s={13} style={{ color: C.amber, marginTop: 6 }}>🎯 {idx <= 21 ? TASK[idx - 1] : 'عاود نفس الروتين وزيد خطوة صغيرة.'}</T>
      </View>

      {/* VAY + beast */}
      <View style={[st.card, { padding: 0, overflow: 'hidden' }]}>
        <View style={[st.row, { alignItems: 'flex-end' }]}>
          <Image source={pose} style={{ width: 120, height: 190 }} resizeMode="contain" />
          <View style={{ flex: 1, padding: 12 }}>
            <T s={12} style={{ color: C.muted }}>الوحش الكبير</T>
            <T b s={18}>النفس الأمّارة</T>
            <View style={{ marginVertical: 6 }}><Bar v={bst.hp} max={bst.max} h={12} /></View>
            <T s={12} style={{ color: C.muted }}>{bst.hp} / {bst.max} · طيّحت اليوم {downCount} من {enemies.length}</T>
            <View style={[st.row, { marginTop: 10, gap: 8 }]}>
              {GEAR.map(([ic, n, r]) => <View key={ic} style={{ opacity: gearOn(r) ? 1 : 0.2, alignItems: 'center' }}><Icon name={ic} size={20} /><T s={9}>{n}</T></View>)}
              <View style={{ alignItems: 'center', marginRight: 6 }}><Icon name="shield" size={20} accent={C.green} /><T s={9}>درع ×{s.shields}</T></View>
            </View>
          </View>
        </View>
        {allDown && <View style={{ backgroundColor: C.red, padding: 8 }}><T b s={15} style={{ textAlign: 'center' }}>🏆 طيّحت أعداء اليوم الكل! ربحت النهار</T></View>}
      </View>

      {boss && (
        <View style={[st.card, { borderColor: C.amber }]}>
          <T b s={16} style={{ color: C.amber }}>👑 {boss.n}</T>
          <T s={14} style={{ marginTop: 4 }}>{boss.d}</T>
          <Chip title={day.boss ? '✓ ربحت المعركة الكبيرة (+100 على الوحش)' : 'ربحتها'} on={!!day.boss} color={C.amber} onPress={() => act({ id: 'boss' }, (d) => { d.boss = !d.boss; }, day.boss ? null : 'boss')} />
        </View>
      )}

      <T b s={18} style={{ marginVertical: 8 }}>🗡️ معارك اليوم</T>
      {enemies.map((e) => (
        <EnemyCard key={e.id} e={e} day={day} idx={idx} open={open === e.id} setOpen={setOpen} act={act} hit={hit} onShare={setShare} />
      ))}

      {/* night report */}
      <View style={st.card}>
        <T b s={16}>🌙 تقرير المعركة</T>
        <TextInput value={win} onChangeText={setWin} placeholder="شنوة ربحت اليوم؟" placeholderTextColor={C.muted} style={st.input} multiline />
        <TextInput value={tom} onChangeText={setTom} placeholder="المهمة الأولى متاع غدوة" placeholderTextColor={C.muted} style={st.input} />
        <Pressable style={st.redBtn} onPress={() => act(ENEMIES[3], (d) => { d.win = win; d.tom = tom; d.report = true; }, tom ? 'ضربة!' : null)}>
          <T b style={{ textAlign: 'center' }}>{day.report ? '✓ التقرير محفوظ' : 'احفظ التقرير'}</T>
        </Pressable>
        <Pressable onPress={() => act({ id: 'x' }, (d) => { d.fell = !d.fell; }, null)} style={{ marginTop: 8 }}>
          <T s={12} style={{ color: C.muted, textAlign: 'center' }}>{day.fell ? 'VAY قام. ارجع للمعركة ✓' : 'طحت اليوم؟ موش نهاية. اضغط هنا وارجع للمعركة.'}</T>
        </Pressable>
      </View>

      <Modal visible={!!share} transparent animationType="fade" onRequestClose={() => setShare(null)}>
        <View style={st.modalBg}>
          {share && <StoryCard e={share} name={S.profile.name} idx={idx} refCb={(r) => { cardRef.current = r; }} />}
          <View style={[st.row, { gap: 10, marginTop: 14 }]}>
            {Platform.OS !== 'web' && <Pressable style={st.redBtn} onPress={doShare}><T b>شارك ستوري</T></Pressable>}
            <Pressable style={[st.redBtn, { backgroundColor: '#333' }]} onPress={() => setShare(null)}><T b>سكّر</T></Pressable>
          </View>
          {Platform.OS === 'web' && <T s={12} style={{ color: C.muted, marginTop: 8 }}>في التطبيق تتشارك بلمسة. توا صوّر الشاشة.</T>}
        </View>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row-reverse', alignItems: 'center' },
  card: { backgroundColor: '#161616', borderRadius: 16, padding: 12, marginTop: 10, borderWidth: 1, borderColor: '#222' },
  chip: { borderWidth: 1, borderColor: '#333', borderRadius: 20, paddingVertical: 5, paddingHorizontal: 10 },
  bubble: { backgroundColor: '#0f0f0f', borderRadius: 10, paddingVertical: 4, paddingHorizontal: 8, alignSelf: 'flex-end' },
  shareBtn: { justifyContent: 'center', backgroundColor: '#1f1f1f', borderRadius: 10, padding: 10, marginTop: 4 },
  input: { backgroundColor: '#0f0f0f', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 10, color: C.bone, fontFamily: 'C6', fontSize: 15, padding: 10, textAlign: 'right', marginTop: 8 },
  redBtn: { backgroundColor: C.red, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 18, marginTop: 10 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center' },
  story: { width: 300, height: 533, backgroundColor: C.night, borderRadius: 18, borderWidth: 2, borderColor: C.red, overflow: 'hidden' },
  storyBanner: { backgroundColor: C.crimson, paddingVertical: 10 },
});

// Faceless shadow art for each enemy (assets/enemies)
export const ENEMY_IMG = {
  beast: require('../assets/enemies/beast.jpg'),
  fajr: require('../assets/enemies/fajr.jpg'),
  khanzab: require('../assets/enemies/khanzab.jpg'),
  kasal: require('../assets/enemies/kasal.jpg'),
  taswif: require('../assets/enemies/taswif.jpg'),
  nadhar: require('../assets/enemies/nadhar.jpg'),
  ghafla: require('../assets/enemies/ghafla.jpg'),
  khalawat: require('../assets/enemies/khalawat.jpg'),
};
export function EnemyArt({ id, size = 200, dead }) {
  const src = ENEMY_IMG[id];
  if (!src) return <Smoke tint="#111" size={size} dead={dead} />;
  return (
    <View style={{ width: size, height: size, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: dead ? '#2a2a2a' : '#5a1214' }}>
      <Image source={src} style={{ width: size, height: size, opacity: dead ? 0.25 : 1 }} resizeMode="cover" />
      {dead ? <View style={{ position: 'absolute', inset: 0, top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#5DBB63', fontSize: 42, fontFamily: 'C8' }}>طاح</Text></View> : null}
    </View>
  );
}
