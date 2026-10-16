/* ═══ مكتبة المشاهد — كل مشهد يتحكم فيه reel.json ═══
   منطقة الرسم: y 560…1500 (الكابشن فوق 250…520، واجهة إنستغرام تحت 1550+).
   مسطّح: بلا تدرّجات ولا صور مولّدة "مزيّفة". الأحمر للكلمة/العلامة، Crimson للوحات. */
import {Img, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {T, FPS} from './theme';
import {p, ease, back, lerp, rgba, abs, fade, pulse} from './util';

type Props = {sc:any; t:number; red:boolean};
const ink = (red:boolean) => (red ? T.night : T.bone);
const mut = (red:boolean) => (red ? 'rgba(13,13,13,0.55)' : T.mut);
const acc = (red:boolean) => (red ? T.bone : T.signal);
const card = (red:boolean, on=false):React.CSSProperties => ({
  background: red ? 'rgba(13,13,13,0.14)' : T.panel, borderRadius:32, boxSizing:'border-box',
  border: on ? `5px solid ${red ? T.night : T.signal}` : `3px solid ${red ? 'rgba(13,13,13,0.25)' : 'rgba(244,241,236,0.10)'}`,
});

/* ── علامة ✓ / ✗ ── */
export const Mark = ({ok, k=1, size=64, red=false}:{ok:boolean; k?:number; size?:number; red?:boolean}) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{opacity:k, transform:`scale(${lerp(0.3,1,back(k))})`, flex:'none'}}>
    <circle cx="20" cy="20" r="18" fill={ok ? (red ? T.night : T.signal) : (red ? 'rgba(13,13,13,0.2)' : 'rgba(244,241,236,0.12)')}/>
    {ok ? <path d="M11 21 L18 27 L29 14" stroke={red ? T.signal : T.bone} strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        : <path d="M13 13 L27 27 M27 13 L13 27" stroke={red ? T.night : 'rgba(244,241,236,0.6)'} strokeWidth="4.5" strokeLinecap="round"/>}
  </svg>
);

/* ── أيقونات مسطّحة (viewBox 200) — رسم بالخط ثم تعبئة ── */
const ICONS: Record<string, (c:{ink:string; acc:string; k:number; t:number}) => JSX.Element> = {
  drop: ({ink, acc, k}) => (<g>
    <path d="M100 18 C 62 78, 44 108, 44 134 A56 56 0 0 0 156 134 C156 108, 138 78, 100 18Z" fill="none" stroke={ink} strokeWidth="9"
      pathLength={1} strokeDasharray="1" strokeDashoffset={1-k} strokeLinejoin="round"/>
    <clipPath id="dc"><path d="M100 18 C 62 78, 44 108, 44 134 A56 56 0 0 0 156 134 C156 108, 138 78, 100 18Z"/></clipPath>
    <rect x="30" y={lerp(200, 70, ease(p(k,0.5,1)))} width="140" height="140" fill={acc} clipPath="url(#dc)"/>
    <path d="M78 128 Q 80 150 100 158" stroke={ink} strokeWidth="8" fill="none" strokeLinecap="round" opacity={p(k,0.8,1)}/>
  </g>),
  hook: ({ink, k, t}) => { const sw = Math.sin(t*3.2)*6*(1-k*0.6);
    return (<g transform={`translate(110 ${lerp(-160,0,back(Math.min(1,k*1.3)))}) rotate(${sw} 0 0)`}>
      <line x1="0" y1="0" x2="0" y2="70" stroke={ink} strokeWidth="4" opacity="0.6"/>
      <circle cx="0" cy="80" r="9" fill="none" stroke={ink} strokeWidth="6"/>
      <path d="M0 89 L0 150 A34 34 0 0 1 -68 150 L-68 128 L-54 140" stroke={ink} strokeWidth="11" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </g>); },
  flame: ({ink, acc, k, t}) => { const f = (n:number) => Math.sin(t*9+n)*0.5 + Math.sin(t*13.7+n*2)*0.5;
    const fl = (sc:number, col:string, n:number) => { const w=70*sc, h=165*sc*(1+0.06*f(n)), s=8*f(n+1);
      return <path d={`M 0 0 C ${-w} ${-h*0.25}, ${-w*0.55+s} ${-h*0.7}, ${s} ${-h} C ${w*0.3+s} ${-h*0.62}, ${w} ${-h*0.42}, ${w*0.82} ${-h*0.12} C ${w*0.7} ${-h*0.02}, ${w*0.3} 0, 0 0 Z`} fill={col}/>; };
    return (<g transform={`translate(100 188) scale(${lerp(0.1,1,back(k))})`}>{fl(1.15, acc, 0)}{fl(0.7, ink, 1.7)}</g>); },
  chain: ({ink, acc, k}) => (<g>{[0,1,2,3].map(j => { const kk = back(p(k, j*0.18, j*0.18+0.4));
    return <rect key={j} x={18+j*40} y={j%2 ? 78 : 62} width="64" height={j%2 ? 44 : 76} rx="22" fill="none" stroke={j===1 ? acc : ink} strokeWidth="11"
      transform={`translate(0 ${lerp(-40,0,kk)})`} opacity={kk > 0 ? 1 : 0}/>; })}</g>),
  bulb: ({ink, acc, k}) => (<g>
    {[0,1,2,3,4].map(j => { const a = Math.PI*(0.1 + j*0.2), r1 = 82, r2 = 82 + 22*ease(p(k,0.6,1));
      return <line key={j} x1={100-Math.cos(a)*r1} y1={88-Math.sin(a)*r1} x2={100-Math.cos(a)*r2} y2={88-Math.sin(a)*r2} stroke={acc} strokeWidth="9" strokeLinecap="round" opacity={p(k,0.6,0.8)}/>; })}
    <path d="M70 140 C 40 115, 45 50, 100 46 C 155 50, 160 115, 130 140 Z" fill={k > 0.55 ? acc : 'none'} stroke={ink} strokeWidth="9" pathLength={1} strokeDasharray="1" strokeDashoffset={1-Math.min(1,k*1.8)} strokeLinejoin="round"/>
    <rect x="74" y="148" width="52" height="14" rx="6" fill={ink} opacity={p(k,0.3,0.5)}/>
    <rect x="80" y="168" width="40" height="12" rx="6" fill={ink} opacity={p(k,0.4,0.6)}/>
  </g>),
  eye: ({ink, acc, k}) => (<g>
    <path d="M20 100 Q 100 30 180 100 Q 100 170 20 100 Z" fill="none" stroke={ink} strokeWidth="9" pathLength={1} strokeDasharray="1" strokeDashoffset={1-k}/>
    <circle cx="100" cy="100" r={30*back(p(k,0.5,1))} fill={acc}/></g>),
};
const Icon = ({name, k, t, red, size=420}:{name:string; k:number; t:number; red:boolean; size?:number}) => {
  const C = ICONS[name]; if (!C) return null;
  return <svg width={size} height={size} viewBox="0 0 200 200" style={{overflow:'visible'}}>{C({ink:ink(red), acc:acc(red), k, t})}</svg>;
};

/* ① stamp — لوحة Crimson مايلة تنزل بقوة على الكلمة {word, at, sub?, bigMark?} */
const Stamp = ({sc, t, red}:Props) => {
  const k = p(t, sc.at, sc.at + 0.3), q = p(t, sc.s, sc.s + 0.5);
  return (<>
    {sc.ghost && <div style={abs({left:0, right:0, top:520, textAlign:'center', fontWeight:900, fontSize:760, lineHeight:1,
      color:'transparent', WebkitTextStroke:`6px ${red ? 'rgba(13,13,13,0.3)' : 'rgba(244,241,236,0.08)'}`,
      transform:`scale(${lerp(0.8,1,ease(q))}) rotate(${lerp(-8,0,ease(q))}deg)`})}>{sc.ghost}</div>}
    <div style={abs({left:0, right:0, top:860, display:'flex', justifyContent:'center'})}>
      <div style={{transform:`rotate(-4deg) scale(${k > 0 ? lerp(1.9,1,back(k)) : 0})`, opacity:k, background: red ? T.night : T.crimson,
        color: T.bone, borderRadius:28, padding:'18px 64px', fontWeight:900, fontSize:150, lineHeight:1.3}}>{sc.word}</div>
    </div>
    {sc.sub && <div style={abs({left:0, right:0, top:1150, textAlign:'center', fontWeight:700, fontSize:58, color:mut(red),
      opacity:p(t, sc.subAt ?? sc.at+0.3, (sc.subAt ?? sc.at+0.3)+0.3)})}>{sc.sub}</div>}
  </>);
};

/* ② icon — أيقونة كبيرة ترسم روحها + كلمة {icon, at, label, labelAt, sub, subAt, x?:at} */
const IconScene = ({sc, t, red}:Props) => {
  const k = p(t, sc.at ?? sc.s, (sc.at ?? sc.s) + (sc.dur ?? 0.8));
  const lk = p(t, sc.labelAt ?? sc.s + 0.4, (sc.labelAt ?? sc.s + 0.4) + 0.3);
  const xk = sc.x ? ease(p(t, sc.x, sc.x + 0.25)) : 0, xk2 = sc.x ? ease(p(t, sc.x + 0.12, sc.x + 0.37)) : 0;
  return (<>
    <div style={abs({left:0, right:0, top:600, display:'flex', justifyContent:'center'})}>
      <div style={{position:'relative'}}>
        <Icon name={sc.icon} k={k} t={t} red={red}/>
        {xk > 0 && <svg width="420" height="420" viewBox="0 0 200 200" style={abs({left:0, top:0})}>
          <g stroke={acc(red)} strokeWidth="14" strokeLinecap="round">
            <line x1="30" y1="30" x2={lerp(30,170,xk)} y2={lerp(30,170,xk)}/>
            {xk2 > 0 && <line x1="170" y1="30" x2={lerp(170,30,xk2)} y2={lerp(30,170,xk2)}/>}</g></svg>}
      </div>
    </div>
    <div style={abs({left:0, right:0, top:1060, textAlign:'center', fontWeight:900, fontSize:120, color:ink(red), opacity:lk,
      transform:`scale(${lerp(1.35,1,back(lk))})`})} dangerouslySetInnerHTML={{__html: hl(sc.label, red)}}/>
    {sc.sub && <div style={abs({left:80, right:80, top:1240, textAlign:'center', fontWeight:700, fontSize:54, color:mut(red),
      opacity:p(t, sc.subAt, sc.subAt + 0.3), transform:`translateY(${lerp(20,0,ease(p(t, sc.subAt, sc.subAt+0.3)))}px)`})}>{sc.sub}</div>}
  </>);
};
/* *كلمة* = بالأحمر */
const hl = (s:string = '', red:boolean) => s.replace(/\*(.+?)\*/g, `<span style="color:${acc(red)}">$1</span>`);

/* ③ gauge — مقياس بإبرة {label, labelAt, sub, subAt, value, at} */
const Gauge = ({sc, t, red}:Props) => {
  const k = ease(p(t, sc.at ?? sc.s + 0.3, sc.atEnd ?? sc.e - 0.4)), v = sc.value ?? 0.82;
  const cx = 540, cy = 1040, r = 300, ang = Math.PI * (1 - v * k);
  const arc = (f0:number, f1:number) => { const a0 = Math.PI*(1-f0), a1 = Math.PI*(1-f1);
    return `M ${cx+Math.cos(a0)*r} ${cy-Math.sin(a0)*r} A ${r} ${r} 0 0 1 ${cx+Math.cos(a1)*r} ${cy-Math.sin(a1)*r}`; };
  const lab = p(t, sc.labelAt, sc.labelAt + 0.3);
  return (<>
    <svg width="1080" height="1920" style={abs({left:0, top:0})}>
      <path d={arc(0,1)} stroke={red ? 'rgba(13,13,13,0.2)' : 'rgba(244,241,236,0.12)'} strokeWidth="40" fill="none" strokeLinecap="round"/>
      {k > 0.01 && <path d={arc(0, v*k)} stroke={acc(red)} strokeWidth="40" fill="none" strokeLinecap="round"/>}
      {[0,0.25,0.5,0.75,1].map(f => { const g = Math.PI*(1-f);
        return <line key={f} x1={cx+Math.cos(g)*(r-48)} y1={cy-Math.sin(g)*(r-48)} x2={cx+Math.cos(g)*(r-78)} y2={cy-Math.sin(g)*(r-78)} stroke={mut(red)} strokeWidth="6"/>; })}
      <line x1={cx} y1={cy} x2={cx + Math.cos(ang)*(r-60)} y2={cy - Math.sin(ang)*(r-60)} stroke={ink(red)} strokeWidth="14" strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r="26" fill={ink(red)}/>
    </svg>
    <div style={abs({left:0, right:0, top:640, textAlign:'center', fontWeight:700, fontSize:50, color:mut(red), opacity:p(t, sc.subAt, sc.subAt+0.3)})}>{sc.sub}</div>
    <div style={abs({left:0, right:0, top:1120, textAlign:'center', fontWeight:900, fontSize:110, color:ink(red), opacity:lab,
      transform:`translateY(${lerp(24,0,ease(lab))}px)`})} dangerouslySetInnerHTML={{__html: hl(sc.label, red)}}/>
  </>);
};

/* ④ cards — بطاقات فوق بعضها، كل وحدة باسمها وعلاماتها {items:[{n, at, marks:[{l, ok, at}]}], banner:{text, at}} */
const Cards = ({sc, t, red}:Props) => {
  const items = sc.items as any[];
  const bk = sc.banner ? p(t, sc.banner.at, sc.banner.at + 0.35) : 0;
  return (<>
    {items.map((c, i) => {
      const k = p(t, c.at, c.at + 0.35); if (k <= 0) return null;
      const live = t >= c.at && (i === items.length-1 || t < items[i+1].at);
      const win = sc.banner && i === items.length-1 && bk > 0;
      return (
        <div key={i} style={abs({left:90, right:90, top:600 + i*250, height:215, opacity:(live ? 1 : 0.42)*ease(k),
          transform:`translateX(${lerp(-120,0,ease(k))}px) scale(${live ? 1 : 0.95})`})}>
          <div style={{...card(red, live || win), width:'100%', height:'100%', display:'flex', alignItems:'center', padding:'0 46px', gap:30}}>
            <div style={{fontWeight:900, fontSize:76, color:ink(red), flex:1}}>{c.n}</div>
            {c.marks.map((m:any, j:number) => { const mk = p(t, m.at, m.at + 0.3);
              return (<div key={j} style={{display:'flex', alignItems:'center', gap:12, opacity: mk > 0 ? 1 : 0.18,
                transform:`scale(${1 + 0.12*pulse(t, m.at, 0.35)})`}}>
                <Mark ok={m.ok} k={mk > 0 ? mk : 1} size={64} red={red}/>
                <span style={{fontWeight:800, fontSize:52, color: m.ok ? ink(red) : mut(red), textDecoration: m.ok ? 'none' : 'line-through'}}>{m.l}</span>
              </div>); })}
          </div>
        </div>);
    })}
    {bk > 0 && <div style={abs({left:0, right:0, top:600 + items.length*250 + 30, display:'flex', justifyContent:'center'})}>
      <div style={{background: red ? T.night : T.crimson, color:T.bone, fontWeight:900, fontSize:64, borderRadius:999, padding:'10px 54px',
        transform:`rotate(-2deg) scale(${lerp(0.4,1,back(bk))})`, opacity:bk}}>{sc.banner.text}</div></div>}
  </>);
};

/* ⑤ strike — كلمة تتشطب، ثم أيقونة وكلمة جديدة {word, at, strikeAt, icon, iconAt, label, labelAt, sub, subAt} */
const Strike = ({sc, t, red}:Props) => {
  const w = p(t, sc.at, sc.at + 0.25), st = ease(p(t, sc.strikeAt, sc.strikeAt + 0.3)), out = p(t, sc.iconAt - 0.35, sc.iconAt - 0.05);
  const ik = p(t, sc.iconAt, sc.iconAt + 0.6), lk = p(t, sc.labelAt, sc.labelAt + 0.3), sk = p(t, sc.subAt, sc.subAt + 0.3);
  return (<>
    {out < 1 && <div style={abs({left:0, right:0, top:860, textAlign:'center', opacity:w*(1-out), transform:`translateY(${lerp(0,-80,out)}px)`})}>
      <span style={{position:'relative', fontWeight:900, fontSize:130, color:mut(red)}}>{sc.word}
        <span style={abs({right:-10, top:'54%', height:16, width:`calc(${st*100}% + 20px)`, background: red ? T.night : T.signal, borderRadius:8})}/></span>
    </div>}
    {ik > 0 && <div style={abs({left:0, right:0, top:560, display:'flex', justifyContent:'center'})}><Icon name={sc.icon} k={ik} t={t} red={red} size={480}/></div>}
    <div style={abs({left:0, right:0, top:1060, textAlign:'center', fontWeight:900, fontSize:140, color:ink(red), opacity:lk,
      transform:`scale(${lerp(1.4,1,back(lk))})`})} dangerouslySetInnerHTML={{__html: hl(sc.label, red)}}/>
    <div style={abs({left:0, right:0, top:1260, display:'flex', justifyContent:'center', opacity:sk})}>
      <div style={{background: red ? T.night : T.crimson, color:T.bone, fontWeight:800, fontSize:56, borderRadius:20, padding:'6px 40px',
        transform:`translateY(${lerp(30,0,back(sk))}px)`}}>{sc.sub}</div></div>
  </>);
};

/* ⑥ versus — طريقين، المنطوق يشعل وأخوه يخفت {a:{cond, at, res, resAt, icon}, b:{...}} */
const Versus = ({sc, t, red}:Props) => {
  const rows = [sc.a, sc.b];
  return (<>{rows.map((r:any, i:number) => {
    const k = p(t, r.at, r.at + 0.3); if (k <= 0) return null;
    const live = i === 1 ? true : t < rows[1].at, rk = p(t, r.resAt, r.resAt + 0.6);
    return (
      <div key={i} style={abs({left:80, right:80, top:600 + i*450, height:400, opacity:(live ? 1 : 0.4)*ease(k),
        transform:`translateY(${lerp(60,0,ease(k))}px) scale(${live ? 1 : 0.94})`})}>
        <div style={{...card(red, live), width:'100%', height:'100%', display:'flex', alignItems:'center', padding:'0 50px', gap:30}}>
          <div style={{flex:1}}>
            <div style={{fontWeight:700, fontSize:56, color:mut(red)}}>{r.cond}</div>
            <div style={{fontWeight:900, fontSize:88, lineHeight:1.25, whiteSpace:"nowrap", color: i === 0 ? acc(red) : ink(red), opacity:p(t, r.resAt, r.resAt+0.25),
              transform:`translateX(${lerp(-40,0,back(p(t, r.resAt, r.resAt+0.3)))}px)`}}>{r.res}</div>
          </div>
          <Icon name={r.icon} k={rk} t={t} red={red} size={280}/>
        </div>
      </div>);
  })}</>);
};

/* ⑦ img — رسمة/صورة في بطاقة مدوّرة مع Ken Burns خفيف {src, label?} (الصور ما تغطيش الشاشة كاملة) */
const ImgCard = ({sc, t, red}:Props) => {
  const z = lerp(1.08, 1, ease(p(t, sc.s, sc.e)));
  return (<div style={abs({left:90, right:90, top:580, height:900, borderRadius:40, overflow:'hidden', border:`3px solid ${red ? T.night : T.crimson}`})}>
    <Img src={staticFile(sc.src)} style={{width:'100%', height:'100%', objectFit:'cover', transform:`scale(${z})`}}/></div>);
};

/* ⑧ broll — فيديو (Mixkit مصبوغ) في بطاقة مدوّرة {src} */
const BRoll = ({sc, t, red}:Props) => (
  <Sequence from={Math.round(sc.s*FPS)} durationInFrames={Math.max(1, Math.round((sc.e-sc.s)*FPS)+2)} layout="none">
    <div style={abs({left:90, right:90, top:580, height:900, borderRadius:40, overflow:'hidden', border:`3px solid ${red ? T.night : T.crimson}`})}>
      <OffthreadVideo src={staticFile(sc.src)} muted style={{width:'100%', height:'100%', objectFit:'cover', transform:`scale(${lerp(1,1.08,p(t,sc.s,sc.e))})`}}/></div>
  </Sequence>
);

/* ⑨ end — الشعار + الشعار اللفظي + الهاندل */
const End = ({sc, t}:Props) => {
  const k = p(t, sc.s + 0.1, sc.s + 0.6), s = p(t, sc.s + 0.45, sc.s + 0.8), h = p(t, sc.s + 0.7, sc.s + 1.0);
  return (<>
    <div style={abs({left:0, right:0, top:560, display:'flex', justifyContent:'center'})}>
      <Img src={staticFile('emblem.svg')} style={{width:380, opacity:k, transform:`scale(${lerp(0.6,1,back(k))})`}}/></div>
    <div style={abs({left:340, right:340, top:1070, height:6, background:T.crimson, transform:`scaleX(${ease(s)})`})}/>
    <div style={abs({left:0, right:0, top:1110, textAlign:'center', fontWeight:900, fontSize:92, color:T.bone, opacity:s})}>
      اصنع من <span style={{color:T.signal}}>الألم</span> قوة</div>
    <div style={abs({left:0, right:0, top:1260, textAlign:'center', fontWeight:700, fontSize:46, color:T.mut, opacity:h})}>{sc.cta ?? T.handle}</div>
  </>);
};


/* ⑩ vay — وضع VAY: تصويرة كاملة (4:5 → 9:16 cover) تتحرك (Ken Burns) + قطعة زوم في النص = "لقطة ثانية"
   {img, move: in|out|left|right, cut?: وقت اللقطة الثانية (افتراضي النص), overlay:{kind: plate|chips|versus, check?, items:[{l, at}]}} */
const Vay = ({sc, t}:Props) => {
  const cut = sc.cut ?? (sc.s + sc.e) / 2, second = t >= cut && sc.cut !== false;
  const k = second ? p(t, cut, sc.e) : p(t, sc.s, cut);
  const mv = sc.move ?? 'in';
  let sx = 1, tx = 0;
  if (mv === 'in') sx = lerp(1.0, 1.1, k); else if (mv === 'out') sx = lerp(1.1, 1.0, k);
  else { sx = 1.08; tx = (mv === 'left' ? -1 : 1) * lerp(-50, 50, k); }
  const z = second ? sx * 1.32 : sx, oy = second ? (sc.focusY ?? 0.38) : 0.5;
  const flash = second ? 1 - p(t, cut, cut + 0.18) : 0;
  const ov = sc.overlay;
  return (<>
    <div style={abs({inset:0, overflow:'hidden', background:T.night})}>
      <Img src={staticFile(sc.img)} style={{width:'100%', height:'100%', objectFit:'cover',
        transform:`translateX(${tx}px) scale(${z})`, transformOrigin:`50% ${oy*100}%`}}/>
      {sc.mood === 'red' && <div style={abs({inset:0, background:T.signal, mixBlendMode:'color', opacity:0.7})}/>}
      {flash > 0 && <div style={abs({inset:0, background:T.bone, opacity:0.18*flash})}/>}
    </div>
    {ov?.kind === 'plate' && ov.items.map((it:any, i:number) => { const pk = p(t, it.at, it.at + 0.3); if (pk <= 0) return null;
      return <div key={i} style={abs({left:0, right:0, top:1180, display:'flex', justifyContent:'center'})}>
        <div style={{transform:`rotate(-4deg) scale(${lerp(1.9,1,back(pk))})`, opacity:pk, background:T.crimson, color:T.bone,
          borderRadius:24, padding:'12px 56px', fontWeight:900, fontSize:120, lineHeight:1.3}}>{it.l}</div></div>; })}
    {ov?.kind === 'chips' && <div style={abs({right:70, top:1120, display:'flex', flexDirection:'column', alignItems:'flex-start', gap:22})}>
      {ov.items.map((it:any, i:number) => { const ck = p(t, it.at, it.at + 0.3); if (ck <= 0) return null;
        const live = i === ov.items.length - 1 || t < ov.items[i+1].at;
        return <div key={i} style={{display:'flex', alignItems:'center', gap:18, background:'rgba(13,13,13,0.86)', borderRadius:999,
          padding:'10px 34px 10px 24px', border:`3px solid ${live ? T.signal : 'rgba(244,241,236,0.15)'}`, opacity:ck,
          transform:`translateX(${lerp(80,0,back(ck))}px)`}}>
          {ov.check && <Mark ok k={ck} size={56}/>}
          <span style={{fontWeight:800, fontSize:62, color:T.bone}}>{it.l}</span></div>; })}
    </div>}
    {ov?.kind === 'versus' && <div style={abs({left:60, right:60, top:1170, display:'flex', gap:30, justifyContent:'center'})}>
      {ov.items.map((it:any, i:number) => { const ck = p(t, it.at, it.at + 0.3); if (ck <= 0) return null;
        return <div key={i} style={{flex:1, background:'rgba(13,13,13,0.88)', borderRadius:28, padding:'26px 20px', textAlign:'center',
          border:`4px solid ${i ? T.signal : 'rgba(244,241,236,0.18)'}`, opacity:ck, transform:`scale(${lerp(0.6,1,back(ck))})`}}>
          <div style={{fontWeight:900, fontSize: i ? 76 : 64, color: i ? T.signal : T.bone}}>{it.l}</div></div>; })}
    </div>}
  </>);
};

export const SCENES: Record<string, (p:Props) => JSX.Element | null> = {
  stamp: Stamp, icon: IconScene, gauge: Gauge, cards: Cards, strike: Strike, versus: Versus, img: ImgCard, broll: BRoll, end: End, vay: Vay,
};
