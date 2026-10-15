# -*- coding: utf-8 -*-
import _u8  # ويندوز: UTF-8 للعربي
"""يفحص الفيديو اللي وصل ويحدد جودة الإخراج.
  python3 00b_quality.py <work>                  → يطبع وش وصلنا + الخيارات المناسبة (بصيغة JSON بآخر سطر)
  python3 00b_quality.py <work> set 4k 60        → يكتب <work>/output.json
  python3 00b_quality.py <work> set 1080 30 tiktok
الجودة: 4k | 1080   ·   الإطارات: 30 | 60   ·   المنصة (اختياري): instagram | tiktok | shorts
كل السكربتات بعدها تقرأ output.json — ما فيه رقم دقة أو إطارات ثابت بأي مكان."""
import json, os, subprocess, sys

W = os.path.abspath(sys.argv[1]); SRC = os.path.join(W, "src.mov")

def probe(path):
    """الأبعاد كما تُعرض فعلاً — آيفون يخزّن الفيديو العمودي بالعرض ويكتب زاوية التدوير بالميتاداتا."""
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
        "stream=width,height,r_frame_rate,avg_frame_rate,nb_frames,codec_name,color_transfer:stream_side_data=rotation:stream_tags=rotate",
        "-show_entries", "format=duration,size", "-of", "json", path], capture_output=True, text=True)
    d = json.loads(r.stdout or "{}"); s = (d.get("streams") or [{}])[0]; f = d.get("format", {})
    w, h = int(s.get("width", 0)), int(s.get("height", 0))
    rot = 0
    for sd in s.get("side_data_list", []) or []:
        if "rotation" in sd: rot = int(float(sd["rotation"]))
    if not rot and s.get("tags", {}).get("rotate"): rot = int(s["tags"]["rotate"])
    if abs(rot) % 180 == 90: w, h = h, w
    # ⚠️ آيفون أحياناً يكتب 59.94 بالهيدر والفيديو فعلياً ~30 إطار (معدّل متغيّر).
    # نعتمد المعدّل الحقيقي (عدد الفريمات ÷ المدة) — وإلا نطلّع «60» كلها فريمات مكررة.
    def rate(x):
        n, _, dd = (x or "0/1").partition("/")
        return float(n) / float(dd or 1) if float(dd or 1) else 0
    fps = rate(s.get("avg_frame_rate")) or rate(s.get("r_frame_rate")) or 30
    return {"w": w, "h": h, "rot": rot, "fps": round(fps, 3), "codec": s.get("codec_name"),
            "hdr": s.get("color_transfer") in ("arib-std-b67", "smpte2084"),
            "dur": round(float(f.get("duration", 0)), 2), "mb": round(int(f.get("size", 0)) / 1e6)}

if __name__ == "__main__":
    if not os.path.exists(SRC): sys.exit("❌ ما لقيت src.mov بمجلد الشغل")
    s = probe(SRC)
    short = min(s["w"], s["h"]); is4k = short >= 2000; is60 = s["fps"] >= 49
    if len(sys.argv) > 2 and sys.argv[2] == "set":
        q = (sys.argv[3] if len(sys.argv) > 3 else "1080").lower()
        fps = int(sys.argv[4]) if len(sys.argv) > 4 else 30
        plat = (sys.argv[5] if len(sys.argv) > 5 else "instagram").lower()
        k4 = q in ("4k", "2160", "uhd")
        if k4 and not is4k:
            print("⚠️ المصدر مو 4K — رفع الدقة ما يضيف تفاصيل. نمشي 1080."); k4 = False
        if fps == 60 and not is60:
            print("ℹ️ الكاميرا ~30 إطار: الرسوم تطلع 60 ناعمة، ولقطات الكاميرا نفسها تبقى 30.")
        out = {"w": 2160 if k4 else 1080, "h": 3840 if k4 else 1920, "scale": 2 if k4 else 1,
               "fps": 60 if fps == 60 else 30, "platform": plat,
               "label": ("4K" if k4 else "1080p") + f" · {60 if fps == 60 else 30} إطار", "src": s}
        json.dump(out, open(os.path.join(W, "output.json"), "w"), ensure_ascii=False, indent=1)
        print(f"✅ الإخراج: {out['label']} · المنصة: {plat}")
        sys.exit(0)

    mm, ss = divmod(int(s["dur"]), 60)
    print(f"وصلني: {s['w']}×{s['h']} · {round(s['fps'])} إطار · {mm}:{ss:02d} دقيقة · {s['mb']} ميقا"
          + (" · HDR آيفون (نصلّح ألوانه تلقائياً)" if s["hdr"] else ""))
    opts = []
    if is4k and is60: opts.append(["4k", 60, "4K · 60 إطار", "أعلى جودة وأنعم حركة — الأبطأ (~٤ أضعاف وقت 1080)"])
    if is4k:          opts.append(["4k", 30, "4K · 30 إطار", "وضوح كامل بوقت أقل"])
    if is60:          opts.append(["1080", 60, "1080p · 60 إطار", "حركة ناعمة وسريع"])
    if not is60:      opts.append(["4k" if is4k else "1080", 60, ("4K" if is4k else "1080p") + " · 60 للرسوم",
                                   "الموشن قرافيكس أنعم — الكاميرا تبقى 30 · ضعف وقت الرسم"])
    opts.append(["1080", 30, "1080p · 30 إطار", "الأسرع والأخف — يكفي لأغلب الريلز"])
    rec = opts[0] if is4k else opts[-1]
    print("الخيارات:"); [print(f"  - {o[2]}: {o[3]}" + ("  ← المقترح" if o is rec else "")) for o in opts]
    if not is4k: print("ℹ️ المصدر مو 4K، فما نعرض 4K — رفع الدقة ما يضيف وضوح.")
    print(json.dumps({"src": s, "is4k": is4k, "is60": is60, "options": opts, "recommended": rec}, ensure_ascii=False))
