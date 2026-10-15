# -*- coding: utf-8 -*-
import _u8  # ويندوز: UTF-8 للعربي
"""التفريغ بتوقيت كل كلمة — يختار أفضل موديل حسب الجهاز تلقائياً.
  python3 01b_transcribe.py <work>                    → يكتب <work>/a.json
  python3 01b_transcribe.py <work> --model small      → موديل بعينه
  python3 01b_transcribe.py <work> --clip 12.5 14.2   → يعيد تفريغ مقطع وحده (لجملة غلط فيها) → clip.json
• كرت شاشة NVIDIA: large-v3 (أدق للعربي) — ~٢٠ ثانية لدقيقة كلام.
• بدون كرت: medium — ~٣-٦ دقائق لدقيقة كلام.
• لو فيه <work>/written.txt (النص اللي قراه من التيليبرومبتر) يُعطى لوِسبر كتلميح → تفريغ أدق بكثير."""
import json, os, subprocess, sys, warnings
warnings.filterwarnings("ignore")
W = os.path.abspath(sys.argv[1]); A = sys.argv[2:]
def arg(k, d=None):
    return A[A.index(k) + 1] if k in A and A.index(k) + 1 < len(A) else d

import torch, whisper
cuda = torch.cuda.is_available()
vram = torch.cuda.get_device_properties(0).total_memory / 1e9 if cuda else 0
model = arg("--model") or ("large-v3" if vram >= 9 else "turbo" if cuda else "medium")
dev = "cuda" if cuda else "cpu"
print(f"الجهاز: {'كرت ' + torch.cuda.get_device_name(0) if cuda else 'المعالج (بدون كرت شاشة)'} · الموديل: {model}")

clip = None
if "--clip" in A:
    i = A.index("--clip"); clip = (float(A[i + 1]), float(A[i + 2]))
wav = os.path.join(W, "clip.wav" if clip else "a.wav")
cmd = ["ffmpeg", "-v", "error"] + (["-ss", str(clip[0]), "-to", str(clip[1])] if clip else []) + \
      ["-i", os.path.join(W, "src.mov"), "-vn", "-ac", "1", "-ar", "16000", "-y", wav]
subprocess.check_call(cmd)

prompt = None
wp = os.path.join(W, "written.txt")
if os.path.exists(wp):
    prompt = open(wp, encoding="utf-8").read().strip()[:600]   # التلميح محدود (~٢٢٤ توكن)
    print("📝 أستخدم النص المكتوب كتلميح للتفريغ")

m = whisper.load_model(model, device=dev)
r = m.transcribe(wav, language="ar", word_timestamps=True, fp16=cuda, initial_prompt=prompt,
                 condition_on_previous_text=False, verbose=None)
if clip:                                   # نرجّع التوقيتات لتايم-لاين الفيديو الأصلي
    for s in r["segments"]:
        s["start"] += clip[0]; s["end"] += clip[0]
        for w in s.get("words", []): w["start"] += clip[0]; w["end"] += clip[0]
out = os.path.join(W, "clip.json" if clip else "a.json")
json.dump(r, open(out, "w", encoding="utf-8"), ensure_ascii=False)
print(f"✅ {os.path.basename(out)} — {len(r['segments'])} جملة")
for i, s in enumerate(r["segments"]):
    print(f"  {i:2d} [{s['start']:6.2f}] ({len(s.get('words', []))} كلمة) {s['text'].strip()}")
