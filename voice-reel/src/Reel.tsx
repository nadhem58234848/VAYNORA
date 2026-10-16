/* ═══ ريل بالصوت فقط — «حرب النفس» ═══
   كل شي يجي من reel.json: الكلمات (توقيت الصوت) + المشاهد (نوع، وقت، مود، انتقال).
   الطبقات: خلفية مسطّحة (أكحل/أحمر) ← المشهد (مع انتقاله وكاميرا خفيفة) ← الكابشن فوق ← الهوية. */
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {T, FPS} from './theme';
import {p, ease, eio, lerp, abs, pulse} from './util';
import {SCENES} from './scenes';
import {Captions} from './Captions';
import reel from './reel.json';

export type Scene = {type:string; s:number; e:number; mood?:'night'|'red'; tr?:'whip'|'zoom'|'blob'|'cut'; [k:string]:any};
const R = reel as any;
const SC: Scene[] = R.scenes;
const HOT: number[] = R.lines.flat().filter((w:any) => w.hot).map((w:any) => w.s);
export const moodBg = (m?:string) => (m === 'red' ? T.signal : T.night);

/* الخلفية: لون المود، والانتقال "blob" = بقع دايرية من لون المشهد الجاي تغطي الشاشة */
const Background = ({t}:{t:number}) => {
  const i = Math.max(0, SC.findIndex(s => t >= s.s && t < s.e));
  const cur = SC[i] ?? SC[0], prev = SC[i-1];
  const D = 0.5, k = cur.tr === 'blob' && prev ? eio(p(t, cur.s - 0.05, cur.s + D)) : 1;
  const from = prev ? moodBg(prev.mood) : moodBg(cur.mood), to = moodBg(cur.mood);
  const blobs = [[0.15,0.2,0],[0.85,0.35,0.06],[0.3,0.75,0.1],[0.75,0.85,0.04],[0.5,0.5,0.12]];
  return (
    <AbsoluteFill style={{background: k >= 1 ? to : from}}>
      {k < 1 && blobs.map(([x,y,d], j) => {
        const r = 1500 * eio(p(t, cur.s - 0.05 + d, cur.s + D));
        return <div key={j} style={abs({left:x*1080-r, top:y*1920-r, width:2*r, height:2*r, borderRadius:'50%', background:to})}/>;
      })}
    </AbsoluteFill>
  );
};

/* غلاف المشهد: انتقال الدخول/الخروج + دفعة كاميرا بطيئة + نبضة مع الكلمة القوية */
const Wrap = ({sc, t, children}:{sc:Scene; t:number; children:React.ReactNode}) => {
  const ke = p(t, sc.s, sc.s + 0.32), kx = p(t, sc.e - 0.2, sc.e);
  const push = 1 + 0.035 * p(t, sc.s, sc.e);
  const punch = HOT.reduce((m, h) => Math.max(m, h >= sc.s && h < sc.e ? pulse(t, h, 0.3) : 0), 0);
  let tf = '', blur = 0, op = 1;
  const tr = sc.tr ?? 'whip';
  if (tr === 'whip') { tf = `translateX(${lerp(-760,0,ease(ke)) + lerp(0,760,eio(kx))}px)`; blur = 26*(1-ke) + 26*kx; }
  else if (tr === 'zoom') { tf = `scale(${lerp(1.4,1,ease(ke)) * lerp(1,1.25,kx)})`; blur = 16*(1-ke) + 12*kx; op = Math.min(ke*1.6, 1-kx); }
  else if (tr === 'blob') { tf = `scale(${lerp(0.85,1,ease(p(t, sc.s+0.15, sc.s+0.5)))})`; op = Math.min(p(t, sc.s+0.15, sc.s+0.4), 1-kx); }
  else { op = Math.min(p(t, sc.s, sc.s+0.06), 1-kx); }
  return (
    <AbsoluteFill style={{opacity:op, filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
      transform:`${tf} scale(${push + 0.03*punch})`, transformOrigin:'50% 48%'}}>{children}</AbsoluteFill>
  );
};

/* الشريط الأحمر على الحاشية + الهاندل — هوية ثابتة */
const Chrome = ({t}:{t:number}) => {
  const sc = SC.find(s => t >= s.s && t < s.e);
  const red = sc?.mood === 'red' && sc?.type !== 'vay', end = sc?.type === 'end';
  return (<>
    <div style={abs({right:0, top:0, bottom:0, width:14, background: red ? T.night : T.crimson})}/>
    {!end && <div style={abs({left:0, right:0, bottom:150, textAlign:'center', fontFamily:'Cairo', fontWeight:600, fontSize:30,
      letterSpacing:1, color: red ? 'rgba(13,13,13,0.7)' : 'rgba(244,241,236,0.45)'})}>{T.handle}</div>}
  </>);
};

export const Reel = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{fontFamily:'Cairo', direction:'rtl', overflow:'hidden'}}>
      <Background t={t}/>
      {SC.map((sc, i) => {
        if (t < sc.s - 0.02 || t > sc.e + 0.02) return null;
        const C = SCENES[sc.type]; if (!C) return null;
        return <Wrap key={i} sc={sc} t={t}><C sc={sc} t={t} red={sc.mood === 'red'}/></Wrap>;
      })}
      <Captions t={t} scenes={SC}/>
      <Chrome t={t}/>
    </AbsoluteFill>
  );
};
