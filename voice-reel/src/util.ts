import {interpolate, Easing} from 'remotion';
export const p = (t:number, a:number, b:number) =>
  interpolate(t, [a, b], [0, 1], {extrapolateLeft:'clamp', extrapolateRight:'clamp'});
export const ease = (k:number) => Easing.out(Easing.cubic)(k);
export const eio  = (k:number) => Easing.inOut(Easing.cubic)(k);
export const back = (k:number) => Easing.out(Easing.back(1.9))(k);
export const lerp = (a:number, b:number, k:number) => a + (b - a) * k;
export const hx = (h:string) => { const s = h.replace('#',''); return [0,2,4].map(i => parseInt(s.slice(i,i+2),16)); };
export const rgba = (h:string, a:number) => { const c = hx(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };
export const abs = (s:React.CSSProperties):React.CSSProperties => ({position:'absolute', ...s});
/* ظهور/اختفاء ناعم داخل نافذة [A,B] */
export const fade = (t:number, A:number, B:number, d=0.22) => Math.min(p(t,A,A+d), 1-p(t,B-d,B));
/* نبضة قصيرة بعد لحظة x (0→1→0) */
export const pulse = (t:number, x:number, d=0.35) => (t < x || t > x+d) ? 0 : Math.sin(Math.PI*(t-x)/d);
