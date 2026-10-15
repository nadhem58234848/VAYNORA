# -*- coding: utf-8 -*-
import _u8  # ويندوز: UTF-8 للعربي
"""قص السكتات + زوم مختلف لكل مقطع + استخراج الفريمات.  python3 03_cut_zoom.py <workdir>
الدقة والإطارات من output.json (4K أو 1080 · 30 أو 60). يطلّع cutz.mp4 ومجلد vfr/ جاهز للرسم."""
import json, subprocess, sys, os, shutil, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _prof
from importlib import import_module
probe = import_module("00b_quality").probe

W=os.path.abspath(sys.argv[1]); SRC=os.path.join(W,"src.mov")
P=_prof.load(W); OW,OH,FPS=P["w"],P["h"],P["fps"]
k=json.load(open(os.path.join(W,"cut.json")))["keep"]
_tp=os.path.join(W,"theme.json")
GRADE=json.load(open(_tp)).get("grade",False) if os.path.exists(_tp) else False
Z=[1.00,1.08,1.00,1.06,1.00,1.12,1.04,1.14,1.00,1.08,1.00,1.05,1.10,1.00]; ANCH=0.30

# ⚠️ الأبعاد بعد التدوير: آيفون يخزّن العمودي 3840×2160 ويكتب «دوّره 90°».
# ffmpeg يدوّر الصورة تلقائياً قبل الفلاتر، فلازم نحسب القص على الأبعاد المعروضة لا المخزّنة.
s=probe(SRC); SW,SH=s["w"],s["h"]
if SW>SH: print("⚠️ الفيديو أفقي — نقص منه عمودي من النص (تأكد إن المتحدث بالوسط)")
print(f"المصدر {SW}×{SH} · {s['fps']:g} إطار  →  الإخراج {OW}×{OH} · {FPS} إطار")

fc=[];v=[];a=[]
for i,(st,en) in enumerate(k):
    z=Z[i%len(Z)]
    # نص عمودي 9:16 من المصدر (لو كان أفقياً) ثم الزوم
    bw,bh=(SW,SH) if SW*16<=SH*9+2 else (int(SH*9/16)//2*2,SH)
    cw=int(bw/z)//2*2; ch=int(bh/z)//2*2
    x=(SW-cw)//2; y=int((SH-ch)*ANCH)
    fc.append(f"[0:v]trim=start={st:.4f}:end={en:.4f},setpts=PTS-STARTPTS,crop={cw}:{ch}:{x}:{y},"
              f"scale={OW}:{OH}:flags=lanczos,setsar=1[v{i}]")
    fc.append(f"[0:a]atrim=start={st:.4f}:end={en:.4f},asetpts=PTS-STARTPTS,"
              f"afade=t=in:d=0.012,afade=t=out:st={max(0,en-st-0.012):.4f}:d=0.012[a{i}]")   # بلا طقطقة عند القص
    v.append(f"[v{i}]"); a.append(f"[a{i}]")
fc.append("".join(v)+f"concat=n={len(k)}:v=1:a=0[vc]")
fc.append("".join(a)+f"concat=n={len(k)}:v=0:a=1[ac]")
# التدرّج اللوني اختياري تماماً — الافتراضي مطفي (الفيديو يطلع بألوانه الأصلية)
_g = ("eq=brightness=0.015:saturation=0.96:contrast=1.05,"
      "colorbalance=rs=0.02:gs=0.005:bs=-0.02,") if GRADE else ""
# ⚠️ مصدر آيفون HDR يجي موسوماً bt2020/HLG — أي متصفح يحترم الوسم ويطلّع صورة برتقالية.
# setparams يعيد الوسم لـbt709 فتطلع الألوان طبيعية بكل مكان.
fc.append(f"[vc]fps={FPS}," + _g +
          "setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709,format=yuv420p[vo]")
print("التدرّج اللوني:", "مفعّل" if GRADE else "مطفي (ألوان أصلية)")
fc.append("[ac]afade=t=in:st=0:d=0.06,dynaudnorm=f=200:g=5:p=0.9[ao]")

big=OW>=2000
tail=["-map","[vo]","-map","[ao]","-c:v","libx264","-preset","fast" if big else "medium","-crf","16",
      "-c:a","aac","-b:a","192k","-movflags","+faststart","-y",os.path.join(W,"cutz.mp4")]
# فلتر طويل (مقاطع كثيرة) يتجاوز حد سطر الأوامر بويندوز (8 آلاف حرف) — نكتبه بملف.
# ffmpeg 7+ يقرأه بـ-/filter_complex، والأقدم بـ-filter_complex_script.
fcf=os.path.join(W,".cut_filter.txt"); open(fcf,"w").write(";\n".join(fc))
r=1
for opt in ("-/filter_complex","-filter_complex_script"):
    r=subprocess.call(["ffmpeg","-v","error","-stats","-i",SRC,opt,fcf]+tail)
    if r==0: break
if r: sys.exit(r)

# الفريمات للرسم — بنفس الدقة والإطارات
VF=os.path.join(W,"vfr")
if os.path.isdir(VF): shutil.rmtree(VF)
os.makedirs(VF)
r=subprocess.call(["ffmpeg","-v","error","-stats","-i",os.path.join(W,"cutz.mp4"),"-vf",f"fps={FPS}",
    "-q:v","2" if big else "3","-y",os.path.join(VF,"%05d.jpg")])
n=len(glob.glob(os.path.join(VF,"*.jpg")))
print(f"✅ cutz.mp4 + {n} فريم بمجلد vfr ({OW}×{OH} · {FPS} إطار)")
sys.exit(r)
