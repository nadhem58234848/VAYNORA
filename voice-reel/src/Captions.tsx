/* كابشن فوق (كيما الريلز المرجعية): كلمة كلمة تطلع مع الصوت، 2-3 كلمات في السطر،
   Cairo 800 أبيض بحاشية كحلة، الكلمة القوية بالأحمر. فوق المود الأحمر: نص أكحل والقوية Bone. */
import {T} from './theme';
import {p, back, lerp, abs} from './util';
import reel from './reel.json';
type Wd = {t:string; s:number; e:number; hot?:boolean};
const LINES: Wd[][] = (reel as any).lines;

export const Captions = ({t, scenes}:{t:number; scenes:any[]}) => {
  const sc = scenes.find(s => t >= s.s && t < s.e);
  if (!sc || sc.type === 'end' || sc.noCaps) return null;
  const li = LINES.findIndex((l, i) => t >= l[0].s - 0.05 && (i === LINES.length-1 ? t < l[l.length-1].e + 0.6 : t < LINES[i+1][0].s - 0.05));
  if (li < 0) return null;
  const L = LINES[li], red = sc.mood === 'red' && sc.type !== 'vay', img = sc.type === 'vay';
  const last = L[L.length-1].e, out = p(t, last + 0.35, last + 0.6);
  return (
    <div style={abs({left:70, right:70, top:250, display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'0 22px',
      direction:'rtl', opacity:1-out})}>
      {L.map((w, i) => {
        const k = p(t, w.s - 0.04, w.s + 0.16); if (k <= 0) return null;
        const box = img && w.hot;   // فوق التصاور: الكلمة القوية في لوحة Crimson باش تبان فوق الأحمر
        const col = box ? T.bone : w.hot ? (red ? T.bone : T.signal) : (red ? T.night : T.bone);
        return <span key={i} style={{fontWeight:800, fontSize: w.hot ? 96 : 82, lineHeight:1.25, color:col,
          WebkitTextStroke: red || box ? undefined : '3px #000', background: box ? T.crimson : undefined, borderRadius: box ? 14 : undefined, padding: box ? '0 16px' : undefined, paintOrder:'stroke fill', textShadow: img ? '0 4px 20px rgba(0,0,0,0.7)' : undefined,
          display:'inline-block', opacity:k, transform:`translateY(${lerp(26,0,back(k))}px) scale(${lerp(0.7,1,back(k))})`}}>{w.t}</span>;
      })}
    </div>
  );
};
