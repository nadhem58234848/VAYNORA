import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Linking, Platform, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { C, MSG, MSG_AFTER, TASK, PRAYERS, WEEKS, TEN, FIRST, ZUMAR, CITIES, SHOP, IG_DM, WIN_DAYS } from './src/data';
import { emptyState, keyOf, dayIndex, weekOf, activeHabits, prayerTimes, dayXP, stats, hm, addDays } from './src/logic';
import { rescheduleAll } from './src/notify';
import Path from './src/Path';
import Fight from './src/Fight';
import { POSE } from './src/Battle';
import { Image } from 'react-native';
import Squad from './src/Squad';
import Icon from './src/icons';

const KEY = 'vay_app_v1';

// ---------- small UI pieces ----------
const T = ({ s, style, b, children, ...p }) => (
  <Text {...p} style={[st.t, b && st.b, s && { fontSize: s }, style]}>{children}</Text>
);
const Card = ({ children, style }) => <View style={[st.card, style]}>{children}</View>;
const Btn = ({ title, onPress, kind = 'red', style, small }) => (
  <Pressable onPress={onPress} style={({ pressed }) => [st.btn, kind === 'red' ? st.btnRed : st.btnGhost, small && st.btnSmall, pressed && { opacity: 0.7 }, style]}>
    <T b s={small ? 14 : 16} style={{ textAlign: 'center' }}>{title}</T>
  </Pressable>
);
const Chip = ({ title, on, color = C.red, onPress }) => (
  <Pressable onPress={onPress} style={[st.chip, on && { backgroundColor: color, borderColor: color }]}>
    <T s={13} b={on}>{title}</T>
  </Pressable>
);
const H = ({ children }) => <T b s={20} style={{ marginBottom: 10, marginTop: 6 }}>{children}</T>;
const Row = ({ children, style }) => <View style={[st.row, style]}>{children}</View>;

// ---------- app ----------
export default function App() {
  const [fonts] = useFonts({ C6: require('./assets/fonts/Cairo-600.ttf'), C8: require('./assets/fonts/Cairo-800.ttf') });
  const [S, setS] = useState(null);
  const [tab, setTab] = useState('today');
  const [sos, setSos] = useState(false);
  const [fight, setFight] = useState(false);
  const [more, setMore] = useState(null);
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      let s = emptyState();
      try { if (raw) s = { ...s, ...JSON.parse(raw) }; } catch {}
      setS(s); loaded.current = true;
      rescheduleAll(s).catch(() => {});
    });
  }, []);

  const save = (fn, resched) => setS((prev) => {
    const next = fn(JSON.parse(JSON.stringify(prev)));
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
    if (resched) rescheduleAll(next).catch(() => {});
    return next;
  });

  if (!fonts || !S) return <View style={{ flex: 1, backgroundColor: C.night }} />;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.night }} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        {!S.profile ? <Onboard save={save} /> : (
          <View style={{ flex: 1 }}>
            <Header S={S} />
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>
              {tab === 'today' && <Path S={S} save={save} openFight={() => setFight(true)} />}
              {tab === 'squad' && <Squad S={S} save={save} />}
              {tab === 'me' && <Chain S={S} />}
              {tab === 'more' && !more && <More setMore={setMore} />}
              {tab === 'more' && more && <Pressable onPress={() => setMore(null)}><T s={14} style={{ color: C.muted, marginBottom: 8 }}>→ رجوع</T></Pressable>}
              {tab === 'more' && more === 'fajr' && <Fajr S={S} save={save} />}
              {tab === 'more' && more === 'rem' && <Reminders S={S} save={save} />}
              {tab === 'more' && more === 'shop' && <Shop S={S} save={save} />}
            </ScrollView>
            <Pressable onPress={() => setSos(true)} style={[st.sos, { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }]}><Icon name="sos" size={20} color={C.bone} accent={C.bone} /><T b s={15}>طوارئ</T></Pressable>
            <Tabs tab={tab} setTab={(t) => { setTab(t); setMore(null); }} />
          </View>
        )}
        <Modal visible={fight} animationType="slide" onRequestClose={() => setFight(false)}>
          <SafeAreaView style={{ flex: 1, backgroundColor: C.night }}>
            {fight && <Fight S={S} save={save} close={() => setFight(false)} />}
          </SafeAreaView>
        </Modal>
        <Modal visible={sos} animationType="slide" onRequestClose={() => setSos(false)}>
          <SafeAreaView style={{ flex: 1, backgroundColor: C.night }}>
            <Emergency save={save} close={() => setSos(false)} />
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function Header({ S }) {
  const s = stats(S);
  return (
    <View style={st.header}>
      <T b s={15} style={{ letterSpacing: 3, color: C.red }}>VAYNORA</T>
      <View style={{ flexDirection: 'row-reverse', gap: 16, alignItems: 'center' }}>
        <View style={st.hstat}><Icon name="chain" size={20} /><T b s={16}>{s.chain}</T></View>
        <View style={st.hstat}><T s={16}>⭐</T><T b s={16}>{s.xp}</T></View>
        <View style={st.hstat}><Icon name="shield" size={20} accent={C.green} /><T b s={16}>{s.shields}</T></View>
      </View>
    </View>
  );
}

function More({ setMore }) {
  const items = [['fajr', 'sun', 'الفجر والنوم', 'منبّه الفجر، خطة النوم، أيام الفجر'], ['rem', 'bell', 'التذكيرات', 'الصلاة، الرياضة، درع الليل، مهامي'], ['shop', 'bag', 'المتجر', 'دفتر حرب النفس بالدفع عند الاستلام']];
  return (
    <View>
      {items.map(([id, ic, n, d]) => (
        <Pressable key={id} onPress={() => setMore(id)} style={[st.card, { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 }]}>
          <Icon name={ic} size={28} />
          <View style={{ flex: 1 }}><T b s={17}>{n}</T><T s={12} style={{ color: C.muted }}>{d}</T></View>
          <T s={18} style={{ color: C.muted }}>‹</T>
        </Pressable>
      ))}
    </View>
  );
}

function Tabs({ tab, setTab }) {
  const items = [['today', 'sword', 'الطريق'], ['squad', 'flag', 'الكتيبة'], ['me', 'crown', 'VAY'], ['more', 'bell', 'المزيد']];
  return (
    <View style={st.tabs}>
      {items.map(([id, ic, n]) => (
        <Pressable key={id} onPress={() => setTab(id)} style={st.tab}>
          <Icon name={ic} size={22} color={tab === id ? C.bone : C.muted} accent={tab === id ? C.red : C.muted} />
          <T s={11} b={tab === id} style={{ color: tab === id ? C.red : C.muted }}>{n}</T>
        </Pressable>
      ))}
    </View>
  );
}

// ---------- onboarding ----------
const INTRO = [
  ['fight', 'أنا VAY.', 'كل واحد فينا في حرب. الحرب العظمى هي حرب النفس، والعدو الكبير هو «النفس الأمّارة».'],
  ['fall', 'وكل يوم معارك صغيرة.', 'شيطان الفجر يعقدلك 3 عقد وانت راقد. خنزب يسرقلك الخشوع. الكسل والتسويف يقولولك «غدوة».'],
  ['win', 'ما تحاربش وحدك.', 'كل صلاة وكل عادة ضربة. 21 يوم، 3 جبهات، وأنا معاك. وكي تطيح، نقوّموك. يزّي؟'],
];
function Onboard({ save }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [city, setCity] = useState('سوسة');
  if (step < 3) {
    const [pose, t1, t2] = INTRO[step];
    return (
      <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row-reverse', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
          {[0, 1, 2].map((i) => <View key={i} style={{ width: i === step ? 26 : 8, height: 8, borderRadius: 4, backgroundColor: i === step ? C.red : '#333' }} />)}
        </View>
        <Image source={POSE[pose]} style={{ width: 200, height: 300, alignSelf: 'center' }} resizeMode="contain" />
        <T b s={28} style={{ textAlign: 'center', marginTop: 16 }}>{t1}</T>
        <T s={16} style={{ textAlign: 'center', color: '#cfc6bd', marginTop: 8 }}>{t2}</T>
        <Btn style={{ marginTop: 28 }} title={step < 2 ? 'كمّل' : 'نبدا الحرب ⚔️'} onPress={() => setStep(step + 1)} />
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <T b s={30} style={{ letterSpacing: 3, textAlign: 'center', marginTop: 20, color: C.red }}>VAYNORA</T>
      <T b s={22} style={{ textAlign: 'center' }}>حرب النفس</T>
      <T s={15} style={{ textAlign: 'center', color: C.muted, marginBottom: 24 }}>اصنع من الألم قوة</T>
      <T b style={{ marginTop: 12 }}>شنوة اسمك يا محارب؟</T>
      <TextInput value={name} onChangeText={setName} placeholder="اسمك" placeholderTextColor={C.muted} style={st.input} />
      <T b style={{ marginTop: 12 }}>مدينتك (لمواقيت الصلاة)</T>
      <View style={st.wrap}>{CITIES.map(([c]) => <Chip key={c} title={c} on={city === c} onPress={() => setCity(c)} />)}</View>
      <Btn style={{ marginTop: 20 }} title="نبدا اليوم ⚔️" onPress={() => {
        if (!name.trim()) return;
        save((s) => { s.profile = { name: name.trim(), city, start: keyOf(new Date()) }; return s; }, true);
      }} />
      <T s={12} style={{ color: C.muted, textAlign: 'center', marginTop: 10 }}>بياناتك تقعد في تلفونك. حساب VAYNORA تعملو من بعد في «الكتيبة».</T>
    </ScrollView>
  );
}

// ---------- today ----------
function Today({ S, save }) {
  const k = keyOf(new Date());
  const idx = dayIndex(S.profile);
  const d = S.days[k] || {};
  const pt = prayerTimes(S.profile.city);
  const set = (fn) => save((s) => { s.days[k] = s.days[k] || {}; fn(s.days[k]); return s; });
  const msg = idx <= 21 ? MSG[idx - 1] : MSG_AFTER;
  const task = idx <= 21 ? TASK[idx - 1] : 'عاود نفس الروتين وزيد خطوة صغيرة.';
  const [win, setWin] = useState(d.win || '');
  const [lost, setLost] = useState(d.lost || '');
  const [tom, setTom] = useState(d.tom || '');

  return (
    <View>
      <T s={13} style={{ color: C.muted }}>النهار {idx}{idx <= 21 ? ' من 21' : ''} · {WEEKS[weekOf(Math.min(idx, 21)) - 1]}</T>
      <Card style={{ borderColor: C.crimson, borderWidth: 1, marginTop: 8 }}>
        <T b s={13} style={{ color: C.red }}>✉️ رسالة من ناظم</T>
        <T s={15} style={{ marginTop: 4 }}>{msg}</T>
      </Card>
      <Card>
        <T b s={13} style={{ color: C.amber }}>🎯 مهمة اليوم</T>
        <Row style={{ justifyContent: 'space-between', marginTop: 4 }}>
          <T s={15} style={{ flex: 1 }}>{task}</T>
          <Chip title={d.task ? '✓ عملتها' : 'عملتها؟'} on={!!d.task} color={C.green} onPress={() => set((x) => { x.task = !x.task; })} />
        </Row>
      </Card>

      <H>🕌 الصلوات</H>
      {PRAYERS.map(([id, n]) => {
        const v = d.pr && d.pr[id];
        return (
          <Card key={id} style={{ paddingVertical: 10 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <View><T b s={16}>{n}</T><T s={12} style={{ color: C.muted }}>{hm(pt[id])}</T></View>
              <Row>
                <Chip title="في وقتها" on={v === 'w'} color={C.green} onPress={() => set((x) => { x.pr = x.pr || {}; x.pr[id] = v === 'w' ? null : 'w'; })} />
                <Chip title="في نهارها" on={v === 'd'} color={C.amber} onPress={() => set((x) => { x.pr = x.pr || {}; x.pr[id] = v === 'd' ? null : 'd'; })} />
                <Chip title="فاتت" on={v === 'm'} color="#555" onPress={() => set((x) => { x.pr = x.pr || {}; x.pr[id] = v === 'm' ? null : 'm'; })} />
              </Row>
            </Row>
          </Card>
        );
      })}

      <H>✅ العادات</H>
      {activeHabits(idx).map((h) => {
        const v = d.h && d.h[h.id];
        const tg = (val) => set((x) => { x.h = x.h || {}; x.h[h.id] = v === val ? null : val; });
        return (
          <Card key={h.id} style={{ paddingVertical: 10 }}>
            <T b s={16}>{h.t}</T>
            <Row style={{ marginTop: 6 }}>
              <Chip title={'كاملة · ' + h.full} on={v === 'f'} color={C.green} onPress={() => tg('f')} />
              <Chip title={'على الأقل · ' + h.min} on={v === 'm'} color={C.amber} onPress={() => tg('m')} />
              <Chip title="فلتت" on={v === 'x'} color="#555" onPress={() => tg('x')} />
            </Row>
          </Card>
        );
      })}

      <H>🌙 التقرير الليلي</H>
      <Card>
        <T b>شنوة ربحت اليوم؟</T>
        <TextInput value={win} onChangeText={setWin} multiline style={st.input} placeholderTextColor={C.muted} placeholder="حتى حاجة صغيرة تحسب" />
        <T b style={{ marginTop: 8 }}>شنوة فلت، وعلاش؟</T>
        <TextInput value={lost} onChangeText={setLost} multiline style={st.input} placeholderTextColor={C.muted} placeholder="بلا جلد للذات، بصدق" />
        <T b style={{ marginTop: 8 }}>المهمة الأولى متاع غدوة</T>
        <TextInput value={tom} onChangeText={setTom} style={st.input} placeholderTextColor={C.muted} placeholder="حاجة وحدة، الأهم" />
        <Btn style={{ marginTop: 10 }} title={d.report ? '✓ التقرير محفوظ' : 'احفظ التقرير (+15 ⭐)'} onPress={() => set((x) => { x.win = win; x.lost = lost; x.tom = tom; x.report = true; })} />
      </Card>
      <T s={13} style={{ color: C.muted, textAlign: 'center' }}>نقاط اليوم: ⭐ {dayXP(d, idx)}</T>
    </View>
  );
}

// ---------- chain, ranks, badges, certificate ----------
function Chain({ S }) {
  const s = stats(S);
  const last7 = s.list.slice(-7);
  return (
    <View>
      <Card style={{ alignItems: 'center' }}>
        <T s={14} style={{ color: C.muted }}>السلسلة</T>
        <T b s={48} style={{ color: C.red }}>🔗 {s.chain}</T>
        <T s={13} style={{ color: C.muted }}>أطول سلسلة: {s.best} · أيام ربحتها: {s.won}</T>
        <T s={13} style={{ marginTop: 6, textAlign: 'center' }}>القاعدة: ما تفلّتش زوز أيام ورا بعضهم. نهار واحد ما يكسرش السلسلة.</T>
      </Card>
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <View><T s={13} style={{ color: C.muted }}>رتبتك</T><T b s={22}>{s.rank}</T></View>
          <View style={{ alignItems: 'flex-start' }}><T s={13} style={{ color: C.muted }}>نقاطك</T><T b s={22}>⭐ {s.xp}</T></View>
        </Row>
        {s.next && (
          <View style={{ marginTop: 10 }}>
            <View style={st.bar}><View style={[st.barIn, { width: `${Math.min(100, (s.xp / s.next[0]) * 100)}%` }]} /></View>
            <T s={12} style={{ color: C.muted, marginTop: 4 }}>باقيلك {s.next[0] - s.xp} نقطة لـ «{s.next[1]}»</T>
          </View>
        )}
      </Card>

      <H>📅 بطاقة الأسبوع</H>
      <Card>
        <Row style={{ justifyContent: 'space-around' }}>
          {last7.map((x) => (
            <View key={x.k} style={{ alignItems: 'center' }}>
              <View style={[st.dot, x.won ? { backgroundColor: C.red } : x.today ? { borderColor: C.red } : { backgroundColor: '#333' }]}>
                <T b s={13}>{x.won ? '✓' : x.today ? '•' : '✕'}</T>
              </View>
              <T s={11} style={{ color: C.muted }}>{x.i}</T>
            </View>
          ))}
        </Row>
        <T s={12} style={{ color: C.muted, textAlign: 'center', marginTop: 8 }}>صوّر الشاشة وحطها ستوري مع @vaynora_</T>
      </Card>

      <H>🏅 الشارات</H>
      <View style={st.wrap}>
        {s.badges.map(([ic, n, ok]) => (
          <View key={n} style={[st.badge, !ok && { opacity: 0.35 }]}><T s={26}>{ic}</T><T s={12} style={{ textAlign: 'center' }}>{n}</T></View>
        ))}
      </View>

      <H>📜 الشهادة</H>
      {s.certified ? (
        <View style={st.cert}>
          <T b s={14} style={{ color: C.red, letterSpacing: 3, textAlign: 'center' }}>VAYNORA</T>
          <T b s={22} style={{ textAlign: 'center', marginTop: 6 }}>شهادة محارب</T>
          <T s={14} style={{ textAlign: 'center', marginTop: 10 }}>تشهد VAYNORA أن</T>
          <T b s={26} style={{ textAlign: 'center', color: C.red }}>{S.profile.name}</T>
          <T s={14} style={{ textAlign: 'center' }}>أتمّ تحدي حرب النفس 21 يوم، وربح {s.first21} يوم منها.</T>
          <T s={13} style={{ textAlign: 'center', color: C.muted, marginTop: 8 }}>{keyOf(new Date())} · ناظم</T>
          <T s={12} style={{ textAlign: 'center', marginTop: 12 }}>ابعث «كمّلت» لناظم مع تصويرة السلسلة باش تاخو الشهادة الرسمية PDF.</T>
          <Btn small style={{ marginTop: 10 }} title="ابعث «كمّلت» لناظم" onPress={() => Linking.openURL(IG_DM)} />
        </View>
      ) : (
        <Card>
          <T s={14}>تربح الشهادة كي تكمّل 21 يوم وتربح {WIN_DAYS} يوم منهم على الأقل.</T>
          <T s={13} style={{ color: C.muted, marginTop: 4 }}>توّا: ربحت {s.first21} · النهار {Math.min(s.todayIdx, 21)} من 21</T>
        </Card>
      )}
    </View>
  );
}

// ---------- fajr ----------
function Fajr({ S, save }) {
  const s = stats(S);
  const pt = prayerTimes(S.profile.city);
  const ptTom = prayerTimes(S.profile.city, addDays(new Date(), 1));
  const st8 = S.settings;
  const shift = (field, delta) => save((x) => {
    const [h, m] = x.settings[field].split(':').map(Number);
    let t = h * 60 + m + delta; t = ((t % 1440) + 1440) % 1440;
    x.settings[field] = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
    return x;
  }, true);
  const sleepH = (() => { const [a, b] = st8.sleep.split(':').map(Number); const [c, d] = st8.wake.split(':').map(Number); let m = (c * 60 + d) - (a * 60 + b); if (m < 0) m += 1440; return (m / 60).toFixed(1); })();
  return (
    <View>
      <Card style={{ alignItems: 'center' }}>
        <T s={14} style={{ color: C.muted }}>الفجر اليوم في {S.profile.city}</T>
        <T b s={40}>{hm(pt.fajr)}</T>
        <T s={13} style={{ color: C.muted }}>غدوة: {hm(ptTom.fajr)} · الشروق: {hm(pt.sunrise)}</T>
      </Card>
      <Row style={{ gap: 10 }}>
        <Card style={{ flex: 1, alignItems: 'center' }}><T s={13} style={{ color: C.muted }}>فجر ورا بعضو</T><T b s={28} style={{ color: C.red }}>{s.fajrRun}</T></Card>
        <Card style={{ flex: 1, alignItems: 'center' }}><T s={13} style={{ color: C.muted }}>أيام الفجر الكل</T><T b s={28}>{s.fajrDays}</T></Card>
      </Row>
      <H>⏰ منبّه الفجر</H>
      <Card>
        <T s={14}>3 تنبيهات، كل 3 دقايق، كل واحد أقوى من اللي قبلو.</T>
        <Row style={{ justifyContent: 'space-between', marginTop: 10 }}>
          <Btn small kind="ghost" title="−5" onPress={() => shift('wake', -5)} />
          <View style={{ alignItems: 'center' }}><T s={12} style={{ color: C.muted }}>وقت القيام</T><T b s={28}>{st8.wake}</T></View>
          <Btn small kind="ghost" title="+5" onPress={() => shift('wake', 5)} />
        </Row>
        <Row style={{ justifyContent: 'center', marginTop: 8 }}>
          <Chip title={st8.fajr ? 'المنبّه شاعل' : 'المنبّه طافي'} on={st8.fajr} onPress={() => save((x) => { x.settings.fajr = !x.settings.fajr; return x; }, true)} />
        </Row>
        <T s={12} style={{ color: C.muted, textAlign: 'center', marginTop: 6 }}>نصيحة: قوم 20 لـ30 دقيقة قبل الفجر ({hm(new Date(ptTom.fajr - 25 * 60000))} غدوة).</T>
      </Card>
      <H>🌙 خطة النوم</H>
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Btn small kind="ghost" title="−15" onPress={() => shift('sleep', -15)} />
          <View style={{ alignItems: 'center' }}><T s={12} style={{ color: C.muted }}>وقت الرقاد</T><T b s={28}>{st8.sleep}</T></View>
          <Btn small kind="ghost" title="+15" onPress={() => shift('sleep', 15)} />
        </Row>
        <T s={14} style={{ textAlign: 'center', marginTop: 6, color: sleepH < 6 ? C.amber : C.bone }}>ترقد {sleepH} ساعة{sleepH < 6 ? ' · قليل، قدّم وقت الرقاد' : ''}</T>
        <T s={13} style={{ marginTop: 8 }}>• تذكير 30 دقيقة قبل الرقاد{'\n'}• الشارجور برّا بيت الرقاد{'\n'}• المنبّه بعيد على الفراش{'\n'}• ما تشربش قهوة بعد العصر</T>
      </Card>
    </View>
  );
}

// ---------- reminders ----------
function Reminders({ S, save }) {
  const [t, setT] = useState('');
  const [time, setTime] = useState('08:00');
  const [daily, setDaily] = useState(true);
  const s = S.settings;
  const tg = (f) => save((x) => { x.settings[f] = !x.settings[f]; return x; }, true);
  const valid = /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
  return (
    <View>
      <H>⏰ التذكيرات</H>
      {Platform.OS === 'web' && <Card><T s={13} style={{ color: C.amber }}>التذكيرات تخدم في التطبيق على التلفون، موش في المتصفح.</T></Card>}
      {[['prayers', '🕌 مواقيت الصلاة الخمسة'], ['fajr', '🌅 منبّه الفجر وتذكير الرقاد'], ['shield', '🛡️ درع الليل 22:00'], ['sportOn', '💪 الرياضة · ' + s.sport]].map(([f, n]) => (
        <Card key={f} style={{ paddingVertical: 10 }}>
          <Row style={{ justifyContent: 'space-between' }}><T s={15}>{n}</T><Chip title={s[f] ? 'شاعل' : 'طافي'} on={s[f]} onPress={() => tg(f)} /></Row>
        </Card>
      ))}
      <Card style={{ paddingVertical: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T s={14}>وقت الرياضة</T>
          <Row>{['06:00', '17:30', '19:00', '21:00'].map((v) => <Chip key={v} title={v} on={s.sport === v} onPress={() => save((x) => { x.settings.sport = v; return x; }, true)} />)}</Row>
        </Row>
      </Card>

      <H>📌 مهامي</H>
      <Card>
        <TextInput value={t} onChangeText={setT} placeholder="المهمة (مثلا: نقرا 10 صفحات)" placeholderTextColor={C.muted} style={st.input} />
        <Row style={{ marginTop: 8, justifyContent: 'space-between' }}>
          <TextInput value={time} onChangeText={setTime} placeholder="08:00" placeholderTextColor={C.muted} style={[st.input, { width: 90, textAlign: 'center' }]} />
          <Row><Chip title="كل يوم" on={daily} onPress={() => setDaily(true)} /><Chip title="اليوم برك" on={!daily} onPress={() => setDaily(false)} /></Row>
        </Row>
        {!valid && <T s={12} style={{ color: C.amber }}>اكتب الوقت هكا: 08:00</T>}
        <Btn style={{ marginTop: 10 }} title="زيد المهمة" onPress={() => {
          if (!t.trim() || !valid) return;
          save((x) => { x.tasks.push({ id: Date.now(), t: t.trim(), time, daily, date: daily ? null : keyOf(new Date()) }); return x; }, true);
          setT('');
        }} />
      </Card>
      {S.tasks.map((x) => (
        <Card key={x.id} style={{ paddingVertical: 10 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}><T b>{x.t}</T><T s={12} style={{ color: C.muted }}>{x.time} · {x.daily ? 'كل يوم' : x.date}</T></View>
            <Chip title="نحّي" onPress={() => save((y) => { y.tasks = y.tasks.filter((z) => z.id !== x.id); return y; }, true)} />
          </Row>
        </Card>
      ))}
    </View>
  );
}

// ---------- shop ----------
function Shop({ S, save }) {
  const item = SHOP[0];
  const [f, setF] = useState({ name: S.profile.name, phone: '', city: '', address: '', qty: '1' });
  const [sent, setSent] = useState(false);
  const ok = f.name && /^\d{8}$/.test(f.phone.replace(/\s/g, '')) && f.city && f.address;
  const text = `طلب ${item.t}\nالاسم: ${f.name}\nالتلفون: ${f.phone}\nالولاية: ${f.city}\nالعنوان: ${f.address}\nالعدد: ${f.qty}\nالدفع عند الاستلام`;
  return (
    <View>
      <H>📒 المتجر</H>
      <Card style={{ borderColor: C.crimson, borderWidth: 1 }}>
        <T b s={18}>{item.t}</T>
        <T s={14} style={{ marginTop: 4 }}>{item.d}</T>
        <T b s={22} style={{ color: C.red, marginTop: 8 }}>{item.price} د.ت</T>
        <T s={12} style={{ color: C.muted }}>الدفع عند الاستلام · كمّل حربك والدفتر في يدك</T>
      </Card>
      <H>احجز نسختك</H>
      <Card>
        {[['name', 'الاسم واللقب'], ['phone', 'رقم التلفون (8 أرقام)'], ['city', 'الولاية'], ['address', 'العنوان']].map(([k, p]) => (
          <TextInput key={k} value={f[k]} onChangeText={(v) => setF({ ...f, [k]: v })} placeholder={p} placeholderTextColor={C.muted} keyboardType={k === 'phone' ? 'phone-pad' : 'default'} style={[st.input, { marginBottom: 8 }]} />
        ))}
        <Row>{['1', '2', '3'].map((q) => <Chip key={q} title={`${q} نسخة`} on={f.qty === q} onPress={() => setF({ ...f, qty: q })} />)}</Row>
        <T b s={16} style={{ marginTop: 8 }}>المجموع: {item.price * Number(f.qty)} د.ت</T>
        <Btn style={{ marginTop: 10, opacity: ok ? 1 : 0.5 }} title="ابعث الطلب لناظم" onPress={async () => {
          if (!ok) return;
          await Clipboard.setStringAsync(text);
          save((x) => { x.orders.push({ at: new Date().toISOString(), ...f, item: item.id }); return x; });
          setSent(true);
          Linking.openURL(IG_DM);
        }} />
        {sent && <T s={13} style={{ color: C.green, marginTop: 8 }}>✓ الطلب تنسخ. في إنستغرام اعمل «لصق» وابعثو لناظم.</T>}
        {!ok && <T s={12} style={{ color: C.muted, marginTop: 6 }}>عبّي الاسم، التلفون، الولاية والعنوان.</T>}
      </Card>
    </View>
  );
}

// ---------- emergency ----------
function Emergency({ save, close }) {
  const [mode, setMode] = useState('timer'); // timer | passed | fell
  const [left, setLeft] = useState(600);
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (mode !== 'timer') return;
    const id = setInterval(() => setLeft((l) => (l > 0 ? l - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [mode]);
  const mm = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <T b s={20} style={{ color: C.red }}>🔴 زر الطوارئ</T>
        <Pressable onPress={close}><T s={16} style={{ color: C.muted }}>سكّر ✕</T></Pressable>
      </Row>
      {mode === 'timer' && (
        <View>
          <T s={15} style={{ marginTop: 10 }}>الموجة تعدّي. قاعدة 10 دقايق: ما تعمل حتى قرار قبل ما يوفى العدّاد.</T>
          <T b s={64} style={{ textAlign: 'center', marginVertical: 16 }}>{mm}</T>
          <Card style={{ borderColor: C.red, borderWidth: 1 }}>
            <T s={13} style={{ color: C.muted }}>الخطوة {step + 1} من {TEN.length}</T>
            <T b s={18} style={{ marginTop: 4 }}>{TEN[step]}</T>
          </Card>
          <Row style={{ justifyContent: 'space-between' }}>
            <Btn small kind="ghost" title="الخطوة اللي قبل" onPress={() => setStep(Math.max(0, step - 1))} />
            <Btn small kind="ghost" title="الخطوة الجاية" onPress={() => setStep(Math.min(TEN.length - 1, step + 1))} />
          </Row>
          <Btn style={{ marginTop: 16 }} title="✓ عدّات الموجة" onPress={() => { save((s) => { s.sos.passed++; const k = keyOf(new Date()); s.days[k] = s.days[k] || {}; s.days[k].sos = (s.days[k].sos || 0) + 1; return s; }); setMode('passed'); }} />
          <Btn kind="ghost" style={{ marginTop: 10 }} title="طحت" onPress={() => { save((s) => { s.sos.falls++; const k = keyOf(new Date()); s.days[k] = s.days[k] || {}; s.days[k].fell = true; return s; }); setMode('fell'); }} />
        </View>
      )}
      {mode === 'passed' && (
        <View style={{ marginTop: 20 }}>
          <T b s={26} style={{ textAlign: 'center' }}>🛡️ ربحت المعركة هاذي</T>
          <T s={15} style={{ textAlign: 'center', marginTop: 10 }}>+20 ⭐. كل موجة تعدّيها تقوّيك للي بعدها. احمد ربي وارجع لنهارك.</T>
          <Btn style={{ marginTop: 20 }} title="نرجع لنهاري" onPress={close} />
        </View>
      )}
      {mode === 'fell' && (
        <View style={{ marginTop: 10 }}>
          <T b s={22}>إن سقطت اليوم</T>
          <T s={15} style={{ marginTop: 6 }}>ما رجعتش للصفر. السلسلة ما تتكسرش بنهار واحد. المهم شنوة تعمل توا:</T>
          {FIRST.map((x, i) => <Card key={i} style={{ paddingVertical: 10 }}><T s={15}>{i + 1}. {x}</T></Card>)}
          <Card style={{ borderColor: C.crimson, borderWidth: 1 }}><T s={16} style={{ textAlign: 'center' }}>{ZUMAR}</T></Card>
          <Btn title="نرجع لتحدّيا" onPress={close} />
        </View>
      )}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  t: { color: C.bone, fontFamily: 'C6', fontSize: 15, textAlign: 'right', writingDirection: 'rtl' },
  b: { fontFamily: 'C8' },
  card: { backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 10 },
  row: { flexDirection: 'row-reverse', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  wrap: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginVertical: 8 },
  btn: { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 18 },
  btnSmall: { paddingVertical: 8, paddingHorizontal: 12 },
  btnRed: { backgroundColor: C.red },
  btnGhost: { borderWidth: 1, borderColor: C.line },
  chip: { borderWidth: 1, borderColor: C.line, borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  input: { backgroundColor: '#111', borderWidth: 1, borderColor: C.line, borderRadius: 10, color: C.bone, fontFamily: 'C6', fontSize: 15, padding: 10, textAlign: 'right', marginTop: 6 },
  hstat: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line },
  tabs: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row-reverse', backgroundColor: '#111', borderTopWidth: 1, borderTopColor: C.line, paddingVertical: 6 },
  tab: { flex: 1, alignItems: 'center' },
  sos: { position: 'absolute', bottom: 76, left: 16, backgroundColor: C.red, borderRadius: 30, paddingVertical: 10, paddingHorizontal: 16, elevation: 6 },
  bar: { height: 8, backgroundColor: '#2a2a2a', borderRadius: 4, overflow: 'hidden' },
  barIn: { height: 8, backgroundColor: C.red },
  dot: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent', marginBottom: 4 },
  badge: { width: '30%', backgroundColor: C.card, borderRadius: 12, padding: 10, alignItems: 'center' },
  cert: { backgroundColor: '#140b0b', borderWidth: 2, borderColor: C.red, borderRadius: 16, padding: 20, marginBottom: 10 },
});
