// Daily quests card + chest.
import { useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Modal, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Icon from './icons';
import { sfx } from './sfx';
import { C } from './data';
import { keyOf, dayIndex, stats } from './logic';
import { questsOf, chestOf } from './quests';

const T = ({ s = 15, b, style, children }) => (
  <Text style={[{ color: C.bone, fontFamily: b ? 'C8' : 'C6', fontSize: s, textAlign: 'right', writingDirection: 'rtl' }, style]}>{children}</Text>
);

export default function Quests({ S, save }) {
  const k = keyOf(new Date());
  const idx = dayIndex(S.profile);
  const day = S.days[k] || {};
  const qs = questsOf(k, idx, day);
  const doneN = qs.filter((q) => q.done).length;
  const all = doneN === 3;
  const opened = !!day.chest;
  const [show, setShow] = useState(null);
  const pop = useRef(new Animated.Value(0)).current;
  const nd = Platform.OS !== 'web';

  const open = () => {
    if (!all || opened) return;
    const r = chestOf(k, stats(S).shields);
    save((x) => { x.days[k] = x.days[k] || {}; x.days[k].chest = r; return x; });
    if (nd) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    sfx('win');
    setShow(r);
    pop.setValue(0);
    Animated.spring(pop, { toValue: 1, friction: 4, tension: 70, useNativeDriver: nd }).start();
  };

  return (
    <View style={st.card}>
      <View style={[st.row, { justifyContent: 'space-between', marginBottom: 6 }]}>
        <T b s={17}>مهام اليوم</T>
        <T s={12} style={{ color: C.muted }}>{doneN} من 3 · تتجدّد غدًا</T>
      </View>
      {qs.map((q) => (
        <View key={q.id} style={[st.row, { gap: 10, paddingVertical: 8 }]}>
          <View style={[st.ic, q.done && { backgroundColor: C.red, borderColor: C.red }]}><Icon name={q.icon} size={20} color={C.bone} accent={C.bone} /></View>
          <View style={{ flex: 1 }}>
            <T s={14} b={q.done} style={q.done ? { color: C.muted, textDecorationLine: 'line-through' } : null}>{q.t}</T>
            <View style={st.track}>
              <View style={[st.fill, { width: `${(q.cur / q.n) * 100}%` }]} />
              <Text style={st.num}>{q.cur} / {q.n}</Text>
            </View>
          </View>
        </View>
      ))}
      <Pressable onPress={open} style={[st.chest, all && !opened && st.chestReady, opened && { opacity: 0.6 }]}>
        <Icon name={opened ? 'crown' : 'bag'} size={26} color={C.bone} accent={all && !opened ? C.bone : '#666'} />
        <T b s={15} style={{ flex: 1, color: all || opened ? C.bone : '#777' }}>
          {opened ? `فُتح الصندوق: ${day.chest.t}` : all ? 'افتح صندوق الغنيمة!' : 'أتمم المهام الثلاث لتفتح صندوق الغنيمة'}
        </T>
      </Pressable>

      <Modal transparent visible={!!show} animationType="fade" onRequestClose={() => setShow(null)}>
        <View style={st.back}>
          <Animated.View style={[st.box, { transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] }]}>
            <T s={14} style={{ color: C.muted, textAlign: 'center' }}>صندوق الغنيمة</T>
            <View style={{ alignItems: 'center', marginVertical: 14 }}><Icon name={show ? show.icon : 'crown'} size={84} color={C.bone} accent={C.red} /></View>
            <T b s={24} style={{ textAlign: 'center', color: C.red }}>{show ? show.t : ''}</T>
            <T s={14} style={{ textAlign: 'center', marginTop: 8 }}>أتممت مهام اليوم كلها. هكذا تُكسب الحرب: يومًا بعد يوم.</T>
            <Pressable style={st.cta} onPress={() => { sfx('tap'); setShow(null); }}><T b s={18} style={{ textAlign: 'center' }}>الحمد لله</T></Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row-reverse', alignItems: 'center' },
  card: { backgroundColor: '#151515', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 18, padding: 14, marginTop: 12 },
  ic: { width: 38, height: 38, borderRadius: 12, borderWidth: 2, borderColor: '#333', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1d1d1d' },
  track: { height: 16, borderRadius: 8, backgroundColor: '#262626', marginTop: 5, overflow: 'hidden', justifyContent: 'center' },
  fill: { position: 'absolute', right: 0, top: 0, bottom: 0, backgroundColor: C.red, borderRadius: 8 },
  num: { color: C.bone, fontFamily: 'C8', fontSize: 10, textAlign: 'center' },
  chest: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginTop: 10, borderWidth: 2, borderColor: '#2e2e2e', borderRadius: 14, padding: 12, borderBottomWidth: 5 },
  chestReady: { backgroundColor: C.crimson, borderColor: C.red, borderBottomColor: '#5a1214' },
  back: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  box: { backgroundColor: C.night, borderWidth: 2, borderColor: C.crimson, borderRadius: 22, padding: 22, alignSelf: 'stretch' },
  cta: { backgroundColor: C.red, borderRadius: 16, paddingVertical: 14, marginTop: 18, borderBottomWidth: 5, borderBottomColor: '#7d1313' },
});
