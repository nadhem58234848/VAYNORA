"""وضع VAY: سكريبت (vay.json) → صوت. الأفضل: ElevenLabs (ناظم رفض أصوات Microsoft المجانية: "موش واقعية")
   — ولّد صوت كل مشهد في ElevenLabs (صوت «Mohamed, Premium Arabic MSA») وحط "audio": "public/el/1.mp3" في المشهد،
   والتوقيت يتحسب وحدو. بلا "audio" = Edge TTS المجاني (للتجربة فقط).
   + توقيت كل كلمة → public/voice_raw.wav + src/reel.json (lines + scenes).
   استعمال: python3 tts.py scripts/vay-demo.json
   في النص: *كلمة* = كلمة قوية (حمراء + نبضة). overlay.at = أول كلمة من المشهد تبدا بها."""
import asyncio, json, re, ssl, subprocess, sys, os
import edge_tts, edge_tts.communicate as cm
if os.path.exists('/root/.ccr/ca-bundle.crt'):   # بروكسي الكلاود
    cm._SSL_CTX = ssl.create_default_context(cafile='/root/.ccr/ca-bundle.crt')
S = json.load(open(sys.argv[1]))
VOICE, RATE, GAP = S.get('voice', 'ar-TN-HediNeural'), S.get('rate', '+0%'), S.get('gap', 0.35)
os.makedirs('out/tts', exist_ok=True)

def speech_spans(f):
    """مقاطع الكلام في ملف (بين السكتات) → [(بداية, نهاية)]"""
    log = subprocess.run(['ffmpeg', '-i', f, '-af', 'silencedetect=noise=-35dB:d=0.18', '-f', 'null', '-'], capture_output=True, text=True).stderr
    ss = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]; se = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
    D = dur(f); spans, cur = [], 0.0
    if se and ss and ss[0] < 0.05: cur = se.pop(0); ss.pop(0)
    for a, b in zip(ss, se + [D]): spans.append((cur, a)); cur = b
    if not ss or (se and len(se) >= len(ss)): spans.append((cur, D)) if D - cur > 0.15 else None
    return [x for x in spans if x[1] - x[0] > 0.12]

def align(text, f):
    """توقيت تقريبي للكلمات في صوت جاهز (ElevenLabs): الجمل على مقاطع الكلام، والكلمات حسب طولها"""
    phr = [x.split() for x in re.split(r'(?<=[.،,؟?!:…])\s+', text.replace('*', '')) if x.strip()]
    sp = speech_spans(f)
    if len(sp) != len(phr):                       # ما تطابقوش: الكل على مدة الكلام
        a, b = (sp[0][0], sp[-1][1]) if sp else (0, dur(f))
        tot = sum(len(w) + 2 for p_ in phr for w in p_); sp, acc = [], a
        for p_ in phr:
            d = (b - a) * sum(len(w) + 2 for w in p_) / tot; sp.append((acc, acc + d)); acc += d
    out = []
    for p_, (a, b) in zip(phr, sp):
        tot = sum(len(w) + 1 for w in p_); acc = a
        for w in p_:
            d = (b - a) * (len(w) + 1) / tot; out.append({'t': w, 's': acc, 'e': acc + d * 0.92}); acc += d
    return out

async def say(i, text, audio=None):
    if audio:                                      # صوت جاهز (ElevenLabs …) بدل TTS
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', audio, f'out/tts/{i}.mp3'], check=True)
        return align(text, f'out/tts/{i}.mp3')
    words = []
    c = edge_tts.Communicate(text.replace('*', ''), VOICE, rate=RATE, pitch=S.get('pitch', '+0Hz'), boundary='WordBoundary')
    with open(f'out/tts/{i}.mp3', 'wb') as f:
        async for ch in c.stream():
            if ch['type'] == 'audio': f.write(ch['data'])
            elif ch['type'] == 'WordBoundary':
                words.append({'t': ch['text'], 's': ch['offset']/1e7, 'e': (ch['offset']+ch['duration'])/1e7})
    return words

def dur(f):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))

async def main():
    t, lines, scenes, parts = S.get('lead', 0.3), [], [], []
    for i, sc in enumerate(S['scenes']):
        ws = await say(i, sc['text'], sc.get('audio'))
        hot = {re.sub(r'[^\w]', '', h) for h in re.findall(r'\*(.+?)\*', sc['text']) for h in h.split()}
        toks = re.findall(r'\S+', sc['text'].replace('*', ''))        # الكلمات بعلامات الوقف متاعها
        d = dur(f'out/tts/{i}.mp3'); s0 = t
        for j, w in enumerate(ws):
            w['s'] = round(w['s'] + t, 2); w['e'] = round(w['e'] + t, 2)
            if j < len(toks) and re.sub(r'[^\w]', '', toks[j]) == re.sub(r'[^\w]', '', w['t']): w['t'] = toks[j]
            if re.sub(r'[^\w]', '', w['t']) in hot: w['hot'] = True
        # سطور كابشن: 2-4 كلمات، نقطع عند علامات الوقف
        cur = []
        for w in ws:
            cur.append(w)
            if len(cur) >= 4 or (len(cur) >= 2 and re.search(r'[.،,؟?!:…]$', w['t'])): lines.append(cur); cur = []
        if cur: (lines[-1].extend(cur) if len(cur) == 1 and lines and len(lines[-1]) < 5 else lines.append(cur))
        parts.append((i, t)); t += d + GAP
        out = {k: v for k, v in sc.items() if k != 'text'}
        out.update({'type': sc.get('type', 'vay'), 's': round(s0 - (0 if i else S.get('lead', 0.3)), 2), 'e': round(t, 2)})
        for ov in out.get('overlay', {}).get('items', []):     # at: كلمة ← وقت
            if isinstance(ov.get('at'), str):
                m = next((w for w in ws if re.sub(r'[^\w]', '', w['t']).startswith(re.sub(r'[^\w]', '', ov['at']))), ws[0]); ov['at'] = m['s']
        scenes.append(out)
    end = S.get('endDur', 2.2)
    scenes.append({'type': 'end', 's': round(t, 2), 'e': round(t + end, 2), 'tr': 'zoom', **({'cta': S['cta']} if 'cta' in S else {})})
    D = round(t + end, 2)
    ins, fc = [], []
    for k, (i, st) in enumerate(parts):
        ins += ['-i', f'out/tts/{i}.mp3']; fc.append(f'[{k}:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay={int(st*1000)}|{int(st*1000)}[a{k}]')
    fc.append(''.join(f'[a{k}]' for k in range(len(parts))) + f'amix=inputs={len(parts)}:normalize=0,apad=whole_dur={D},atrim=0:{D}[o]')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fc), '-map', '[o]', '-c:a', 'pcm_s16le', 'public/voice_raw.wav'], check=True)
    json.dump({'duration': D, 'lines': lines, 'scenes': scenes}, open('src/reel.json', 'w'), ensure_ascii=False, indent=1)
    print('duration', D, 'scenes', len(scenes), 'lines', len(lines))
asyncio.run(main())
