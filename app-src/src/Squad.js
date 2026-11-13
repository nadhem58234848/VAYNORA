import { useState } from 'react';
import { View, Text, Pressable, TextInput, Share, StyleSheet } from 'react-native';
import Icon from './icons';
import { C } from './data';
import { stats } from './logic';
import { beast } from './battle';

const T = ({ s = 15, b, style, children }) => (
  <Text style={[{ color: C.bone, fontFamily: b ? 'C8' : 'C6', fontSize: s, textAlign: 'right', writingDirection: 'rtl' }, style]}>{children}</Text>
);
const APP_URL = 'https://nadhem58234848.github.io/VAYNORA/app/';

// VAYNORA account + squad. Accounts and friends' progress need the server (Supabase), not connected yet.
export default function Squad({ S, save }) {
  const acc = S.account;
  const [user, setUser] = useState('');
  const s = stats(S);
  const b = beast(S);
  const ok = /^[a-z0-9_.]{3,20}$/.test(user);

  if (!acc) {
    return (
      <View>
        <T b s={22}>حساب VAYNORA</T>
        <T s={14} style={{ color: C.muted, marginTop: 4 }}>أنشئ حسابك ليجدك أصدقاؤك ويروا تقدّمك وترى تقدّمهم.</T>
        <View style={st.card}>
          <T b>اسم المحارب (بالحروف اللاتينية)</T>
          <TextInput value={user} onChangeText={(v) => setUser(v.toLowerCase().trim())} autoCapitalize="none" placeholder="mohamed_21" placeholderTextColor={C.muted} style={st.input} />
          {!!user && !ok && <T s={12} style={{ color: C.amber }}>من 3 إلى 20 حرفًا: a-z، أرقام، _ أو .</T>}
          <Pressable style={[st.red, !ok && { opacity: 0.5 }]} onPress={() => ok && save((x) => { x.account = { user, at: new Date().toISOString(), synced: false }; return x; })}>
            <T b style={{ textAlign: 'center' }}>أنشئ الحساب ⚔️</T>
          </Pressable>
        </View>
      </View>
    );
  }

  const invite = () => Share.share({ message: `دخلتُ حرب النفس مع VAYNORA ⚔️ انضمّ إلى كتيبتي ولنرَ من يُسقط شياطينه أكثر. اسمي: @${acc.user}\n${APP_URL}` }).catch(() => {});

  return (
    <View>
      <T b s={22}>⚔️ الكتيبة</T>
      <T s={14} style={{ color: C.muted }}>أنت وأصدقاؤك ضد الوحش نفسه. كلٌّ يرى ضربات رفاقه.</T>
      <View style={[st.card, { borderColor: C.crimson }]}>
        <View style={[st.row, { justifyContent: 'space-between' }]}>
          <View><T b s={18}>@{acc.user}</T><T s={12} style={{ color: C.red }}>{s.rank}</T></View>
          <Icon name="flag" size={30} />
        </View>
        <View style={[st.row, { justifyContent: 'space-around', marginTop: 10 }]}>
          <View style={{ alignItems: 'center' }}><T b s={20}>🔗 {s.chain}</T><T s={11} style={{ color: C.muted }}>السلسلة</T></View>
          <View style={{ alignItems: 'center' }}><T b s={20}>⭐ {s.xp}</T><T s={11} style={{ color: C.muted }}>النقاط</T></View>
          <View style={{ alignItems: 'center' }}><T b s={20}>{Math.round(100 - (b.hp / b.max) * 100)}%</T><T s={11} style={{ color: C.muted }}>ضعف الوحش</T></View>
        </View>
      </View>
      <Pressable style={st.red} onPress={invite}><T b style={{ textAlign: 'center' }}>تحدَّ صديقك لينضمّ إليك</T></Pressable>
      <View style={st.card}>
        <T b>رفاقي</T>
        <T s={13} style={{ color: C.muted, marginTop: 6 }}>قائمة الرفاق وتقدّمهم تُفتح حين نربط الحسابات بالخادم. حسابك الآن محفوظ في هاتفك، وسيُرسل تلقائيًّا عند الربط.</T>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row-reverse', alignItems: 'center' },
  card: { backgroundColor: '#161616', borderRadius: 16, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#222' },
  input: { backgroundColor: '#0f0f0f', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 10, color: C.bone, fontFamily: 'C6', fontSize: 15, padding: 10, textAlign: 'left', marginTop: 8 },
  red: { backgroundColor: C.red, borderRadius: 12, paddingVertical: 12, marginTop: 12 },
});
