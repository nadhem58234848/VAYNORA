// Lesson of the day: read, answer one question, then the battle starts.
import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Icon from './icons';
import { sfx } from './sfx';
import { C } from './data';
import { lessonOf } from './lessons';

const T = ({ s = 15, b, style, children }) => (
  <Text style={[{ color: C.bone, fontFamily: b ? 'C8' : 'C6', fontSize: s, textAlign: 'right', writingDirection: 'rtl' }, style]}>{children}</Text>
);

export default function Lesson({ idx, onDone, close }) {
  const L = lessonOf(idx);
  const [step, setStep] = useState('read');
  const [pick, setPick] = useState(null);
  const answered = pick !== null;
  const right = pick === L.a;
  const choose = (i) => {
    if (answered) return;
    setPick(i);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    sfx(i === L.a ? 'hit' : 'tap');
  };
  return (
    <View style={{ flex: 1 }}>
      <View style={st.top}>
        <Pressable onPress={close}><T s={26} style={{ color: C.muted }}>✕</T></Pressable>
        <View style={{ flex: 1, flexDirection: 'row-reverse', alignItems: 'center', gap: 8, justifyContent: 'center' }}><Icon name="book" size={22} /><T b s={15} style={{ color: C.red }}>درس اليوم · قبل المعركة</T></View>
        <View style={{ width: 20 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}>
        {step === 'read' ? (
          <View>
            <T b s={28} style={{ marginTop: 10 }}>{L.t}</T>
            <View style={st.card}>
              <T s={18} style={{ lineHeight: 34 }}>{L.body}</T>
              <T s={12} style={{ color: C.muted, marginTop: 14 }}>{L.src}</T>
            </View>
          </View>
        ) : (
          <View>
            <T s={13} style={{ color: C.muted, marginTop: 10 }}>{L.t}</T>
            <T b s={24} style={{ marginTop: 4, marginBottom: 10 }}>{L.q}</T>
            {L.o.map((o, i) => {
              const isA = answered && i === L.a; const isWrong = answered && i === pick && !right;
              return (
                <Pressable key={i} onPress={() => choose(i)} style={[st.opt, isA && { borderColor: C.bone, backgroundColor: '#22201d' }, isWrong && { borderColor: C.red, backgroundColor: '#2a1214' }]}>
                  <T s={17} b={isA} style={{ flex: 1 }}>{o}</T>
                  {isA && <T b s={16}>✓</T>}
                  {isWrong && <T b s={16} style={{ color: C.red }}>✕</T>}
                </Pressable>
              );
            })}
            {answered && <T s={12} style={{ color: C.muted, marginTop: 12 }}>{L.src}</T>}
          </View>
        )}
      </ScrollView>
      {answered && (
        <View style={[st.banner, { backgroundColor: right ? C.bone : '#2a1214', borderColor: right ? C.bone : C.red }]}>
          <T b s={17} style={{ color: right ? C.night : C.bone }}>{right ? 'إجابة صحيحة! ضربة أولى للنفس (+10)' : 'ليست هذه. الصحيحة معلَّمة، احفظها.'}</T>
        </View>
      )}
      <Pressable
        style={[st.cta, step === 'quiz' && !answered && { opacity: 0.35 }]}
        onPress={() => { if (step === 'read') { sfx('tap'); setStep('quiz'); } else if (answered) { sfx('tap'); onDone(right); } }}
      >
        <T b s={18} style={{ textAlign: 'center' }}>{step === 'read' ? 'فهمت · إلى السؤال' : 'إلى المعركة ⚔️'}</T>
      </Pressable>
    </View>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, padding: 16 },
  card: { backgroundColor: '#151515', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 18, padding: 18, marginTop: 14, borderRightWidth: 4, borderRightColor: C.crimson },
  opt: { flexDirection: 'row-reverse', alignItems: 'center', borderWidth: 2, borderColor: '#2e2e2e', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 16, marginTop: 10, backgroundColor: '#121212', borderBottomWidth: 5 },
  banner: { position: 'absolute', bottom: 92, left: 20, right: 20, borderRadius: 14, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 14 },
  cta: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: C.red, borderRadius: 16, paddingVertical: 14, borderBottomWidth: 5, borderBottomColor: '#7d1313' },
});
