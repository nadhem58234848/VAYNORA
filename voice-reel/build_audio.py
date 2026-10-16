"""صوت الريل: ماستر للصوت + SFX تلقائية من reel.json (قواعد حسب نوع المشهد) → out/audio.wav
   استعمال: python3 build_audio.py  (الملفات في sfx/<id>.mp3 من Mixkit)"""
import json, subprocess
R = json.load(open('src/reel.json'))
PK = {'2364':0.04,'3005':0.02,'1109':0,'2870':0,'1704':1.2,'2350':0.64,'1461':0.16,'1487':0.16,'2356':0.12,
      '2354':0.04,'1143':0.54,'1346':1.06,'1486':0.6,'494':0,'1329':0}
C = []  # (وقت الذروة, id, dB, مدة, offset)
add = lambda t, f, g, d, off=0: t is not None and C.append((t, f, g, d, off))
TR = {'whip':('1461',-12,1.2), 'zoom':('2364',-12,0.8), 'blob':('2350',-11,2.0)}
for i, s in enumerate(R['scenes']):
    if i and s.get('tr','whip') in TR: f, g, d = TR[s.get('tr','whip')]; add(s['s'], f, g, d)
    ty = s['type']
    if ty == 'stamp': add(s['at'], '1143', -9, 2.5)
    if ty == 'icon':
        add(s.get('at', s['s']) + 0.1, '2356', -13, 0.3)
        if s.get('x'): add(s['x'], '1487', -10, 0.3); add(s['x'] + 0.12, '1487', -11, 0.3)
        add(s.get('labelAt'), '3005', -10, 0.2)
    if ty == 'gauge': add(s.get('labelAt'), '2364', -11, 0.8)
    if ty == 'cards':
        for it in s['items']:
            add(it['at'], '3005', -10, 0.2)
            for m in it['marks']: add(m['at'], '1109', -13 if m['ok'] else -15, 0.6)
        if s.get('banner'): add(s['banner']['at'], '2870', -11, 1.6)
    if ty == 'strike':
        add(s['strikeAt'], '1487', -10, 0.3); add(s['iconAt'], '1346', -8, 2.6); add(s['labelAt'], '1329', 2, 2.2)
        add(s['subAt'], '2356', -13, 0.3)
    if ty == 'versus':
        for r in (s['a'], s['b']):
            add(r['at'], '3005', -10, 0.2)
            if r['icon'] == 'chain': add(r['resAt'], '494', -9, 2.0, 2.0)
            else: add(r['resAt'], '2356', -12, 0.3)
    if ty == 'vay':
        if s.get('cut') is not False: add(s.get('cut', (s['s'] + s['e']) / 2), '1461', -15, 1.2)
        ov = s.get('overlay') or {}
        for it in ov.get('items', []):
            if ov.get('kind') == 'plate': add(it['at'], '1143', -10, 2.5)
            else: add(it['at'], '3005', -10, 0.2)
            if ov.get('check'): add(it['at'] + 0.05, '1109', -13, 0.6)
    if ty == 'end': add(s['s'] + 0.5, '2354', -10, 1.0)
    for x in s.get('sfx', []): add(*x)          # إضافات يدوية [t, id, dB, dur]
D = R['duration']
ins, fc = ['-i', 'public/voice_raw.wav'], []
fc.append('[0:a]aformat=sample_rates=48000:channel_layouts=stereo,highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=3,'
          'loudnorm=I=-15:TP=-1.5:LRA=9,apad=whole_dur=%s[v]' % D)
for k, (t, f, g, d, off) in enumerate(C):
    st = max(0, t - (PK.get(f, 0) if off == 0 else 0)); fo = min(0.3, d / 3)
    ins += ['-i', f'sfx/{f}.mp3']
    fc.append(f"[{k+1}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim={off}:{off+d},asetpts=PTS-STARTPTS,volume={g}dB,"
              f"afade=t=in:d={0.3 if f in ('1329','494') else 0.005},afade=t=out:st={d-fo}:d={fo},adelay={int(st*1000)}|{int(st*1000)}[s{k}]")
n = len(C)
fc.append('[v]' + ''.join(f'[s{i}]' for i in range(n)) + f'amix=inputs={n+1}:normalize=0:duration=first,'
          f'loudnorm=I=-14:TP=-1:LRA=11,atrim=0:{D}[out]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '48000', '-c:a', 'pcm_s16le', 'out/audio.wav'], check=True)
print('sfx cues:', n)
