import _u8  # ويندوز: UTF-8 للعربي
import wave,numpy as np
import sys, os
S=os.path.abspath(sys.argv[1])+"/"
import json
SR=48000
_c=json.load(open(S+"caps.json"))
_s=json.load(open(S+"sfx.json"))
VEND=_c["total"]; OUTRO=_s["outro"]; DUR=VEND+OUTRO
n=int(DUR*SR)+SR
buf=np.zeros(n)
rng=np.random.RandomState(11)
def add(sig,t0,g=1.0):
    i=max(0,int(t0*SR)); j=min(n,i+len(sig)); buf[i:j]+=sig[:j-i]*g
def lp(x,a0,a1):
    y=np.empty_like(x); z=0.0
    for i in range(len(x)):
        a=a0+(a1-a0)*(i/len(x)); z+=a*(x[i]-z); y[i]=z
    return y
def whoosh(dur=0.34,up=True):
    L=int(dur*SR); t=np.arange(L)/SR
    x=rng.randn(L)
    y=lp(x,0.03,0.30) if up else lp(x,0.30,0.03)
    y/= (np.max(np.abs(y))+1e-9)
    env=np.sin(np.pi*np.clip(t/dur,0,1))**1.6
    return y*env
def thud(f0=135,f1=58,dur=0.30):
    L=int(dur*SR); t=np.arange(L)/SR
    f=f0*np.exp(np.log(f1/f0)*t/dur)
    ph=2*np.pi*np.cumsum(f)/SR
    s=np.sin(ph)*np.exp(-t/0.085)
    s+=lp(rng.randn(L),0.35,0.05)*np.exp(-t/0.006)*0.35
    return s/ (np.max(np.abs(s))+1e-9)
def tap(dur=0.09):
    L=int(dur*SR); t=np.arange(L)/SR
    s=lp(rng.randn(L),0.22,0.05)*np.exp(-t/0.013)
    s*=np.minimum(1.0,t/0.0012)
    return s/(np.max(np.abs(s))+1e-9)

W1=whoosh(0.34,True); W2=whoosh(0.30,False); TH=thud(); TP=tap()
for t0 in _s.get("whoosh_up",[]):   add(W1,t0,0.085)
for t0 in _s.get("whoosh_down",[]): add(W2,t0,0.075)
for t0 in _s.get("thud",[]):        add(TH,t0,0.115)
for t0 in _s.get("tap",[]):         add(TP,t0,0.075)
# ملفات صوت جاهزة (مؤثرات مولّدة بالذكاء الاصطناعي من هيقزفيلد، أو أي ملف) — بنفس sfx.json:
#   "files": [ {"f":"assets/sfx_drums.mp3", "t":27.9, "g":0.5}, ... ]     g = المستوى (0.3-0.6 عادةً)
import subprocess
for e in _s.get("files",[]):
    p=e["f"] if os.path.isabs(e["f"]) else S+e["f"]
    if not os.path.exists(p): print("⚠️ ما لقيت",e["f"]); continue
    raw=subprocess.run(["ffmpeg","-v","error","-i",p,"-f","f32le","-ac","1","-ar",str(SR),"-"],capture_output=True).stdout
    sig=np.frombuffer(raw,dtype="<f4").astype(float)
    if e.get("dur"): sig=sig[:int(e["dur"]*SR)]
    if len(sig)>64:
        fo=min(len(sig),int(0.04*SR)); sig[-fo:]*=np.linspace(1,0,fo)      # نهاية ناعمة بلا طقطقة
        add(sig,float(e["t"]),float(e.get("g",0.45)))
buf=np.clip(buf,-0.95,0.95)
pcm=(buf*32767).astype('<i2')
st=np.repeat(pcm[:,None],2,axis=1).ravel()
w=wave.open(S+"sfx.wav","wb");w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR)
w.writeframes(st.tobytes());w.close()
print("sfx ok peak",round(float(np.max(np.abs(buf))),3),"dur",round(len(pcm)/SR,2))
